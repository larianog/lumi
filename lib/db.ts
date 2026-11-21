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
} from '@/types/database';

const DB_PATH = path.join(process.cwd(), 'data', 'lumi-db.json');
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const ADULT_ACCESS_TTL_MS = 1000 * 60 * 15;
const DEMO_FAMILY_ID = 'demo-family';
const DEMO_PASSWORD = 'lumi123';
const scrypt = promisify(scryptCallback);

const initialDb: Database = {
  families: [],
  completions: [],
  sessions: [],
  version: 2,
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

  if (parsed.version === 2) {
    return {
      families: parsed.families as FamilyRecord[] ?? [],
      completions: parsed.completions ?? [],
      sessions: parsed.sessions ?? [],
      version: 2,
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
    sessions: [],
    version: 2,
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

async function updateDb<T>(mutate: (db: Database) => Promise<T> | T): Promise<T> {
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

export async function addProfileToFamily(familyId: string, profile: Profile) {
  return updateDb((db) => {
    const family = db.families.find((candidate) => candidate.id === familyId);
    if (!family) throw new Error('FAMILY_NOT_FOUND');
    family.profiles.push(profile);
    return toPublicFamily(family);
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

export async function verifyAdultAccess(token: string | undefined, password: string) {
  const session = await getSession(token);
  if (!session) return false;

  let matches = false;
  if (session.isDemo) {
    const supplied = Buffer.from(password);
    const expected = Buffer.from(DEMO_PASSWORD);
    matches = supplied.length === expected.length && timingSafeEqual(supplied, expected);
  } else {
    const db = await readDb();
    const family = db.families.find((candidate) => candidate.id === session.familyId);
    matches = Boolean(family && await passwordMatches(password, family));
  }

  if (!matches) return false;
  await updateDb((db) => {
    const current = db.sessions.find((candidate) => candidate.id === session.id);
    if (current) current.adultVerifiedUntil = new Date(Date.now() + ADULT_ACCESS_TTL_MS).toISOString();
  });
  return true;
}

export async function hasAdultAccess(token: string | undefined) {
  const session = await getSession(token);
  return Boolean(session?.adultVerifiedUntil && Date.parse(session.adultVerifiedUntil) > Date.now());
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
