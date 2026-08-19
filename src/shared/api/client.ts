export interface ApiErrorPayload {
	message?: string;
}

export async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
	const response = await fetch(input, {
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers ?? {})
		},
		...init
	});

	if (!response.ok) {
		let message = 'Произошла ошибка запроса.';

		try {
			const payload = (await response.json()) as ApiErrorPayload;
			if (payload.message) {
				message = payload.message;
			}
		} catch {
			// Оставляем дефолтное сообщение, если ответ не JSON.
		}

		throw new Error(message);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return (await response.json()) as T;
}
