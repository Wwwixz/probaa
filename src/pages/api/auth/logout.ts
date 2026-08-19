import type { APIRoute } from 'astro';
import { deleteSession, getSessionCookieName } from '../../../lib/server/auth';

export const POST: APIRoute = async ({ cookies }) => {
	const token = cookies.get(getSessionCookieName())?.value;
	await deleteSession(token, cookies);

	return new Response(null, { status: 204 });
};
