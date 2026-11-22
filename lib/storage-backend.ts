/** Vercel Functions cannot persist writes under the deployment directory. */
export function usesHostedStorage() {
  return process.env.LUMI_STORAGE_BACKEND === 'hosted' || process.env.VERCEL === '1';
}
