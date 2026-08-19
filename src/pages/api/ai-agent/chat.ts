import type { APIRoute } from 'astro';
import { runTravelAgentChat } from '../../../lib/server/aiAgent';

export const POST: APIRoute = async ({ request }) => {
	try {
		const { messages } = (await request.json()) as {
			messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
		};

		if (!messages?.length) {
			return Response.json({ message: 'Передайте историю сообщений.' }, { status: 400 });
		}

		const result = await runTravelAgentChat(messages);
		return Response.json(result);
	} catch (error) {
		console.error('AI agent chat failed:', error);
		return Response.json(
			{
				message:
					'Не удалось получить ответ от ИИ-агента. Проверьте GigaChat и доступность Tutu MCP.'
			},
			{ status: 500 }
		);
	}
};
