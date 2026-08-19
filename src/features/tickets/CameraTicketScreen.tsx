import { Header } from '../../widgets/header/Header';
import { BottomNav } from '../../widgets/bottom-nav/BottomNav';

import type { TicketData } from './ticketCodec';
import { saveMyTicket } from './myTickets';
import { TicketScanner } from './TicketScanner';

function persistTicket(ticket: TicketData) {
	try {
		window.localStorage.setItem('tutu.ticketDemo.lastBarcode', ticket.barcodeValue);
		window.localStorage.setItem('tutu.ticketDemo.lastTicket', JSON.stringify(ticket));
		saveMyTicket(ticket);
	} catch {
		// ignore
	}
}

export function CameraTicketScreen() {
	return (
		<>
			<Header />
			<TicketScanner onScanned={persistTicket} />
			<BottomNav activePath="/camera" />
		</>
	);
}
