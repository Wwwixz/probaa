import { useEffect, useRef, useState } from 'react';
import { ScanLine } from 'lucide-react';
import zxingBrowser from '@zxing/browser';

import styles from './tickets.module.css';
import { decodeTicketBarcode, type TicketData } from './ticketCodec';
import type { AiAgentOfferCard } from '../../shared/api/ai-agent';

const { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } = zxingBrowser;

export function TicketScanner({
	demoOffer,
	onScanned,
	onUseDemoTicket,
}: {
	demoOffer: AiAgentOfferCard | null;
	onScanned: (ticket: TicketData) => void;
	onUseDemoTicket: () => void;
}) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isScanning, setIsScanning] = useState(false);

	useEffect(() => {
		let stopped = false;
		let reader: any = null;
		let stopFn: null | (() => void) = null;

		async function start() {
			setError(null);
			setIsScanning(false);

			if (!videoRef.current) return;

			try {
				// Restrict to barcode formats; speeds up decoding.
				const hints = new Map();
				hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128]);

				reader = new BrowserMultiFormatReader(hints);
				setIsScanning(true);

				const controls = await reader.decodeFromConstraints(
					{ video: { facingMode: 'environment' } },
					videoRef.current,
					(result: any) => {
						if (stopped) return;

						const value = result?.getText?.() ?? null;
						if (!value) return;

						const decoded = decodeTicketBarcode(String(value));
						if (!decoded) {
							setError('Не удалось прочитать данные билета. Попробуйте ещё раз.');
							return;
						}

						// Stop camera scanning immediately after decode.
						controls?.stop?.();
						stopFn?.();
						setIsScanning(false);

						onScanned(decoded);
					}
				);

				stopFn = () => controls?.stop?.();
			} catch (e) {
				// Most common cases: permission denied / no camera / unsupported browser.
				console.error(e);
				setError('Камера недоступна. Разрешите доступ к камере или используйте демо-вариант.');
				setIsScanning(false);
			}
		}

		start();

		return () => {
			stopped = true;
			stopFn?.();
			try {
				reader?.reset?.();
			} catch {
				// ignore
			}
		};
		// Intentionally run once on mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={styles.scannerPage}>
			<div className={styles.scannerVideoWrap}>
				<video ref={videoRef} className={styles.scannerVideo} muted playsInline />
				<div className={styles.scannerOverlay} />
				<div className={styles.scannerFrame} />
				<div className={styles.scannerFrameInner} />
			</div>

			<div className={styles.scannerControls}>
				{error && <div className={styles.scannerError}>{error}</div>}

				<button type="button" className={styles.scannerButtonSecondary} onClick={onUseDemoTicket} disabled={!demoOffer}>
					<ScanLine size={16} />
					<span style={{ marginLeft: 8 }}>Показать билет из чата (демо)</span>
				</button>

				<p className={styles.ticketScanHint}>
					{isScanning ? 'Сканирую штрихкод…' : 'Наведи камеру на штрихкод. (Демо-вариант — кнопка ниже)'}
				</p>
			</div>
		</div>
	);
}

