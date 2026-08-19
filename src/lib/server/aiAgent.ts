import { createGigaChatCompletion, type GigaChatFunctionDefinition } from './gigachat';
import { tutuMcpClient } from './tutuMcp';

export interface AgentChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

interface AgentChatResult {
	reply: string;
	toolCalls: string[];
}

const DIRECT_CLARIFICATION_REPLIES: Record<string, string> = {
	'собери маршрут с пересадками':
		'Уточните, пожалуйста, откуда, куда и на какую дату собрать маршрут с пересадками. Например: "Москва -> Архыз на 2026-08-23, 1 пассажир".',
	'самый дешёвый авиабилет в сочи':
		'Напишите, пожалуйста, откуда вылет и на какую дату искать билет в Сочи. Например: "Из Москвы в Сочи на завтра, 1 пассажир".',
	'подбери отель у моря':
		'Уточните город, даты и сколько гостей едет. Например: "Сочи, 2026-08-23 - 2026-08-25, 2 гостя".'
};

const BASE_SYSTEM_PROMPT = `Ты тревел-агент сервиса TUTU и помогаешь путешественнику быстро принять решение и перейти к покупке.

Правила работы:
- Используй инструменты Tutu MCP всегда, когда вопрос касается билетов, отелей, пересадок, вариантов поездки, checkout-ссылок или деталей предложения.
- Не выдумывай цены, наличие мест, возвратность, пересадки, рейтинги и ссылки. Бери это только из результатов инструментов.
- Если для поиска не хватает обязательных данных, задай короткий уточняющий вопрос одним сообщением.
- Если данных достаточно, не задавай лишних вопросов: сразу ищи варианты.
- Если пользователь пишет относительные даты вроде "сегодня", "завтра", "на выходных", сначала переведи их в конкретные даты относительно текущей даты, а потом вызывай инструменты.
- В ответе сначала дай краткий вывод, потом 2-4 лучших варианта, потом предложи следующий шаг.
- Если инструмент вернул checkout или search URL, обязательно показывай ссылку пользователю.
- Отвечай по-русски, уверенно, дружелюбно и очень практично.
- Для демо особенно полезны сценарии: найти самый выгодный билет, подобрать поезд/самолет/автобус, комбинированный маршрут, отель у моря, обмен или инструкция по покупке.`;

function stringifyToolResult(result: unknown) {
	return JSON.stringify(result, null, 2);
}

function parseFunctionArguments(argumentsValue: Record<string, unknown> | string | undefined) {
	if (!argumentsValue) {
		return {};
	}

	if (typeof argumentsValue === 'string') {
		try {
			return JSON.parse(argumentsValue) as Record<string, unknown>;
		} catch {
			return {};
		}
	}

	return argumentsValue;
}

function isLowValueUserMessage(content: string) {
	const normalized = content.trim().toLowerCase();

	if (!normalized) {
		return true;
	}

	if (/^[a-z]{1,5}$/i.test(normalized)) {
		return true;
	}

	if (/^[^a-zа-яё0-9]+$/i.test(normalized)) {
		return true;
	}

	return false;
}

function normalizeHistory(history: AgentChatMessage[]) {
	const filtered = history.filter((message, index) => {
		if (message.role !== 'user') {
			return true;
		}

		if (index === history.length - 1) {
			return true;
		}

		return !isLowValueUserMessage(message.content);
	});

	return filtered.reduce<AgentChatMessage[]>((acc, message) => {
		const previous = acc.at(-1);

		if (previous && previous.role === message.role) {
			previous.content = `${previous.content}\n\n${message.content}`.trim();
			return acc;
		}

		acc.push({ ...message });
		return acc;
	}, []);
}

function sanitizeSchema(schema: unknown, isRoot = false): Record<string, unknown> {
	if (!schema || typeof schema !== 'object') {
		return isRoot ? { type: 'object', properties: {} } : { type: 'string' };
	}

	const source = schema as Record<string, unknown>;

	if (Array.isArray(source.anyOf)) {
		const nonNullVariant = source.anyOf.find(
			(variant) =>
				typeof variant === 'object' &&
				variant !== null &&
				(variant as Record<string, unknown>).type !== 'null'
		);

		if (nonNullVariant) {
			return sanitizeSchema(nonNullVariant, isRoot);
		}
	}

	if (Array.isArray(source.oneOf) && source.oneOf.length > 0) {
		return sanitizeSchema(source.oneOf[0], isRoot);
	}

	const normalizedType = source.type === 'integer' ? 'number' : source.type;
	const result: Record<string, unknown> = {};

	if (typeof normalizedType === 'string') {
		result.type = normalizedType;
	}

	if (typeof source.description === 'string') {
		result.description = source.description;
	}

	if (Array.isArray(source.enum)) {
		result.enum = source.enum;
	}

	if (typeof source.minimum === 'number') {
		result.minimum = source.minimum;
	}

	if (typeof source.maximum === 'number') {
		result.maximum = source.maximum;
	}

	if (typeof source.format === 'string') {
		result.format = source.format;
	}

	if (result.type === 'array') {
		result.items = sanitizeSchema(source.items);
	}

	if (source.properties && typeof source.properties === 'object' && !Array.isArray(source.properties)) {
		result.type = 'object';
		result.properties = Object.fromEntries(
			Object.entries(source.properties).map(([key, value]) => [key, sanitizeSchema(value)])
		);

		if (Array.isArray(source.required)) {
			result.required = source.required;
		}
	}

	if (result.type === 'object' && !result.properties) {
		result.properties = {};
		delete result.required;
	}

	if (!result.type) {
		if (isRoot) {
			result.type = 'object';
			result.properties = {};
		} else {
			result.type = 'string';
		}
	}

	return result;
}

function normalizeToolsToFunctions(tools: Awaited<ReturnType<typeof tutuMcpClient.listTools>>) {
	return tools.map<GigaChatFunctionDefinition>((tool) => ({
		name: tool.name,
		description: [tool.title, tool.description].filter(Boolean).join('. ').slice(0, 2500),
		parameters: sanitizeSchema(tool.inputSchema, true)
	}));
}

export async function runTravelAgentChat(history: AgentChatMessage[]): Promise<AgentChatResult> {
	const preparedHistory = normalizeHistory(history).slice(-8);
	const lastUserMessage = [...preparedHistory]
		.reverse()
		.find((message) => message.role === 'user')
		?.content.trim()
		.toLowerCase();

	if (lastUserMessage && DIRECT_CLARIFICATION_REPLIES[lastUserMessage]) {
		return {
			reply: DIRECT_CLARIFICATION_REPLIES[lastUserMessage],
			toolCalls: []
		};
	}

	const todayIso = new Date().toISOString().slice(0, 10);
	const tools = await tutuMcpClient.listTools();
	const functions = normalizeToolsToFunctions(tools);
	const toolCalls: string[] = [];
	const seenToolCalls = new Set<string>();
	const messages: Array<{
		role: 'system' | 'user' | 'assistant' | 'function';
		content: string;
		name?: string;
		function_call?: {
			id?: string;
			name: string;
			arguments: Record<string, unknown> | string;
		};
		functions_state_id?: string;
	}> = [
		{
			role: 'system',
			content: `${BASE_SYSTEM_PROMPT}\nТекущая дата: ${todayIso}.`
		},
		...preparedHistory
	];

	async function finalizeAnswer() {
		const finalMessage = await createGigaChatCompletion({
			messages: [
				...messages,
				{
					role: 'system',
					content:
						'Сформируй финальный ответ пользователю только на основе уже полученных результатов. Новые function_call больше не делай.'
				}
			],
			temperature: 0.2
		});

		return {
			reply:
				finalMessage?.content?.trim() ||
				'Я нашёл результаты, но не смог корректно собрать финальный ответ. Попробуйте уточнить запрос.',
			toolCalls
		};
	}

	for (let step = 0; step < 6; step += 1) {
		const assistantMessage = await createGigaChatCompletion({
			messages,
			functions,
			temperature: 0.2
		});

		if (!assistantMessage) {
			throw new Error('GigaChat returned an empty response.');
		}

		if (assistantMessage.function_call?.name) {
			const args = parseFunctionArguments(assistantMessage.function_call.arguments);
			const signature = `${assistantMessage.function_call.name}:${JSON.stringify(args)}`;

			if (seenToolCalls.has(signature) || toolCalls.length >= 4) {
				return finalizeAnswer();
			}

			seenToolCalls.add(signature);
			const toolResult = await tutuMcpClient.callTool(assistantMessage.function_call.name, args);

			toolCalls.push(assistantMessage.function_call.name);
			messages.push({
				role: 'assistant',
				content: assistantMessage.content ?? '',
				function_call: assistantMessage.function_call,
				functions_state_id: assistantMessage.functions_state_id
			});
			messages.push({
				role: 'function',
				name: assistantMessage.function_call.name,
				content: stringifyToolResult(toolResult)
			});
			continue;
		}

		return {
			reply:
				assistantMessage.content?.trim() ||
				'Не удалось сформировать ответ. Попробуйте уточнить маршрут, даты или тип транспорта.',
			toolCalls
		};
	}

	return finalizeAnswer();
}
