export interface ChatMessage {
	id: string;
	/** 'me' — моё сообщение (справа, с моей аватаркой), 'them' — от собеседника */
	author: 'me' | 'them';
	text: string;
	time: string;
}

export interface Chat {
	id: string;
	name: string;
	/** Показывается на экране диалога под именем ("Ваш гид по турам" и т.п.) */
	role?: string;
	/** Превью последнего сообщения в списке чатов */
	preview: string;
	online: boolean;
	messages: ChatMessage[];
	/** Кнопки быстрых действий над полем ввода — пока только у ИИ-агента */
	quickActions?: string[];
}

/**
 * Временные тестовые данные — замените на реальные хуки (WebSocket +
 * REST для истории), когда появится бэкенд. id используется в
 * getStaticPaths для генерации страниц /chats/[id].
 */
export const MOCK_CHATS: Chat[] = [
	{
		id: 'tour-operator',
		name: 'Туроператор',
		preview: 'You: What\'s man! · 9:40 AM',
		online: true,
		messages: [],
	},
	{
		id: 'aeroflot-support',
		name: 'Аэрофлот тех-поддержка',
		preview: 'В чате нечего нет',
		online: true,
		messages: [],
	},
	{
		id: 'guide',
		name: 'Гид',
		role: 'Ваш гид по турам',
		preview: 'В чате нечего нет',
		online: true,
		messages: [
			{
				id: '1',
				author: 'me',
				text: 'Нужна помощь',
				time: '12:00 сегодня',
			},
		],
	},
	{
		id: 'flight-s324',
		name: 'Рейс S324',
		preview: 'Вас автоматически добавили в чат',
		online: true,
		messages: [],
	},
];

export const AI_AGENT_CHAT: Chat = {
	id: 'ai-agent',
	name: 'ИИ-агент',
	role: 'твой помощник',
	preview: 'В чате нечего нет',
	online: true,
	quickActions: ['Мои билеты', 'Перенести рейс', 'История поездок', 'Мои документы'],
	messages: [
		{
			id: '1',
			author: 'me',
			text: 'Нужна помощь',
			time: '12:00 сегодня',
		},
	],
};

export function getChatById(id: string): Chat | undefined {
	return MOCK_CHATS.find((chat) => chat.id === id);
}
