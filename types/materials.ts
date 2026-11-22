import type { StudyMaterialExtractionStatus } from './database';

export type StudyMaterialDto = {
  id: string;
  profileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  extractionStatus: StudyMaterialExtractionStatus;
  errorCode?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  purgedAt?: string;
  completedAt?: string;
  extractedText?: string;
  /** Summary of the tutoring analysis; answers never leave the server. */
  title?: string;
  subject?: string;
  questionCount?: number;
  storageKey?: string;
  /** Whether the material is related to didactic/educational purposes. */
  isDidactic?: boolean;
};

export type MaterialUploadResponse = {
  material: StudyMaterialDto;
  cached: boolean;
  profileId?: string;
  isDidactic?: boolean;
};
