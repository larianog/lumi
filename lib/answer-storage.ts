/**
 * Browser-only storage for answers the child typed or spoke into a worksheet.
 * Kept per material and question in localStorage, so reopening a material from
 * history resumes where she stopped.
 */
const PREFIX = 'lumi-answers:';

export function answerStorageKey(materialId: string, questionLabel: string) {
  return `${PREFIX}${materialId}:${questionLabel}`;
}

/**
 * Forget every saved answer of a material. Called when the same file is
 * uploaded again: the server reuses the cached material (same id), but a new
 * upload means a fresh attempt with empty blanks.
 */
export function clearStoredAnswers(materialId: string) {
  try {
    const prefix = `${PREFIX}${materialId}:`;
    const keys: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(prefix)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage unavailable: nothing was saved either.
  }
}
