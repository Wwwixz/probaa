import { useEffect, useRef, useState } from 'react';
import { ScanLine } from 'lucide-react';
import zxingBrowser from '@zxing/browser';

import styles from './tickets.module.css';
import { decodeTicketBarcode, type TicketData } from './ticketCodec';

const { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } = zxingBrowser;

export function TicketScanner({
	onScanned,
}: {
	onScanned: (ticket: TicketData) => void;
}) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isScanning, setIsScanning] = useState(false);
	const [scannedOk, setScannedOk] = useState(false);

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
						setScannedOk(true);
						onScanned(decoded);
					}
				);

				stopFn = () => controls?.stop?.();
			} catch (e) {
				// Most common cases: permission denied / no camera / unsupported browser.
				console.error(e);
				setError('Камера недоступна. Разрешите доступ к камере или откройте информацию о билете кнопкой ниже.');
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
			<div className={styles.scannerHead}>
				<p className={styles.scannerKicker}>Камера</p>
				<h1 className={styles.scannerTitle}>Сканер билета</h1>
			</div>

			<div className={styles.scannerVideoWrap}>
				<video ref={videoRef} className={styles.scannerVideo} muted playsInline />
				<div className={styles.scannerOverlay} />
				<div className={styles.scannerFrame} aria-hidden="true">
					<span className={styles.scannerCorner} />
					<span className={`${styles.scannerCorner} ${styles.scannerCornerTr}`} />
					<span className={`${styles.scannerCorner} ${styles.scannerCornerBl}`} />
					<span className={`${styles.scannerCorner} ${styles.scannerCornerBr}`} />
					<span className={styles.scannerLaser} />
				</div>
				<div className={`${styles.scannerStatus} ${isScanning ? styles.scannerStatusLive : ''}`}>
					<span className={styles.scannerStatusDot} />
					{isScanning ? 'Ищу штрихкод' : 'Камера не активна'}
				</div>
			</div>

			<div className={styles.scannerControls}>
				<a href="/ticket" className={styles.scannerButtonSecondary} data-astro-reload>
					<ScanLine size={18} />
					Информация о билете
				</a>

				{scannedOk && <div className={styles.scannerSuccess}>Штрихкод считан. Откройте информацию о билете.</div>}
				{error && <div className={styles.scannerError}>{error}</div>}

				<p className={styles.ticketScanHint}>
					Наведи штрихкод в рамку или открой информацию о билете кнопкой ниже.
				</p>
			</div>
		</div>
	);
}

