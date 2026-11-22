import { randomUUID } from 'node:crypto';
import { closeHostedDb } from '../lib/hosted-db';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const connectionString = process.env.LUMI_TEST_DATABASE_URL;
  if (!connectionString || !new URL(connectionString).pathname.includes('lumi_test_')) {
    throw new Error('LUMI_TEST_DATABASE_URL must point to a dedicated lumi_test_ database');
  }
  process.env.DATABASE_URL = connectionString;
  process.env.LUMI_STORAGE_BACKEND = 'hosted';

  const { createFamily, createSession, getCompletionsByFamily, getFamilyForSession, recordCompletion, updateDb } = await import('../lib/db');
  const profileId = randomUUID();
  const family = await createFamily('11999990000', 'test-password', {
    id: profileId,
    type: 'adult',
    firstName: 'Test',
    lastName: 'Family',
    birthDate: '1990-01-01',
    avatar: 0,
    createdAt: new Date().toISOString(),
  });
  await Promise.all(Array.from({ length: 20 }, (_, index) =>
    recordCompletion(family.id, profileId, String(index), 'Concurrent write')));
  assert((await getCompletionsByFamily(family.id)).length === 20, 'Concurrent writes must all persist');

  await updateDb((db) => {
    db.completions.length = 0;
    throw new Error('ROLLBACK_TEST');
  }).catch((error: Error) => {
    assert(error.message === 'ROLLBACK_TEST', 'Expected rollback test error');
  });
  assert((await getCompletionsByFamily(family.id)).length === 20, 'Failed mutations must roll back');

  const token = await createSession(family.id);
  assert((await getFamilyForSession(token))?.family.id === family.id, 'Sessions persist in PostgreSQL');
  process.stdout.write('Hosted PostgreSQL concurrency, rollback and session checks passed\n');
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => closeHostedDb());
