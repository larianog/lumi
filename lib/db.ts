import { promises as fs } from 'node:fs';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { promisify } from 'node:util';
import type {
  ActivityCompletion,
  Database,
  Family,
  FamilyRecord,
  Profile,
  SessionRecord,
  HomeworkAnalysis,
  SessionRecording,
  StudyMaterial,
} from '@/types/database';

const DB_PATH = path.join(process.cwd(), 'data', 'lumi-db.json');
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const DEMO_FAMILY_ID = 'demo-family';
const scrypt = promisify(scryptCallback);

const initialDb: Database = {
  families: [],
  completions: [],
  materials: [],
  recordings: [],
  sessions: [],
  version: 3,
};

const demoFamily: Family = {
  id: DEMO_FAMILY_ID,
  phone: '(11) 99999-2026',
  createdAt: '2026-01-01T12:00:00.000Z',
  profiles: [
    {
      id: 'demo-adult',
      type: 'adult',
      firstName: 'Marina',
      lastName: 'Silva',
      birthDate: '1991-04-18',
      avatar: 0,
      createdAt: '2026-01-01T12:00:00.000Z',
    },
    {
      id: 'demo-lia',
      type: 'child',
      firstName: 'Lia',
      lastName: 'Silva',
      birthDate: '2018-08-12',
      avatar: 1,
      createdAt: '2026-01-01T12:00:00.000Z',
    },
    {
      id: 'demo-caio',
      type: 'child',
      firstName: 'Caio',
      lastName: 'Silva',
      birthDate: '2016-03-03',
      avatar: 2,
      createdAt: '2026-01-01T12:00:00.000Z',
    },
  ],
};

let writeQueue: Promise<unknown> = Promise.resolve();

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '');
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function toPublicFamily(family: FamilyRecord): Family {
  const { id, phone, profiles, createdAt } = family;
  return { id, phone, profiles, createdAt };
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return { passwordHash: derived.toString('hex'), passwordSalt: salt };
}

async function passwordMatches(password: string, family: FamilyRecord) {
  const derived = (await scrypt(password, family.passwordSalt, 64)) as Buffer;
  const expected = Buffer.from(family.passwordHash, 'hex');
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

async function ensureDbExists() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(initialDb, null, 2));
  }
}

async function readDb(): Promise<Database> {
  await ensureDbExists();
  const content = await fs.readFile(DB_PATH, 'utf8');
  const parsed = JSON.parse(content) as Partial<Database> & {
    families?: Array<Partial<FamilyRecord> & { password?: string }>;
  };

  if (parsed.version === 3) {
    return {
      families: parsed.families as FamilyRecord[] ?? [],
      completions: parsed.completions ?? [],
      materials: parsed.materials ?? [],
      recordings: parsed.recordings ?? [],
      sessions: parsed.sessions ?? [],
      version: 3,
    };
  }

  const legacyFamilies = (parsed.families ?? []) as Array<Partial<FamilyRecord> & { password?: string }>;
  const families = await Promise.all(legacyFamilies.map(async (family) => {
    const credentials = family.passwordHash && family.passwordSalt
      ? { passwordHash: family.passwordHash, passwordSalt: family.passwordSalt }
      : await hashPassword(family.password ?? randomBytes(24).toString('hex'));

    return {
      id: family.id ?? crypto.randomUUID(),
      phone: family.phone ?? '',
      normalizedPhone: normalizePhone(family.phone ?? ''),
      profiles: family.profiles ?? [],
      createdAt: family.createdAt ?? new Date().toISOString(),
      ...credentials,
    } satisfies FamilyRecord;
  }));

  const migrated: Database = {
    families,
    completions: (parsed.completions ?? []).map((completion) => ({
      ...completion,
      familyId: completion.familyId ?? families.find((family) =>
        family.profiles.some((profile) => profile.id === completion.profileId))?.id ?? '',
    })),
    materials: parsed.materials ?? [],
    recordings: parsed.recordings ?? [],
    sessions: parsed.sessions ?? [],
    version: 3,
  };
  await writeDb(migrated);
  return migrated;
}

async function writeDb(db: Database) {
  await ensureDbExists();
  const temporaryPath = `${DB_PATH}.${process.pid}.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(db, null, 2));
  await fs.rename(temporaryPath, DB_PATH);
}

export async function updateDb<T>(mutate: (db: Database) => Promise<T> | T): Promise<T> {
  const operation = writeQueue.then(async () => {
    const db = await readDb();
    const result = await mutate(db);
    await writeDb(db);
    return result;
  });
  writeQueue = operation.catch(() => undefined);
  return operation;
}

export function getDemoFamily(): Family {
  return structuredClone(demoFamily);
}

export async function createFamily(phone: string, password: string, profile: Profile) {
  const normalizedPhone = normalizePhone(phone);
  const credentials = await hashPassword(password);

  return updateDb((db) => {
    if (db.families.some((family) => family.normalizedPhone === normalizedPhone)) {
      throw new Error('PHONE_ALREADY_EXISTS');
    }

    const family: FamilyRecord = {
      id: crypto.randomUUID(),
      phone: phone.trim(),
      normalizedPhone,
      profiles: [profile],
      createdAt: new Date().toISOString(),
      ...credentials,
    };
    db.families.push(family);
    return toPublicFamily(family);
  });
}

export async function authenticateFamily(phone: string, password: string) {
  const db = await readDb();
  const family = db.families.find((candidate) => candidate.normalizedPhone === normalizePhone(phone));
  if (!family || !(await passwordMatches(password, family))) return null;
  return toPublicFamily(family);
}

/** Adds several profiles in one write (signup step 2: one or more children). */
export async function addProfilesToFamily(familyId: string, profiles: Profile[]) {
  return updateDb((db) => {
    const family = db.families.find((candidate) => candidate.id === familyId);
    if (!family) throw new Error('FAMILY_NOT_FOUND');
    family.profiles.push(...profiles);
    return toPublicFamily(family);
  });
}

/** Saves the Lumi avatar a child picked. Returns null when the profile is not a child of this family. */
export async function setProfileLumiAvatar(familyId: string, profileId: string, lumiAvatar: string) {
  return updateDb((db) => {
    const family = db.families.find((candidate) => candidate.id === familyId);
    const profile = family?.profiles.find((candidate) => candidate.id === profileId && candidate.type === 'child');
    if (!profile) return null;
    profile.lumiAvatar = lumiAvatar;
    return { ...profile };
  });
}

export async function createSession(familyId: string, isDemo = false) {
  const token = randomBytes(32).toString('base64url');
  const now = Date.now();

  await updateDb((db) => {
    db.sessions = db.sessions.filter((session) => Date.parse(session.expiresAt) > now);
    db.sessions.push({
      id: crypto.randomUUID(),
      tokenHash: hashToken(token),
      familyId,
      isDemo,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    });
  });

  return token;
}

/** Logout: forget this browser's session (the cookie is cleared by the route). */
export async function deleteSession(token: string | undefined) {
  if (!token) return;
  const tokenHash = hashToken(token);
  await updateDb((db) => {
    db.sessions = db.sessions.filter((session) => session.tokenHash !== tokenHash);
  });
}

export async function getSession(token: string | undefined): Promise<SessionRecord | null> {
  if (!token) return null;
  const db = await readDb();
  const session = db.sessions.find((candidate) => candidate.tokenHash === hashToken(token));
  if (!session || Date.parse(session.expiresAt) <= Date.now()) return null;
  return session;
}

export async function getFamilyForSession(token: string | undefined) {
  const session = await getSession(token);
  if (!session) return null;
  if (session.isDemo) return { family: getDemoFamily(), session };

  const db = await readDb();
  const family = db.families.find((candidate) => candidate.id === session.familyId);
  return family ? { family: toPublicFamily(family), session } : null;
}

export async function recordCompletion(
  familyId: string,
  profileId: string,
  activityId: string,
  activityTitle: string,
) {
  return updateDb((db) => {
    const completion: ActivityCompletion = {
      id: crypto.randomUUID(),
      familyId,
      profileId,
      activityId,
      activityTitle,
      completedAt: new Date().toISOString(),
    };
    db.completions.unshift(completion);
    return completion;
  });
}

export async function getCompletionsByProfile(familyId: string, profileId: string) {
  const db = await readDb();
  return db.completions.filter((item) => item.familyId === familyId && item.profileId === profileId);
}

export async function getCompletionsByFamily(familyId: string) {
  const db = await readDb();
  return db.completions.filter((item) => item.familyId === familyId);
}

type StudyMaterialReservation = Omit<
  StudyMaterial,
  'extractionStatus' | 'createdAt' | 'updatedAt'
>;

function belongsToMaterialScope(
  material: StudyMaterial,
  familyId: string,
  demoSessionId?: string,
) {
  return material.familyId === familyId
    && (demoSessionId ? material.demoSessionId === demoSessionId : !material.demoSessionId);
}

export async function reserveStudyMaterial(input: StudyMaterialReservation) {
  return updateDb((db) => {
    const nowMs = Date.now();
    const reusable = db.materials.find((material) =>
      belongsToMaterialScope(material, input.familyId, input.demoSessionId)
      && material.profileId === input.profileId
      && material.sha256 === input.sha256
      && material.extractionModel === input.extractionModel
      && material.promptVersion === input.promptVersion
      && material.literacyLevel === input.literacyLevel
      && material.extractionStatus !== 'failed'
      && Date.parse(material.expiresAt) > nowMs
      && (material.extractionStatus === 'ready' || Date.parse(material.updatedAt) > nowMs - 2 * 60 * 1000),
    );

    if (reusable) return { material: reusable, created: false };

    const now = new Date(nowMs).toISOString();
    const material: StudyMaterial = {
      ...input,
      extractionStatus: 'processing',
      createdAt: now,
      updatedAt: now,
    };
    db.materials.unshift(material);
    return { material, created: true };
  });
}

export async function markStudyMaterialReady(
  id: string,
  storageKey: string,
  extractedText: string,
  analysis?: HomeworkAnalysis,
  isDidactic?: boolean,
) {
  return updateDb((db) => {
    const material = db.materials.find((candidate) => candidate.id === id);
    if (!material) throw new Error('MATERIAL_NOT_FOUND');
    material.storageKey = storageKey;
    material.extractedText = extractedText;
    material.analysis = analysis;
    material.isDidactic = isDidactic;
    material.extractionStatus = 'ready';
    material.errorCode = undefined;
    material.updatedAt = new Date().toISOString();
    return material;
  });
}

export async function markStudyMaterialFailed(
  id: string,
  errorCode: string,
  storageKey?: string,
) {
  return updateDb((db) => {
    const material = db.materials.find((candidate) => candidate.id === id);
    if (!material) throw new Error('MATERIAL_NOT_FOUND');
    material.storageKey = storageKey;
    material.extractionStatus = 'failed';
    material.errorCode = errorCode;
    material.updatedAt = new Date().toISOString();
    return material;
  });
}

export async function getStudyMaterial(id: string) {
  const db = await readDb();
  return db.materials.find((material) => material.id === id) ?? null;
}

export async function getStudyMaterialsByProfile(
  familyId: string,
  profileId: string,
  demoSessionId?: string,
) {
  const db = await readDb();
  return db.materials.filter((material) =>
    belongsToMaterialScope(material, familyId, demoSessionId)
    && material.profileId === profileId,
  );
}

export async function getStudyMaterialsByFamily(familyId: string, demoSessionId?: string) {
  const db = await readDb();
  return db.materials.filter((material) =>
    belongsToMaterialScope(material, familyId, demoSessionId),
  );
}

export async function completeStudyMaterial(id: string) {
  return updateDb((db) => {
    const material = db.materials.find((candidate) => candidate.id === id);
    if (!material) throw new Error('MATERIAL_NOT_FOUND');
    material.completedAt ??= new Date().toISOString();
    material.updatedAt = new Date().toISOString();
    return material;
  });
}

export async function purgeExpiredStudyMaterials() {
  return updateDb((db) => {
    const now = Date.now();
    const purgedAt = new Date(now).toISOString();
    const storageKeys: string[] = [];

    for (const material of db.materials) {
      if (material.purgedAt || Date.parse(material.expiresAt) > now) continue;
      if (material.storageKey) storageKeys.push(material.storageKey);
      material.storageKey = undefined;
      material.extractedText = undefined;
      material.analysis = undefined;
      material.purgedAt = purgedAt;
      material.updatedAt = purgedAt;
    }

    return storageKeys;
  });
}

function belongsToRecordingScope(recording: SessionRecording, familyId: string, demoSessionId?: string) {
  return recording.familyId === familyId
    && (demoSessionId ? recording.demoSessionId === demoSessionId : !recording.demoSessionId);
}

export async function saveRecording(recording: SessionRecording) {
  return updateDb((db) => {
    db.recordings.unshift(recording);
    return recording;
  });
}

export async function getRecording(id: string, familyId: string, demoSessionId?: string) {
  const db = await readDb();
  return db.recordings.find((recording) =>
    recording.id === id && belongsToRecordingScope(recording, familyId, demoSessionId)) ?? null;
}

export async function getRecordingsByFamily(familyId: string, demoSessionId?: string) {
  const db = await readDb();
  return db.recordings.filter((recording) => belongsToRecordingScope(recording, familyId, demoSessionId));
}

/** Removes the record and returns its file key so the caller can delete the audio. */
export async function deleteRecording(id: string, familyId: string, demoSessionId?: string) {
  return updateDb((db) => {
    const recording = db.recordings.find((candidate) =>
      candidate.id === id && belongsToRecordingScope(candidate, familyId, demoSessionId));
    if (!recording) return null;
    db.recordings = db.recordings.filter((candidate) => candidate.id !== id);
    return recording.storageKey;
  });
}

/** Drops expired recordings and returns their file keys for deletion. */
export async function purgeExpiredRecordings() {
  return updateDb((db) => {
    const now = Date.now();
    const expired = db.recordings.filter((recording) => Date.parse(recording.expiresAt) <= now);
    if (expired.length === 0) return [];
    db.recordings = db.recordings.filter((recording) => Date.parse(recording.expiresAt) > now);
    return expired.map((recording) => recording.storageKey);
  });
}
