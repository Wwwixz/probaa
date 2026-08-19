/**
 * Базовый интерфейс для тела ошибки API.
 */
export interface ApiErrorPayload {
	message?: string;
}

/**
 * Универсальная функция-обертка над нативным fetch для выполнения HTTP-запросов к API.
 * Автоматически обрабатывает ошибки, парсит JSON и подставляет необходимые заголовки (например, куки).
 * 
 * @param input - URL или объект Request для выполнения запроса.
 * @param init - Дополнительные параметры запроса (метод, заголовки, тело и т.д.).
 * @returns Распарсенный ответ в формате ожидаемого типа <T>.
 * @throws {Error} Если запрос завершился с ошибкой (код не 2xx), выбрасывает исключение с текстом ошибки от сервера.
 */
export async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
	// Выполняем запрос с дефолтными настройками
	const response = await fetch(input, {
		credentials: 'include', // Обязательно отправляем куки (сессию)
		headers: {
			'Content-Type': 'application/json', // По умолчанию ожидаем JSON
			...(init?.headers ?? {}) // Добавляем или перезаписываем заголовки из параметров
		},
		...init
	});

	// Если статус ответа не в диапазоне 200-299, значит произошла ошибка
	if (!response.ok) {
		let message = 'Произошла ошибка запроса.';

		try {
			// Пытаемся распарсить тело ответа, чтобы получить детализированную ошибку
			const payload = (await response.json()) as ApiErrorPayload;
			if (payload.message) {
				message = payload.message; // Используем сообщение сервера, если оно есть
			}
		} catch {
			// Оставляем дефолтное сообщение, если ответ не является валидным JSON.
		}

		// Выбрасываем ошибку, чтобы её можно было перехватить в компонентах через try/catch
		throw new Error(message);
	}

	// Для статуса 204 (No Content) возвращаем undefined, так как парсить нечего
	if (response.status === 204) {
		return undefined as T;
	}

	// Возвращаем результат в виде распарсенного JSON
	return (await response.json()) as T;
}
