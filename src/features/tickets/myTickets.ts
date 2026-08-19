import { createTicketDataFromOffer, type TicketData } from './ticketCodec';

export const MY_TICKETS_KEY = 'tutu.myTickets';

export const SAMPLE_TICKET: TicketData = {
	barcodeValue: 'TUTU|643000111222333|K7M2NP|SVO|SSH|21:40|21:40|6ч20м|36A|S324-5',
	pnr: 'K7M2NP',
	eTicketNumber: '643000111222333',
	seatNumber: '36A',
	flightNumber: 'S324-5',
	fromCode: 'SVO',
	fromCity: 'Москва',
	toCode: 'SSH',
	toCity: 'Шарм-эль-шейх',
	departureTime: '21:40',
	arrivalTime: '21:40',
	duration: '6 ч 20 мин',
	title: 'Эконом',
	price: '24 900 ₽',
	kind: 'rail',
};

const DEMO_TICKETS: TicketData[] = [
	createTicketDataFromOffer({
		id: 'demo-mow-aer',
		kind: 'rail',
		title: 'Эконом',
		subtitle: 'Прямой рейс',
		fromCode: 'MOW',
		fromCity: 'Москва',
		toCode: 'AER',
		toCity: 'Сочи',
		departureTime: '08:45',
		arrivalTime: '11:20',
		duration: '2 ч 35 мин',
		price: '12 490 ₽',
		rating: '4.8',
		checkoutUrl: 'https://tutu.ru',
	}),
	SAMPLE_TICKET,
];

function migrateTicket(ticket: TicketData): TicketData {
	if (ticket.fromCode === 'SVO' && ticket.toCode === 'SSH' && ticket.departureTime === '04:30') {
		return {
			...ticket,
			flightNumber: 'S324-5',
			seatNumber: '36A',
			departureTime: '21:40',
			arrivalTime: '21:40',
		};
	}
	return ticket;
}

function isTicket(value: unknown): value is TicketData {
	if (!value || typeof value !== 'object') return false;
	const ticket = value as TicketData;
	return Boolean(ticket.barcodeValue && ticket.fromCode && ticket.toCode);
}

export function loadMyTickets(): TicketData[] {
	try {
		const raw = window.localStorage.getItem(MY_TICKETS_KEY);
		if (!raw) {
			window.localStorage.setItem(MY_TICKETS_KEY, JSON.stringify(DEMO_TICKETS));
			return DEMO_TICKETS;
		}
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed) || parsed.length === 0) {
			window.localStorage.setItem(MY_TICKETS_KEY, JSON.stringify(DEMO_TICKETS));
			return DEMO_TICKETS;
		}
		return parsed.filter(isTicket).map(migrateTicket);
	} catch {
		return DEMO_TICKETS;
	}
}

export function saveMyTicket(ticket: TicketData) {
	try {
		const current = loadMyTickets();
		const next = [ticket, ...current.filter((item) => item.barcodeValue !== ticket.barcodeValue)];
		window.localStorage.setItem(MY_TICKETS_KEY, JSON.stringify(next));
	} catch {
		// ignore
	}
}
