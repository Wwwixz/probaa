import { Agent, fetch } from 'undici';
import { randomUUID } from 'node:crypto';

const gigachatDispatcher = new Agent({
	connect: {
		rejectUnauthorized: false
	}
});

const GIGACHAT_AUTH_KEY = import.meta.env.GIGACHAT_AUTH_KEY;
const GIGACHAT_SCOPE = import.meta.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS';
const GIGACHAT_MODEL = import.meta.env.GIGACHAT_MODEL || 'GigaChat-2-Max';

type GigaChatMessage = {
	role: 'system' | 'user' | 'assistant' | 'function';
	content: string;
	name?: string;
	function_call?: {
		id?: string;
		name: string;
		arguments: Record<string, unknown> | string;
	};
	functions_state_id?: string;
};

export interface GigaChatFunctionDefinition {
	name: string;
	description: string;
	parameters: Record<string, unknown>;
}

interface GigaChatTokenResponse {
	access_token: string;
	expires_at: number;
}

interface GigaChatCompletionResponse {
	choices: Array<{
		message: GigaChatMessage;
		finish_reason: string;
	}>;
}

const tokenCache = {
	accessToken: '',
	expiresAt: 0
};

async function getAccessToken() {
	if (!GIGACHAT_AUTH_KEY) {
		throw new Error('GIGACHAT_AUTH_KEY is not set. Add it to your .env file.');
	}

	const now = Date.now();
	if (tokenCache.accessToken && tokenCache.expiresAt - now > 60_000) {
		return tokenCache.accessToken;
	}

	const response = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${GIGACHAT_AUTH_KEY}`,
			RqUID: randomUUID(),
			Accept: 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({ scope: GIGACHAT_SCOPE }),
		dispatcher: gigachatDispatcher
	});

	if (!response.ok) {
		throw new Error(`GigaChat auth failed with status ${response.status}.`);
	}

	const payload = (await response.json()) as GigaChatTokenResponse;
	tokenCache.accessToken = payload.access_token;
	tokenCache.expiresAt = payload.expires_at;

	return tokenCache.accessToken;
}

export async function createGigaChatCompletion(input: {
	messages: GigaChatMessage[];
	functions?: GigaChatFunctionDefinition[];
	temperature?: number;
}) {
	const accessToken = await getAccessToken();
	const response = await fetch('https://api.giga.chat/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: GIGACHAT_MODEL,
			messages: input.messages,
			functions: input.functions,
			function_call: input.functions?.length ? 'auto' : undefined,
			temperature: input.temperature ?? 0.2
		}),
		dispatcher: gigachatDispatcher
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`GigaChat completion failed with status ${response.status}: ${errorText}`);
	}

	const payload = (await response.json()) as GigaChatCompletionResponse;
	return payload.choices[0]?.message;
}
