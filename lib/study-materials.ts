import { purgeExpiredStudyMaterials } from '@/lib/db';
import { deleteMaterialFiles } from '@/lib/material-storage';
import type { SessionRecord, StudyMaterial } from '@/types/database';
import type { StudyMaterialDto } from '@/types/materials';

export function getDemoSessionScope(session: SessionRecord) {
  return session.isDemo ? session.id : undefined;
}

export function ownsStudyMaterial(
  material: StudyMaterial,
  familyId: string,
  session: SessionRecord,
) {
  if (material.familyId !== familyId) return false;
  return session.isDemo
    ? material.demoSessionId === session.id
    : !material.demoSessionId;
}

export function toStudyMaterialDto(
  material: StudyMaterial,
  includeExtractedText = false,
): StudyMaterialDto {
  return {
    id: material.id,
    profileId: material.profileId,
    originalName: material.originalName,
    mimeType: material.mimeType,
    size: material.size,
    extractionStatus: material.extractionStatus,
    errorCode: material.errorCode,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
    expiresAt: material.expiresAt,
    purgedAt: material.purgedAt,
    completedAt: material.completedAt,
    extractedText: includeExtractedText ? material.extractedText : undefined,
    title: material.analysis?.title,
    subject: material.analysis?.subject,
    questionCount: material.analysis?.questions.length,
    // Send only worksheet content, never the answer key, steps, or hints.
    instructions: includeExtractedText ? material.analysis?.generalInstructions || undefined : undefined,
    questions: includeExtractedText
      ? material.analysis?.questions.map(({ number, statement, supportContent, answerSlots }) => ({
        number, statement, supportContent, answerSlots,
      }))
      : undefined,
    storageKey: material.storageKey,
    isDidactic: material.isDidactic ?? material.analysis?.isDidactic,
  };
}

export async function cleanupExpiredStudyMaterialContent() {
  const storageKeys = await purgeExpiredStudyMaterials();
  if (storageKeys.length === 0) return;
  try {
    await deleteMaterialFiles(storageKeys);
  } catch {
    console.warn('Could not remove one or more expired material files.');
  }
}
