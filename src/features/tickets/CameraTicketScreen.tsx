import { useEffect, useMemo, useState } from 'react';
import { Header } from '../../widgets/header/Header';
import { BottomNav } from '../../widgets/bottom-nav/BottomNav';

import type { AiAgentOfferCard } from '../../shared/api/ai-agent';
import { createTicketDataFromOffer, type TicketData } from './ticketCodec';
import { TicketScanner } from './TicketScanner';
import { TicketDetailsCard } from './TicketDetailsCard';

const DEMO_OFFER_KEY = 'tutu.ticketDemo.offer';

export function CameraTicketScreen() {
	const [demoOffer, setDemoOffer] = useState<AiAgentOfferCard | null>(null);
	const [ticket, setTicket] = useState<TicketData | null>(null);
	const [mode, setMode] = useState<'scan' | 'details'>('scan');

	useEffect(() => {
		try {
			const raw = window.localStorage.getItem(DEMO_OFFER_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw) as AiAgentOfferCard;
			if (parsed && typeof parsed.id === 'string') setDemoOffer(parsed);
		} catch {
			// ignore
		}
	}, []);

	const onUseDemoTicket = () => {
		if (!demoOffer) return;
		const created = createTicketDataFromOffer(demoOffer);
		setTicket(created);
		setMode('details');

		// Persist barcode->ticket mapping so a scan can instantly open the same card,
		// even if user scans back in the next moment.
		try {
			window.localStorage.setItem(
				'tutu.ticketDemo.lastBarcode',
				created.barcodeValue
			);
			window.localStorage.setItem('tutu.ticketDemo.lastTicket', JSON.stringify(created));
		} catch {
			// ignore
		}
	};

	const onScanned = (decodedTicket: TicketData) => {
		setTicket(decodedTicket);
		setMode('details');
	};

	const activePath = useMemo(() => '/camera', []);

	return (
		<>
			<Header />

			{mode === 'scan' && (
				<TicketScanner
					demoOffer={demoOffer}
					onScanned={onScanned}
					onUseDemoTicket={onUseDemoTicket}
				/>
			)}

			{mode === 'details' && ticket && <TicketDetailsCard ticket={ticket} onBackToScan={() => setMode('scan')} />}

			{/* BottomNav просит activePath — для /camera подсветка будет нулевой, но стиль сохранится */}
			<BottomNav activePath={activePath} />
		</>
	);
}

