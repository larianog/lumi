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
  sessions: SessionRecord[];
  version: 2;
};
