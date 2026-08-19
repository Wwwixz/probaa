import { createGigaChatCompletion, type GigaChatFunctionDefinition } from './gigachat';
import { tutuMcpClient } from './tutuMcp';

/**
 * Интерфейс сообщения в истории чата ИИ агента.
 * Содержит роль отправителя (пользователь или ассистент) и текстовое содержимое.
 */

export interface AgentChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

interface AgentChatResult {
	reply: string;
	toolCalls: string[];
	offerCards: AgentOfferCard[];
}

interface AgentOfferCard {
	id: string;
	kind: 'rail';
	title: string;
	subtitle: string;
	fromCode: string;
	fromCity: string;
	toCode: string;
	toCity: string;
	departureTime: string;
	arrivalTime: string;
	duration: string;
	price: string;
	rating?: string;
	checkoutUrl: string;
}

/**
 * Предустановленные ответы-уточнения для типичных неконкретных запросов пользователей.
 * Позволяет сократить нагрузку на нейросеть (LLM) и быстрее получить нужные данные.
 */
const DIRECT_CLARIFICATION_REPLIES: Record<string, string> = {
	'собери маршрут с пересадками':
		'Уточните, пожалуйста, откуда, куда и на какую дату собрать маршрут с пересадками. Например: "Москва -> Архыз на 2026-08-23, 1 пассажир".',
	'самый дешёвый авиабилет в сочи':
		'Напишите, пожалуйста, откуда вылет и на какую дату искать билет в Сочи. Например: "Из Москвы в Сочи на завтра, 1 пассажир".',
	'подбери отель у моря':
		'Уточните город, даты и сколько гостей едет. Например: "Сочи, 2026-08-23 - 2026-08-25, 2 гостя".'
};

/**
 * Основной системный промпт для нейросети (GigaChat).
 * Содержит инструкции, правила поведения и контекст (агент сервиса TUTU).
 */
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

/** Преобразует результат вызова инструмента (Mcp Tool) в строковый JSON формат */
function stringifyToolResult(result: unknown) {
	return JSON.stringify(result, null, 2);
}

/**
 * Парсит аргументы функции, которые вернула нейросеть.
 * Нейросеть иногда возвращает их в виде строки (JSON), а иногда как объект.
 */
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

<<<<<<< HEAD
function formatTime(iso: string | undefined) {
	if (!iso) return '--:--';
	return new Date(iso).toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit'
	});
}

function formatDuration(totalMinutes: number | undefined) {
	if (!totalMinutes) return '';
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return minutes === 0 ? `${hours} ч` : `${hours} ч ${minutes} мин`;
}

function formatPrice(amount: number | undefined, currency = 'RUB') {
	if (!amount) return '';
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0
	}).format(amount);
}

function getLocationCode(city: string | undefined) {
	const normalized = city?.toLowerCase() || '';

	if (normalized.includes('моск')) return 'MOW';
	if (normalized.includes('санкт') || normalized.includes('петер')) return 'LED';
	if (normalized.includes('сочи')) return 'AER';
	if (normalized.includes('шарм')) return 'SSH';

	return (city || '---')
		.replace(/[^A-Za-zА-Яа-яЁё]/g, '')
		.slice(0, 3)
		.toUpperCase();
}

function extractToolPayload(toolResult: unknown) {
	if (!toolResult || typeof toolResult !== 'object') {
		return null;
	}

	const content = (toolResult as { content?: Array<{ text?: string }> }).content;
	const text = content?.[0]?.text;

	if (!text) {
		return null;
	}

	try {
		return JSON.parse(text) as Record<string, unknown>;
	} catch {
		return null;
	}
}

function buildOfferCards(toolName: string, payload: Record<string, unknown> | null): AgentOfferCard[] {
	if (!payload || !Array.isArray(payload.offers)) {
		return [];
	}

	if (toolName !== 'search_rail' && toolName !== 'search_etrain') {
		return [];
	}

	return payload.offers.slice(0, 3).flatMap((offer) => {
		if (!offer || typeof offer !== 'object') {
			return [];
		}

		const typedOffer = offer as Record<string, any>;
		const firstSegment = typedOffer.legs?.[0]?.segments?.[0];
		const vehicleName =
			toolName === 'search_etrain'
				? firstSegment?.vehicle_meta?.name || 'Электричка'
				: firstSegment?.vehicle_meta?.name || 'Поезд';
		const trainNumber = firstSegment?.voyage_no || typedOffer.details_ref?.title || '';
		const routeFrom = payload.meta?.from?.name || firstSegment?.from || 'Отправление';
		const routeTo = payload.meta?.to?.name || firstSegment?.to || 'Прибытие';

		return [
			{
				id: typedOffer.offer_id || `${trainNumber}-${typedOffer.departure_at}`,
				kind: 'rail' as const,
				title: `${vehicleName} ${trainNumber}`.trim(),
				subtitle: `${firstSegment?.from || routeFrom} -> ${firstSegment?.to || routeTo}`,
				fromCode: getLocationCode(routeFrom),
				fromCity: routeFrom,
				toCode: getLocationCode(routeTo),
				toCity: routeTo,
				departureTime: formatTime(typedOffer.departure_at),
				arrivalTime: formatTime(typedOffer.arrival_at),
				duration: formatDuration(typedOffer.duration_min),
				price: formatPrice(typedOffer.price?.amount, typedOffer.price?.currency),
				rating: typedOffer.review_summary?.label,
				checkoutUrl: typedOffer.checkout_url
			}
		];
	});
}

=======
/**
 * Проверяет, является ли сообщение от пользователя "малозначимым".
 * (пустые строки, очень короткие слова до 5 букв типа "да", "нет", или спецсимволы).
 * Используется для склейки истории контекста.
 */
>>>>>>> c525188107d867a3231c78d40a7e8dfdd2249777
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

/**
 * Нормализует историю сообщений перед отправкой в нейросеть.
 * Фильтрует промежуточные малоинформативные ответы и склеивает подряд идущие сообщения
 * одной и той же роли в одно для экономии токенов.
 */
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

/**
 * Очищает и нормализует JSON Schema параметров инструмента для совместимости с GigaChat.
 * Преобразует сложные типы вроде anyOf/oneOf в более простые структуры.
 */
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

/**
 * Преобразует список инструментов, полученных от MCP клиента, в формат определений функций (Function Calling),
 * который понимает API GigaChat.
 */
function normalizeToolsToFunctions(tools: Awaited<ReturnType<typeof tutuMcpClient.listTools>>) {
	return tools.map<GigaChatFunctionDefinition>((tool) => ({
		name: tool.name,
		description: [tool.title, tool.description].filter(Boolean).join('. ').slice(0, 2500),
		parameters: sanitizeSchema(tool.inputSchema, true)
	}));
}

/**
 * Основная функция обработки чата ИИ-агента с использованием Function Calling.
 * 
 * 1. Нормализует историю и проверяет на наличие прямых ответов (хардкод).
 * 2. Запрашивает список доступных инструментов у Tutu MCP.
 * 3. Делает запросы к нейросети (до 6 шагов/итераций).
 * 4. Если нейросеть запрашивает вызов инструмента (function_call) - локально вызывает его и передает результат обратно.
 * 5. Формирует финальный ответ и возвращает его вместе со списком использованных инструментов.
 * 
 * @param history - Текущая история переписки.
 * @returns Финальный текстовый ответ и массив вызванных инструментов.
 */
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
			toolCalls: [],
			offerCards: []
		};
	}

	const todayIso = new Date().toISOString().slice(0, 10);
	const tools = await tutuMcpClient.listTools();
	const functions = normalizeToolsToFunctions(tools);
	const toolCalls: string[] = [];
	const seenToolCalls = new Set<string>();
	let offerCards: AgentOfferCard[] = [];
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
			toolCalls,
			offerCards
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
			const toolPayload = extractToolPayload(toolResult);
			const extractedCards = buildOfferCards(assistantMessage.function_call.name, toolPayload);

			if (extractedCards.length > 0) {
				offerCards = extractedCards;
			}

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
			toolCalls,
			offerCards
		};
	}

	return finalizeAnswer();
}
