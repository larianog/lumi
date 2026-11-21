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
  storageKey?: string;
};

export type MaterialUploadResponse = {
  material: StudyMaterialDto;
  cached: boolean;
};
