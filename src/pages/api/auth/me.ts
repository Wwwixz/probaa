import type { APIRoute } from 'astro';
import { getSessionCookieName, getUserBySessionToken } from '../../../lib/server/auth';

export const GET: APIRoute = async ({ cookies }) => {
	try {
		const token = cookies.get(getSessionCookieName())?.value;
		const user = await getUserBySessionToken(token);

		if (!user) {
			return Response.json({ message: 'Не авторизован.' }, { status: 401 });
		}

		return Response.json({ user });
	} catch (error) {
		console.error('Read current user failed:', error);
		return Response.json(
			{ message: 'Сервис авторизации временно недоступен. Проверьте подключение к Postgres.' },
			{ status: 500 }
		);
	}
};
