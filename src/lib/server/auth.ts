import { randomBytes, createHash } from 'node:crypto';
import { compare, hash } from 'bcryptjs';
import type { AstroCookies } from 'astro';
import { db, ensureDb } from './db';

const SESSION_COOKIE_NAME = import.meta.env.AUTH_COOKIE_NAME || 'tutu_session';
const SESSION_TTL_DAYS = Number(import.meta.env.AUTH_SESSION_TTL_DAYS || '7');
const PASSWORD_MIN_LENGTH = 8;

export class AuthError extends Error {
	status: number;

	constructor(message: string, status = 400) {
		super(message);
		this.name = 'AuthError';
		this.status = status;
	}
}

export interface AuthUser {
	id: number;
	email: string;
	displayName: string | null;
}

interface UserRow {
	id: string | number;
	email: string;
	display_name: string | null;
	password_hash: string;
}

interface SessionUserRow {
	id: string | number;
	email: string;
	display_name: string | null;
}

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

function hashToken(token: string) {
	return createHash('sha256').update(token).digest('hex');
}

function mapUser(row: Pick<UserRow, 'id' | 'email' | 'display_name'>): AuthUser {
	return {
		id: Number(row.id),
		email: row.email,
		displayName: row.display_name
	};
}

function getCookieOptions(expiresAt: Date) {
	return {
		httpOnly: true,
		path: '/',
		sameSite: 'lax' as const,
		secure: import.meta.env.PROD,
		expires: expiresAt
	};
}

function getDefaultDisplayName(email: string) {
	return email.split('@')[0] || null;
}

export function validateCredentials(email: string, password: string) {
	const normalizedEmail = normalizeEmail(email);

	if (!normalizedEmail) {
		throw new AuthError('Укажите email.');
	}

	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailPattern.test(normalizedEmail)) {
		throw new AuthError('Введите корректный email.');
	}

	if (password.length < PASSWORD_MIN_LENGTH) {
		throw new AuthError(`Пароль должен быть не короче ${PASSWORD_MIN_LENGTH} символов.`);
	}

	return {
		email: normalizedEmail,
		password
	};
}

export async function registerUser(email: string, password: string) {
	await ensureDb();
	const normalized = validateCredentials(email, password);
	const passwordHash = await hash(normalized.password, 10);

	try {
		const result = await db.query<UserRow>(
			`
				INSERT INTO users (email, password_hash, display_name)
				VALUES ($1, $2, $3)
				RETURNING id, email, display_name, password_hash
			`,
			[normalized.email, passwordHash, getDefaultDisplayName(normalized.email)]
		);

		return mapUser(result.rows[0]);
	} catch (error) {
		if ((error as { code?: string }).code === '23505') {
			throw new AuthError('Пользователь с таким email уже существует.', 409);
		}

		throw error;
	}
}

export async function authenticateUser(email: string, password: string) {
	await ensureDb();
	const normalized = validateCredentials(email, password);
	const result = await db.query<UserRow>(
		`
			SELECT id, email, display_name, password_hash
			FROM users
			WHERE email = $1
			LIMIT 1
		`,
		[normalized.email]
	);

	const user = result.rows[0];
	if (!user) {
		throw new AuthError('Неверный email или пароль.', 401);
	}

	const hashValue = typeof user.password_hash === 'string' ? user.password_hash.trim() : '';
	const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(hashValue);
	let passwordMatches = false;
	if (isBcryptHash) {
		try {
			passwordMatches = await compare(normalized.password, hashValue);
		} catch {
			passwordMatches = false;
		}
	} else {
		passwordMatches = Boolean(hashValue) && normalized.password === hashValue;
	}

	if (!passwordMatches) {
		throw new AuthError('Неверный email или пароль.', 401);
	}

	// Мягкая миграция: если пароль был сохранён в legacy/plain формате,
	// сразу перехешируем его после успешной аутентификации.
	if (!isBcryptHash) {
		try {
			const nextHash = await hash(normalized.password, 10);
			await db.query(
				`
					UPDATE users
					SET password_hash = $1
					WHERE id = $2
				`,
				[nextHash, Number(user.id)]
			);
		} catch {
			// Не блокируем вход, если не удалось обновить hash.
		}
	}

	return mapUser(user);
}

export async function createSession(userId: number, cookies: AstroCookies) {
	await ensureDb();
	const token = randomBytes(32).toString('hex');
	const tokenHash = hashToken(token);
	const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

	await db.query(
		`
			INSERT INTO sessions (user_id, token_hash, expires_at)
			VALUES ($1, $2, $3)
		`,
		[userId, tokenHash, expiresAt]
	);

	cookies.set(SESSION_COOKIE_NAME, token, getCookieOptions(expiresAt));
}

export async function getUserBySessionToken(token: string | undefined) {
	if (!token) {
		return null;
	}

	try {
		await ensureDb();
		const tokenHash = hashToken(token);

		const result = await db.query<SessionUserRow>(
			`
				SELECT users.id, users.email, users.display_name
				FROM sessions
				INNER JOIN users ON users.id = sessions.user_id
				WHERE sessions.token_hash = $1
					AND sessions.expires_at > NOW()
				LIMIT 1
			`,
			[tokenHash]
		);

		return result.rows[0] ? mapUser(result.rows[0]) : null;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error('Database query failed in getUserBySessionToken:', message);
		return null;
	}
}

export async function deleteSession(token: string | undefined, cookies?: AstroCookies) {
	if (token) {
		await ensureDb();
		await db.query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
	}

	if (cookies) {
		cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	}
}

export function getSessionCookieName() {
	return SESSION_COOKIE_NAME;
}
