export type ProfileType = 'adult' | 'child';

export type Profile = {
  id: string;
  type: ProfileType;
  firstName: string;
  lastName: string;
  birthDate: string;
  avatar: number;
  /** Lumi avatar chosen by the child; missing values use the animated Plush. */
  lumiAvatar?: string;
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

/** How well the child reads on their own; chosen by the parent on upload. */
export type LiteracyLevel = 'pre_reader' | 'emergent' | 'fluent';

export type HomeworkQuestion = {
  number: string;
  /** Faithful transcription of the question. */
  statement: string;
  /** Child-safe text or word box shown beside the question. */
  supportContent?: string;
  /** Labels of the answer blanks, in worksheet order. */
  answerSlots?: string[];
  /** Pictures, diagrams or layout the child needs (e.g. "5 maçãs desenhadas"). */
  visualElements: string;
  skill: string;
  /** Server-only: lets Lumi check answers. Never sent to the browser. */
  expectedAnswer: string;
  steps: string[];
  hints: string[];
};

/** Tutor-ready reading of a worksheet, produced by the vision model. */
export type HomeworkAnalysis = {
  readable: boolean;
  unreadableReason: string;
  title: string;
  subject: string;
  estimatedGrade: string;
  generalInstructions: string;
  questions: HomeworkQuestion[];
  notesForTutor: string;
  /** Whether the material is related to didactic/educational purposes. */
  isDidactic?: boolean;
};

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
  /** Child-safe transcription (instructions + questions, no answers). Shown in the UI. */
  extractedText?: string;
  /** Server-only tutoring brief with expected answers. Never exposed in DTOs. */
  analysis?: HomeworkAnalysis;
  literacyLevel?: LiteracyLevel;
  /** Whether the material is related to didactic/educational purposes. */
  isDidactic?: boolean;
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
  /** Avatar choices are private to this demo visit. */
  demoLumiAvatars?: Record<string, string>;
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
