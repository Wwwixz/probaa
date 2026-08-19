import type { APIRoute } from 'astro';
import { AuthError, createSession, registerUser } from '../../../lib/server/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
	try {
		const { email = '', password = '' } = await request.json();
		const user = await registerUser(email, password);
		await createSession(user.id, cookies);

		return Response.json({ user }, { status: 201 });
	} catch (error) {
		if (error instanceof AuthError) {
			return Response.json({ message: error.message }, { status: error.status });
		}

		console.error('Register failed:', error);
		return Response.json(
			{ message: 'Сервис авторизации временно недоступен. Проверьте подключение к Postgres.' },
			{ status: 500 }
		);
	}
};
