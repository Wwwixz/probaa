import type { APIRoute } from 'astro';
import { AuthError, authenticateUser, createSession, deleteSession, getSessionCookieName } from '../../../lib/server/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
	try {
		const { email = '', password = '' } = await request.json();
		const existingToken = cookies.get(getSessionCookieName())?.value;

		if (existingToken) {
			await deleteSession(existingToken);
		}

		const user = await authenticateUser(email, password);
		await createSession(user.id, cookies);

		return Response.json({ user });
	} catch (error) {
		if (error instanceof AuthError) {
			return Response.json({ message: error.message }, { status: error.status });
		}

		console.error('Login failed:', error);
		return Response.json(
			{ message: 'Сервис авторизации временно недоступен. Проверьте подключение к Postgres.' },
			{ status: 500 }
		);
	}
};
