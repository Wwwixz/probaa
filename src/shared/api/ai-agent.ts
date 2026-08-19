import { apiRequest } from './client';

export interface AiAgentChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export interface AiAgentOfferCard {
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

export interface AiAgentChatResponse {
	reply: string;
	toolCalls: string[];
	offerCards: AiAgentOfferCard[];
}

export function sendAiAgentMessage(messages: AiAgentChatMessage[]) {
	return apiRequest<AiAgentChatResponse>('/api/ai-agent/chat', {
		method: 'POST',
		body: JSON.stringify({ messages })
	});
}
