export interface FlightOption {
	departureTime: string;
	arrivalTime: string;
	fromCode: string;
	fromCity: string;
	fromFlagEmoji: string;
	fromFlagSvg: string;
	toCode: string;
	toCity: string;
	toFlagEmoji: string;
	toFlagSvg: string;
	flightNumber: string;
	direction: string;
	departureColor: string;
	arrivalColor: string;
	trailColor?: string;
}

export type ChatMessageContent =
	| { kind: 'text'; text: string }
	| { kind: 'flightCard'; flight: FlightOption }
	| { kind: 'moreFlightsButton'; label: string }
	| { kind: 'routeCard'; mapImage: string; buttonLabel: string }
	| { kind: 'ticketsCard'; ticketsImage: string; buttonLabel: string }
	| { kind: 'actionButton'; label: string; variant?: 'primary' }
	| {
			kind: 'choiceButtons';
			buttons: Array<{ label: string; variant: 'primary' | 'outline' }>;
	  };

export interface ChatMessage {
	id: string;
	author: 'me' | 'them';
	content: ChatMessageContent;
	time: string;
}

export interface Chat {
	id: string;
	name: string;
	role?: string;
	preview: string;
	online: boolean;
	messages: ChatMessage[];
	quickActions?: string[];
}

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
		quickActions: ['Где мой отель?', 'Заказать экскурсию', 'Погода в Египте', 'Нужна помощь'],
		messages: [
			{
				id: '1',
				author: 'me',
				content: { kind: 'text', text: 'Нужна помощь' },
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
	{
		id: 'ai-agent',
		name: 'ИИ-агент',
		role: 'поиск билетов, маршрутов и отелей через Tutu MCP',
		preview: 'Подберу билеты, отель и дам ссылку на оформление',
		online: true,
		quickActions: [
			'Найди поезд Москва -> Питер на завтра',
			'Самый дешёвый авиабилет в Сочи',
			'Собери маршрут с пересадками',
			'Подбери отель у моря'
		],
		messages: [
			{
				id: '1',
				author: 'them',
				content: {
					kind: 'text',
					text: 'Привет! Я помогу подобрать билет, маршрут или отель через Tutu и сразу дам ссылку на оформление.',
				},
				time: 'сейчас',
			},
		],
	},
];

const FLAG_RU =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="4" fill="#ffffff"/><rect y="4" width="18" height="4" fill="#0039a6"/><rect y="8" width="18" height="4" fill="#d52b1e"/></svg>'
	);

const FLAG_EG =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="4" fill="#ce1126"/><rect y="4" width="18" height="4" fill="#ffffff"/><rect y="8" width="18" height="4" fill="#000000"/><g transform="translate(9 6)"><path d="M 0 -1.5 C -1.1 -1.5 -1.3 -0.4 -0.4 -0.2 C -0.2 -0.9 0.7 -0.9 0.8 -0.2 C 1.2 -0.5 1 -1.5 0 -1.5 Z M 0.1 -0.2 l 0.5 0.4 l -0.5 0.2 z" fill="#c59b23"/></g></svg>'
	);

const FLIGHT_THERE_1: FlightOption = {
	departureTime: '21:40',
	arrivalTime: '5:40',
	fromCode: 'SVO',
	fromCity: 'Москва',
	fromFlagEmoji: '🇷🇺',
	fromFlagSvg: FLAG_RU,
	toCode: 'SSH',
	toCity: 'Шарм-эль-шейх',
	toFlagEmoji: '🇪🇬',
	toFlagSvg: FLAG_EG,
	flightNumber: 'S324',
	direction: 'Туда',
	departureColor: '#ffffff',
	arrivalColor: '#ffffff',
	trailColor: '#a181ff',
};

const FLIGHT_THERE_2: FlightOption = {
	departureTime: '23:40',
	arrivalTime: '4:15',
	fromCode: 'SVO',
	fromCity: 'Москва',
	fromFlagEmoji: '🇷🇺',
	fromFlagSvg: FLAG_RU,
	toCode: 'SSH',
	toCity: 'Шарм-эль-шейх',
	toFlagEmoji: '🇪🇬',
	toFlagSvg: FLAG_EG,
	flightNumber: 'S323',
	direction: 'Туда',
	departureColor: '#ffffff',
	arrivalColor: '#ffffff',
	trailColor: '#a181ff',
};

const FLIGHT_BACK_1: FlightOption = {
	departureTime: '04:30',
	arrivalTime: '21:50',
	fromCode: 'SVO',
	fromCity: 'Москва',
	fromFlagEmoji: '🇷🇺',
	fromFlagSvg: FLAG_RU,
	toCode: 'SSH',
	toCity: 'Шарм-эль-шейх',
	toFlagEmoji: '🇪🇬',
	toFlagSvg: FLAG_EG,
	flightNumber: 'S324=5',
	direction: 'обратно',
	departureColor: '#ffffff',
	arrivalColor: '#ffffff',
	trailColor: '#d0ff1a',
};

<<<<<<< HEAD
=======
export const AI_AGENT_CHAT: Chat = {
	id: 'ai-agent',
	name: 'ИИ-агент',
	role: 'поиск билетов, маршрутов и отелей через Tutu MCP',
	preview: 'Подберу билеты, отель и дам ссылку на оформление',
	online: true,
	quickActions: [
		'Мои билеты',
		'Найди поезд Москва -> Питер на завтра',
		'Самый дешёвый авиабилет в Сочи',
		'Собери маршрут с пересадками',
		'Подбери отель у моря'
	],
	messages: [
		{
			id: '1',
			author: 'them',
			content: {
				kind: 'text',
				text: 'Привет! Я помогу подобрать билет, маршрут или отель через Tutu и сразу дам ссылку на оформление.',
			},
			time: 'сейчас',
		},
	],
};

>>>>>>> c2e6fd9d7cfb8f66c2659ffea4272e0a012857eb
export function getChatById(id: string): Chat | undefined {
	if (id === 'ai-agent') return AI_AGENT_CHAT;
	return MOCK_CHATS.find((chat) => chat.id === id);
}
