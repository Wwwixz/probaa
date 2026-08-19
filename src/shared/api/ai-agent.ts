import { apiRequest } from './client';

export interface AiAgentChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export interface AiAgentChatResponse {
	reply: string;
	toolCalls: string[];
}

export function sendAiAgentMessage(messages: AiAgentChatMessage[]) {
	return apiRequest<AiAgentChatResponse>('/api/ai-agent/chat', {
		method: 'POST',
		body: JSON.stringify({ messages })
	});
}
