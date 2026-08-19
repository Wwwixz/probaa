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
			'Подбери отель у моря',
		],
		messages: [
			{
				id: '1',
				author: 'them',
				content: {
					kind: 'text',
					text: 'Я могу искать ж/д, авиа, автобус, электрички, отели и мультимаршруты через Tutu MCP, а потом давать ссылку на оформление. Попробуйте спросить про билеты, пересадки или проживание.',
				},
				time: 'сейчас',
			},
			{
				id: '2',
				author: 'me',
				content: { kind: 'text', text: 'Нужна помощь' },
				time: '12:00 сегодня',
			},
			{
				id: '3',
				author: 'them',
				content: { kind: 'text', text: 'Отлично, чем я могу вам помочь?' },
				time: '12:00 сегодня',
			},
			{
				id: '4',
				author: 'me',
				content: {
					kind: 'text',
					text: 'Нужны билеты от москвы до Шарм-эль-шейха с УТРЕННИМ прилётом и поздним вылетом, чтобы день не ушёл!',
				},
				time: '12:00 сегодня',
			},
			{
				id: '5',
				author: 'them',
				content: { kind: 'text', text: 'Хорошо, вот подборка билетов в шарм по вашим усмотрением' },
				time: '12:00 сегодня',
			},
			{
				id: '6',
				author: 'them',
				content: {
					kind: 'flightCard',
					flight: {
						departureTime: '21:40',
						arrivalTime: '5:40',
						fromCode: 'SVO',
						fromCity: 'Москва',
						fromFlagEmoji: '🇷🇺',
						fromFlagSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="4" fill="%23ffffff"/><rect y="4" width="18" height="4" fill="%230039a6"/><rect y="8" width="18" height="4" fill="%23d52b1e"/></svg>',
						toCode: 'SSH',
						toCity: 'Шарм-эль-шейх',
						toFlagEmoji: '🇪🇬',
						toFlagSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="4" fill="%23ce1126"/><rect y="4" width="18" height="4" fill="%23ffffff"/><rect y="8" width="18" height="4" fill="%23000000"/><g transform="translate(9 6)"><path d="M 0 -1.5 C -1.1 -1.5 -1.3 -0.4 -0.4 -0.2 C -0.2 -0.9 0.7 -0.9 0.8 -0.2 C 1.2 -0.5 1 -1.5 0 -1.5 Z M 0.1 -0.2 l 0.5 0.4 l -0.5 0.2 z" fill="%23c59b23"/></g></svg>',
						flightNumber: 'S324',
						direction: 'Туда',
						departureColor: '#ffffff',
						arrivalColor: '#ffffff',
						trailColor: '#a181ff',
					},
				},
				time: '12:00 сегодня',
			},
			{
				id: '7',
				author: 'them',
				content: {
					kind: 'flightCard',
					flight: {
						departureTime: '23:40',
						arrivalTime: '4:15',
						fromCode: 'SVO',
						fromCity: 'Москва',
						fromFlagEmoji: '🇷🇺',
						fromFlagSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="4" fill="%23ffffff"/><rect y="4" width="18" height="4" fill="%230039a6"/><rect y="8" width="18" height="4" fill="%23d52b1e"/></svg>',
						toCode: 'SSH',
						toCity: 'Шарм-эль-шейх',
						toFlagEmoji: '🇪🇬',
						toFlagSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="4" fill="%23ce1126"/><rect y="4" width="18" height="4" fill="%23ffffff"/><rect y="8" width="18" height="4" fill="%23000000"/><g transform="translate(9 6)"><path d="M 0 -1.5 C -1.1 -1.5 -1.3 -0.4 -0.4 -0.2 C -0.2 -0.9 0.7 -0.9 0.8 -0.2 C 1.2 -0.5 1 -1.5 0 -1.5 Z M 0.1 -0.2 l 0.5 0.4 l -0.5 0.2 z" fill="%23c59b23"/></g></svg>',
						flightNumber: 'S323',
						direction: 'Туда',
						departureColor: '#ffffff',
						arrivalColor: '#ffffff',
						trailColor: '#a181ff',
					},
				},
				time: '12:00 сегодня',
			},
			{
				id: '8',
				author: 'them',
				content: { kind: 'moreFlightsButton', label: 'Посмотреть еще варианты' },
				time: '12:00 сегодня',
			},
			{
				id: '9',
				author: 'them',
				content: {
					kind: 'text',
					text: 'Отлично, бронь S324 прошла успешно, теперь определимся с билетами обратно в Москву',
				},
				time: '12:00 сегодня',
			},
			{
				id: '10',
				author: 'them',
				content: {
					kind: 'flightCard',
					flight: {
						departureTime: '04:30',
						arrivalTime: '21:50',
						fromCode: 'SVO',
						fromCity: 'Москва',
						fromFlagEmoji: '🇷🇺',
						fromFlagSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="4" fill="%23ffffff"/><rect y="4" width="18" height="4" fill="%230039a6"/><rect y="8" width="18" height="4" fill="%23d52b1e"/></svg>',
						toCode: 'SSH',
						toCity: 'Шарм-эль-шейх',
						toFlagEmoji: '🇪🇬',
						toFlagSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="4" fill="%23ce1126"/><rect y="4" width="18" height="4" fill="%23ffffff"/><rect y="8" width="18" height="4" fill="%23000000"/><g transform="translate(9 6)"><path d="M 0 -1.5 C -1.1 -1.5 -1.3 -0.4 -0.4 -0.2 C -0.2 -0.9 0.7 -0.9 0.8 -0.2 C 1.2 -0.5 1 -1.5 0 -1.5 Z M 0.1 -0.2 l 0.5 0.4 l -0.5 0.2 z" fill="%23c59b23"/></g></svg>',
						flightNumber: 'S324=5',
						direction: 'обратно',
						departureColor: '#ffffff',
						arrivalColor: '#ffffff',
						trailColor: '#d0ff1a',
					},
				},
				time: '12:00 сегодня',
			},
			{
				id: '11',
				author: 'them',
				content: { kind: 'moreFlightsButton', label: 'Посмотреть еще варианты' },
				time: '12:00 сегодня',
			},
			{
				id: '12',
				author: 'them',
				content: {
					kind: 'text',
					text: 'Отлично, бронь S324=5 прошла успешно, подтвердим билеты',
				},
				time: '12:00 сегодня',
			},
			{
				id: '13',
				author: 'them',
				content: {
					kind: 'choiceButtons',
					buttons: [
						{ label: 'Подтвердить билеты', variant: 'primary' },
						{ label: 'Другие варианты', variant: 'outline' },
					],
				},
				time: '12:00 сегодня',
			},
			{
				id: '14',
				author: 'them',
				content: {
					kind: 'text',
					text: 'Подтвердил билеты, чтобы выбрать способ оплаты, выберите из списка',
				},
				time: '12:00 сегодня',
			},
			{
				id: '15',
				author: 'them',
				content: {
					kind: 'choiceButtons',
					buttons: [
						{ label: 'Оплатить банком', variant: 'primary' },
						{ label: 'Отменить покупку', variant: 'outline' },
					],
				},
				time: '12:00 сегодня',
			},
			{
				id: '16',
				author: 'them',
				content: {
					kind: 'text',
					text: 'Оплата произошла успешно, в файлах находится вся информация о рейсах и маршрут полета.',
				},
				time: '12:00 сегодня',
			},
			{
				id: '17',
				author: 'them',
				content: {
					kind: 'routeCard',
					mapImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220"><rect width="320" height="220" fill="%23bbbbbb"/><g fill="%239a9a9a"><rect x="0" y="30" width="80" height="80" opacity="0.55"/><rect x="90" y="10" width="60" height="70" opacity="0.6"/><rect x="160" y="40" width="70" height="90" opacity="0.5"/><rect x="240" y="20" width="70" height="60" opacity="0.6"/><rect x="20" y="130" width="90" height="80" opacity="0.55"/><rect x="130" y="130" width="80" height="80" opacity="0.6"/><rect x="220" y="110" width="90" height="100" opacity="0.5"/></g><g stroke="%23dcdcdc" stroke-width="2"><line x1="0" y1="110" x2="320" y2="110"/><line x1="160" y1="0" x2="160" y2="220"/></g><g transform="translate(160 110) rotate(-20)"><g stroke="%23ff7a00" stroke-width="4" fill="none"><circle cx="90" cy="-50" r="14" stroke-dasharray="2 2"/><path d="M 80 -38 Q 30 -10 10 0" /></g><g stroke="%23a181ff" stroke-width="4" fill="none"><circle cx="-100" cy="50" r="14" stroke-dasharray="2 2"/></g><circle cx="90" cy="-50" r="18" fill="%23ff7a00" opacity="0.55"/><circle cx="90" cy="-50" r="10" fill="%23ff7a00"/><circle cx="-100" cy="50" r="18" fill="%23a181ff" opacity="0.55"/><circle cx="-100" cy="50" r="10" fill="%23a181ff"/><g transform="translate(0 -10) rotate(20)"><g fill="%23ffffff" stroke="%23e5e7eb" stroke-width="2"><path d="M -110 -10 L 80 -20 L 100 0 L 80 20 L -110 10 L -130 20 L -140 20 L -130 5 L -130 -5 L -140 -20 L -130 -20 Z"/><path d="M -40 -20 L -30 -55 L -10 -50 L -20 -20 Z" fill="%23c7c9cd"/><path d="M -40 20 L -30 55 L -10 50 L -20 20 Z" fill="#c7c9cd"/><circle cx="-70" cy="-5" r="6" fill="%23a181ff"/><circle cx="30" cy="-10" r="6" fill="%23ff7a00"/></g></g></g></svg>',
					buttonLabel: 'Посмотреть маршрут',
				},
				time: '12:06 сегодня',
			},
			{
				id: '18',
				author: 'them',
				content: {
					kind: 'ticketsCard',
					ticketsImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23ffffff"/><stop offset="100%" stop-color="%23d9ccff"/></linearGradient></defs><g transform="translate(10 50) rotate(-8)"><path d="M 0 0 L 200 0 C 210 0 216 6 216 14 L 216 30 C 224 30 230 36 230 44 L 230 76 C 230 84 224 90 216 90 L 216 106 C 216 114 210 120 200 120 L 0 120 Z" fill="url(%23tg)" stroke="%2322c55e" stroke-width="8"/><line x1="170" y1="0" x2="170" y2="120" stroke="%2322c55e" stroke-width="2" stroke-dasharray="4 4"/><path d="M 170 -6 a 6 6 0 0 0 0 12 Z" fill="%23f1efe7"/><path d="M 170 114 a 6 6 0 0 0 0 -12 Z" fill="%23f1efe7"/><rect x="14" y="16" width="140" height="26" rx="4" fill="%23ffffff" stroke="%23e2dfd7"/><rect x="14" y="52" width="100" height="12" rx="3" fill="%23e2dfd7"/><rect x="14" y="70" width="140" height="16" rx="4" fill="%23ffffff" stroke="%23e2dfd7"/></g><g transform="translate(70 20) rotate(6)"><path d="M 0 0 L 200 0 C 210 0 216 6 216 14 L 216 30 C 224 30 230 36 230 44 L 230 76 C 230 84 224 90 216 90 L 216 106 C 216 114 210 120 200 120 L 0 120 Z" fill="url(%23tg)" stroke="%23a181ff" stroke-width="8"/><line x1="170" y1="0" x2="170" y2="120" stroke="%23a181ff" stroke-width="2" stroke-dasharray="4 4"/><path d="M 170 -6 a 6 6 0 0 0 0 12 Z" fill="%23f1efe7"/><path d="M 170 114 a 6 6 0 0 0 0 -12 Z" fill="%23f1efe7"/><rect x="14" y="16" width="140" height="26" rx="4" fill="%23ffffff" stroke="%23e2dfd7"/><rect x="14" y="52" width="100" height="12" rx="3" fill="%23e2dfd7"/><rect x="14" y="70" width="140" height="16" rx="4" fill="%23ffffff" stroke="%23e2dfd7"/></g></svg>',
					buttonLabel: 'Скачать билеты',
				},
				time: '12:06 сегодня',
			},
			{
				id: '19',
				author: 'them',
				content: {
					kind: 'text',
					text: 'Поздравляем, при покупке любого билета вы автоматически участвуете в розыгрыше и для вас доступна мини игра. Чтобы узнать подробности, нажмите на кнопку "мини игра"',
				},
				time: '12:00 сегодня',
			},
			{
				id: '20',
				author: 'them',
				content: { kind: 'actionButton', label: 'Мини игра', variant: 'primary' },
				time: '12:00 сегодня',
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
export const AI_AGENT_CHAT: Chat = {
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
};

=======
>>>>>>> c525188107d867a3231c78d40a7e8dfdd2249777
export function getChatById(id: string): Chat | undefined {
	return MOCK_CHATS.find((chat) => chat.id === id);
}
