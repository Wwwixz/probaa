import { Pool } from 'pg';

const connectionString = import.meta.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL is not set. Add it to your .env file.');
}

const globalForDb = globalThis as typeof globalThis & {
	__tutuPool?: Pool;
	__tutuDbInitPromise?: Promise<void>;
};

export const db = globalForDb.__tutuPool ?? new Pool({ connectionString });

if (!globalForDb.__tutuPool) {
	globalForDb.__tutuPool = db;
}

async function runSchema() {
	await db.query(`
		CREATE TABLE IF NOT EXISTS users (
			id BIGSERIAL PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			display_name TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	await db.query(`
		ALTER TABLE users
		ADD COLUMN IF NOT EXISTS password_hash TEXT;
	`);

	await db.query(`
		ALTER TABLE users
		ADD COLUMN IF NOT EXISTS display_name TEXT;
	`);

	await db.query(`
		ALTER TABLE users
		ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
	`);

	await db.query(`
		DO $$
		BEGIN
			IF EXISTS (
				SELECT 1
				FROM information_schema.columns
				WHERE table_schema = 'public'
					AND table_name = 'users'
					AND column_name = 'name'
			) THEN
				UPDATE users
				SET display_name = COALESCE(display_name, name)
				WHERE name IS NOT NULL;
			END IF;
		END $$;
	`);

	await db.query(`
		CREATE TABLE IF NOT EXISTS sessions (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			token_hash TEXT NOT NULL UNIQUE,
			expires_at TIMESTAMPTZ NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	await db.query(`
		CREATE INDEX IF NOT EXISTS sessions_user_id_idx
		ON sessions(user_id);
	`);

	await db.query(`
		CREATE INDEX IF NOT EXISTS sessions_expires_at_idx
		ON sessions(expires_at);
	`);
}

export async function ensureDb() {
	if (!globalForDb.__tutuDbInitPromise) {
		globalForDb.__tutuDbInitPromise = runSchema().catch((error) => {
			globalForDb.__tutuDbInitPromise = undefined;
			throw error;
		});
	}

	await globalForDb.__tutuDbInitPromise;
}
