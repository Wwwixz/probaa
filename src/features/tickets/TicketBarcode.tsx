import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

import styles from './tickets.module.css';

export function TicketBarcode({ value }: { value: string }) {
	const svgRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		if (!svgRef.current) return;

		// Render Code128 barcode into the SVG element.
		try {
			JsBarcode(svgRef.current, value, {
				format: 'CODE128',
				displayValue: false,
				margin: 0,
				height: 44,
				width: 2,
				background: 'transparent',
			});
		} catch {
			// ignore: barcode rendering is best-effort for demo
		}
	}, [value]);

	return (
		<div className={styles.barcodeWrap} aria-label="Штрихкод билета">
			<svg ref={svgRef} className={styles.barcodeSvg} />
		</div>
	);
}

