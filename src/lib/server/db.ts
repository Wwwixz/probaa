import { randomBytes, createHash } from 'node:crypto';
import { hash } from 'bcryptjs';
import type { Pool, QueryResult } from 'pg';

const connectionString = import.meta.env.DATABASE_URL;

type InMemoryUser = {
	id: number;
	email: string;
	password_hash: string;
	display_name: string | null;
	created_at: Date;
};

type InMemorySession = {
	id: number;
	user_id: number;
	token_hash: string;
	expires_at: Date;
	created_at: Date;
};

const inMemoryState: {
	users: Map<number, InMemoryUser>;
	sessions: Map<number, InMemorySession>;
	emailToId: Map<string, number>;
	tokenToId: Map<string, number>;
	userIdSeq: number;
	sessionIdSeq: number;
} = {
	users: new Map(),
	sessions: new Map(),
	emailToId: new Map(),
	tokenToId: new Map(),
	userIdSeq: 0,
	sessionIdSeq: 0,
};

function sha256(input: string) {
	return createHash('sha256').update(input).digest('hex');
}

async function seedInMemory() {
	if (inMemoryState.users.size > 0) return;
	const seedUsers: Array<{ email: string; password: string; displayName?: string }> = [
		{ email: 'test@tutu.ru', password: 'Test1234', displayName: 'Linkirek24' },
	];
	for (const u of seedUsers) {
		const id = ++inMemoryState.userIdSeq;
		const email = u.email.trim().toLowerCase();
		const passwordHash = await hash(u.password, 10);
		const record: InMemoryUser = {
			id,
			email,
			password_hash: passwordHash,
			display_name: u.displayName ?? email.split('@')[0],
			created_at: new Date(),
		};
		inMemoryState.users.set(id, record);
		inMemoryState.emailToId.set(email, id);
	}
}

class MemoryDb {
	// Эмуляция результата pg query для совместимости с auth.ts
	async query<R extends Record<string, unknown>>(
		text: string,
		params: Array<unknown> = [],
	): Promise<QueryResult<R>> {
		// INSERT INTO users
		if (/INSERT INTO users/i.test(text)) {
			const email = String(params[0] ?? '').trim().toLowerCase();
			const passwordHash = String(params[1]);
			const displayName = params[2] ? String(params[2]) : null;
			if (inMemoryState.emailToId.has(email)) {
				const err = new Error('duplicate key value violates unique constraint') as Error & { code?: string };
				err.code = '23505';
				throw err;
			}
			const id = ++inMemoryState.userIdSeq;
			const record: InMemoryUser = {
				id,
				email,
				password_hash: passwordHash,
				display_name: displayName,
				created_at: new Date(),
			};
			inMemoryState.users.set(id, record);
			inMemoryState.emailToId.set(email, id);
			return {
				rows: [
					{
						id,
						email: record.email,
						display_name: record.display_name,
						password_hash: record.password_hash,
					} as unknown as R,
				],
				rowCount: 1,
				command: 'INSERT',
				oid: 0,
				fields: [],
			};
		}
		// SELECT users by email
		if (/SELECT.*FROM users.*WHERE email/i.test(text)) {
			const email = String(params[0] ?? '').trim().toLowerCase();
			const id = inMemoryState.emailToId.get(email);
			const rows: R[] = [];
			if (id) {
				const u = inMemoryState.users.get(id)!;
				rows.push({
					id: u.id,
					email: u.email,
					display_name: u.display_name,
					password_hash: u.password_hash,
				} as unknown as R);
			}
			return { rows, rowCount: rows.length, command: 'SELECT', oid: 0, fields: [] };
		}
		// INSERT INTO sessions
		if (/INSERT INTO sessions/i.test(text)) {
			const userId = Number(params[0]);
			const tokenHash = String(params[1]);
			const expiresAt = params[2] instanceof Date ? params[2] : new Date(String(params[2]));
			const id = ++inMemoryState.sessionIdSeq;
			const record: InMemorySession = {
				id,
				user_id: userId,
				token_hash: tokenHash,
				expires_at: expiresAt,
				created_at: new Date(),
			};
			inMemoryState.sessions.set(id, record);
			inMemoryState.tokenToId.set(tokenHash, id);
			return { rows: [], rowCount: 1, command: 'INSERT', oid: 0, fields: [] };
		}
		// SELECT sessions by token_hash + expires
		if (/SELECT.*FROM sessions/i.test(text) && /token_hash/i.test(text)) {
			const tokenHash = String(params[0] ?? '');
			const sid = inMemoryState.tokenToId.get(tokenHash);
			const rows: R[] = [];
			if (sid) {
				const s = inMemoryState.sessions.get(sid)!;
				if (s.expires_at.getTime() > Date.now()) {
					const u = inMemoryState.users.get(s.user_id);
					if (u) {
						rows.push({
							id: u.id,
							email: u.email,
							display_name: u.display_name,
						} as unknown as R);
					}
				}
			}
			return { rows, rowCount: rows.length, command: 'SELECT', oid: 0, fields: [] };
		}
		// DELETE sessions by token_hash
		if (/DELETE FROM sessions/i.test(text) && /token_hash/i.test(text)) {
			const tokenHash = String(params[0] ?? '');
			const sid = inMemoryState.tokenToId.get(tokenHash);
			if (sid) {
				inMemoryState.sessions.delete(sid);
				inMemoryState.tokenToId.delete(tokenHash);
			}
			return { rows: [], rowCount: sid ? 1 : 0, command: 'DELETE', oid: 0, fields: [] };
		}
		// CREATE TABLE / ALTER / INDEX — noop
		return { rows: [], rowCount: 0, command: 'NOOP', oid: 0, fields: [] };
	}
}

let pgPool: Pool | null = null;
const fallbackDb = new MemoryDb();

async function tryCreatePool() {
	if (!connectionString) return null;
	try {
		const pg = await import('pg');
		const pool = new pg.Pool({ connectionString });
		await pool.query('SELECT 1');
		return pool;
	} catch (error) {
		console.warn('[db] Postgres недоступен, использую in-memory fallback:', (error as Error).message);
		return null;
	}
}

export const db = new Proxy(fallbackDb as unknown as Pool, {
	get(_target, prop, _receiver) {
		if (prop === 'query') {
			return async (...args: Parameters<MemoryDb['query']>) => {
				if (pgPool) {
					try {
						return await (pgPool.query as MemoryDb['query'])(...args);
					} catch (pgError) {
						console.warn('[db] Ошибка Postgres, fallback in-memory:', (pgError as Error).message);
					}
				}
				return fallbackDb.query(...args);
			};
		}
		return (fallbackDb as unknown as Record<string, unknown>)[prop as string];
	},
});

async function runSchema() {
	if (pgPool) {
		try {
			await pgPool.query(`
				CREATE TABLE IF NOT EXISTS users (
					id BIGSERIAL PRIMARY KEY,
					email TEXT NOT NULL UNIQUE,
					password_hash TEXT NOT NULL,
					display_name TEXT,
					created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
				);
			`);
			await pgPool.query(`
				CREATE TABLE IF NOT EXISTS sessions (
					id BIGSERIAL PRIMARY KEY,
					user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
					token_hash TEXT NOT NULL UNIQUE,
					expires_at TIMESTAMPTZ NOT NULL,
					created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
				);
			`);
			await pgPool.query(`CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);`);
			await pgPool.query(`CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);`);
		} catch (error) {
			console.error('[db] Ошибка инициализации схемы Postgres:', (error as Error).message);
		}
	}
	await seedInMemory();
}

let initPromise: Promise<void> | null = null;

export async function ensureDb() {
	if (!initPromise) {
		initPromise = (async () => {
			pgPool = await tryCreatePool();
			try {
				await runSchema();
			} catch (error) {
				console.error('[db] ensureDb failed:', (error as Error).message);
			}
		})();
	}
	await initPromise;
}
