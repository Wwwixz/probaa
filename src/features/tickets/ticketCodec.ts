import type { AiAgentOfferCard } from '../../shared/api/ai-agent';

export type TicketData = {
	barcodeValue: string;
	pnr: string;
	eTicketNumber: string;
	seatNumber: string;
	flightNumber: string;

	fromCode: string;
	fromCity: string;
	toCode: string;
	toCity: string;
	departureTime: string;
	arrivalTime: string;
	duration: string;

	title: string;
	price: string;
	kind: AiAgentOfferCard['kind'];
};

const AIRPORTS: Record<
	string,
	{ city: string; airportName: string; coords?: [number, number] }
> = {
	// Demo mapping for common routes used in mocks.
	MOW: { city: 'Москва', airportName: 'Москва' },
	SVO: { city: 'Москва', airportName: 'Шереметьево', coords: [37.414, 55.972] },
	DME: { city: 'Москва', airportName: 'Домодедово' },
	AER: { city: 'Сочи', airportName: 'Адлер', coords: [39.9041, 43.4057] },
	SSH: { city: 'Шарм-эль-шейх', airportName: 'Шарм-эль-шейх', coords: [34.4494, 27.9792] },
	'SSH ': { city: 'Шарм-эль-шейх', airportName: 'Шарм-эль-шейх' },
};

function mapAirport(code: string) {
	const key = code.trim().toUpperCase();
	return AIRPORTS[key];
}

function generatePNR(): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	let result = '';
	for (let i = 0; i < 6; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

function generateSeatNumber(): string {
	const row = Math.floor(Math.random() * 28) + 1;
	// Keep same seat-like format as existing AiAgentScreen demo.
	const seat = ['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)];
	return `${row}${seat}`;
}

function generateFlightNumber(offer: AiAgentOfferCard): string {
	// In the UI we only need something consistent-looking for the demo.
	const carriers = ['SU', 'S7', 'UT', 'FV', 'DP', 'U6'];
	const carrier = carriers[Math.floor(Math.random() * carriers.length)];
	const num = Math.floor(Math.random() * 8000) + 100;
	// Prefer route-ish output when possible.
	void offer;
	return `${carrier} ${num}`;
}

function makeBarcodeValue(args: {
	pnr: string;
	eTicketNumber: string;
	seatNumber: string;
	fromCode: string;
	toCode: string;
	departureTime: string;
	arrivalTime: string;
	duration: string;
	flightNumber: string;
}) {
	// Code128-friendly, compact and parsable:
	// TUTU|<eTicket>|<pnr>|<fromCode>|<toCode>|<dep>|<arr>|<dur>|<seat>|<flight>
	// (City names are intentionally NOT included; UI derives them from codes.)
	return [
		'TUTU',
		args.eTicketNumber,
		args.pnr,
		args.fromCode,
		args.toCode,
		args.departureTime,
		args.arrivalTime,
		args.duration,
		args.seatNumber,
		args.flightNumber.replace(/\s+/g, ''),
	].join('|');
}

function parseCompactBarcode(value: string) {
	// Returns null on invalid format.
	const parts = value.split('|');
	if (parts.length < 10) return null;
	if (parts[0] !== 'TUTU') return null;

	const [
		_,
		eTicketNumber,
		pnr,
		fromCode,
		toCode,
		departureTime,
		arrivalTime,
		duration,
		seatNumber,
		flightCompact,
	] = parts;

	return {
		eTicketNumber,
		pnr,
		fromCode,
		toCode,
		departureTime,
		arrivalTime,
		duration,
		seatNumber,
		flightNumber: flightCompact.replace(/([A-Z]{2})(\d+)/, '$1 $2'),
	};
}

export function createTicketDataFromOffer(offer: AiAgentOfferCard): TicketData {
	const fromAirport = mapAirport(offer.fromCode);
	const toAirport = mapAirport(offer.toCode);

	const pnr = generatePNR();
	const seatNumber = generateSeatNumber();
	const eTicketNumber =
		'643' + Math.floor(Math.random() * 1_000_000_000_000).toString().padStart(13, '0');
	const flightNumber = generateFlightNumber(offer);

	const barcodeValue = makeBarcodeValue({
		pnr,
		eTicketNumber,
		seatNumber,
		fromCode: offer.fromCode,
		toCode: offer.toCode,
		departureTime: offer.departureTime,
		arrivalTime: offer.arrivalTime,
		duration: offer.duration,
		flightNumber,
	});

	return {
		barcodeValue,
		pnr,
		eTicketNumber,
		seatNumber,
		flightNumber,

		fromCode: offer.fromCode,
		fromCity: fromAirport?.city ?? offer.fromCity,
		toCode: offer.toCode,
		toCity: toAirport?.city ?? offer.toCity,
		departureTime: offer.departureTime,
		arrivalTime: offer.arrivalTime,
		duration: offer.duration,

		title: offer.title,
		price: offer.price,
		kind: offer.kind,
	};
}

export function decodeTicketBarcode(value: string): TicketData | null {
	try {
		const parsed = parseCompactBarcode(value.trim());
		if (!parsed) return null;

		const fromAirport = mapAirport(parsed.fromCode);
		const toAirport = mapAirport(parsed.toCode);

		// We don't have title/price/kind inside the barcode,
		// so keep UI demo-friendly placeholders.
		const placeholderOfferLike = {
			kind: 'rail' as const,
			title: 'Эконом',
			price: '— ₽',
			fromCity: fromAirport?.city ?? parsed.fromCode,
			toCity: toAirport?.city ?? parsed.toCode,
		};

		const barcodeValue = value;

		return {
			barcodeValue,
			pnr: parsed.pnr,
			eTicketNumber: parsed.eTicketNumber,
			seatNumber: parsed.seatNumber,
			flightNumber: parsed.flightNumber,

			fromCode: parsed.fromCode,
			fromCity: fromAirport?.city ?? placeholderOfferLike.fromCity,
			toCode: parsed.toCode,
			toCity: toAirport?.city ?? placeholderOfferLike.toCity,
			departureTime: parsed.departureTime,
			arrivalTime: parsed.arrivalTime,
			duration: parsed.duration,

			title: placeholderOfferLike.title,
			price: placeholderOfferLike.price,
			kind: placeholderOfferLike.kind,
		};
	} catch {
		return null;
	}
}

export function getAirportName(code: string): string {
	return mapAirport(code)?.airportName ?? code;
}

export function getAirportCoords(code: string): [number, number] | null {
	return mapAirport(code)?.coords ?? null;
}

