import { Pool } from 'pg';

let pool: Pool | undefined;
let initialized: Promise<void> | undefined;

function getPool() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error('DATABASE_URL is required on Vercel');
  pool ??= new Pool({ connectionString, max: 3 });
  return pool;
}

async function ensureTable<T>(initial: T) {
  if (!initialized) {
    initialized = (async () => {
      await getPool().query(`
        CREATE TABLE IF NOT EXISTS lumi_state (
          id smallint PRIMARY KEY CHECK (id = 1),
          body jsonb NOT NULL
        )
      `);
      await getPool().query('INSERT INTO lumi_state (id, body) VALUES (1, $1::jsonb) ON CONFLICT DO NOTHING', [JSON.stringify(initial)]);
    })().catch((error: unknown) => {
      initialized = undefined;
      throw error;
    });
  }
  await initialized;
}

export async function readHostedDb<T>(initial: T): Promise<T> {
  await ensureTable(initial);
  const result = await getPool().query<{ body: T }>('SELECT body FROM lumi_state WHERE id = 1');
  return result.rows[0].body;
}

export async function updateHostedDb<T, R>(initial: T, mutate: (state: T) => Promise<R> | R): Promise<R> {
  await ensureTable(initial);
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await client.query<{ body: T }>('SELECT body FROM lumi_state WHERE id = 1 FOR UPDATE');
    const state = result.rows[0].body;
    const value = await mutate(state);
    await client.query('UPDATE lumi_state SET body = $1::jsonb WHERE id = 1', [JSON.stringify(state)]);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/** Used by the optional PostgreSQL integration check. */
export async function closeHostedDb() {
  const current = pool;
  pool = undefined;
  initialized = undefined;
  await current?.end();
}
