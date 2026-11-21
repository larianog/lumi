export type ProfileType = 'adult' | 'child';

export type Profile = {
  id: string;
  type: ProfileType;
  firstName: string;
  lastName: string;
  birthDate: string;
  avatar: number;
  createdAt: string;
};

export type Family = {
  id: string;
  phone: string;
  profiles: Profile[];
  createdAt: string;
};

export type FamilyRecord = Family & {
  normalizedPhone: string;
  passwordHash: string;
  passwordSalt: string;
};

export type ActivityCompletion = {
  id: string;
  familyId: string;
  profileId: string;
  activityId: string;
  activityTitle: string;
  completedAt: string;
};

export type StudyMaterialExtractionStatus = 'processing' | 'ready' | 'failed';

export type StudyMaterial = {
  id: string;
  familyId: string;
  profileId: string;
  /** Shared demo families are isolated by the browser session that uploaded the material. */
  demoSessionId?: string;
  originalName: string;
  mimeType: string;
  size: number;
  sha256: string;
  storageKey?: string;
  extractedText?: string;
  extractionStatus: StudyMaterialExtractionStatus;
  extractionModel: string;
  promptVersion: string;
  errorCode?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  purgedAt?: string;
  completedAt?: string;
};

export type SessionRecord = {
  id: string;
  tokenHash: string;
  familyId: string;
  isDemo: boolean;
  createdAt: string;
  expiresAt: string;
  adultVerifiedUntil?: string;
};

export type Database = {
  families: FamilyRecord[];
  completions: ActivityCompletion[];
  materials: StudyMaterial[];
  sessions: SessionRecord[];
  version: 3;
};
