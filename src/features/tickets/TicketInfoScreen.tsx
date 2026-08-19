import { Header } from '../../widgets/header/Header';
import { BottomNav } from '../../widgets/bottom-nav/BottomNav';
import { SAMPLE_TICKET } from './myTickets';
import { TicketDetailsCard } from './TicketDetailsCard';

/** Экран карточки билета: открывается по кнопке «Информация о билете» на сканере. */
export function TicketInfoScreen() {
	return (
		<div style={{ background: '#151515', minHeight: '100vh' }}>
			<Header />
			<TicketDetailsCard
				ticket={SAMPLE_TICKET}
				onBack={() => {
					window.location.href = '/camera';
				}}
			/>
			<BottomNav activePath="/camera" />
		</div>
	);
}
