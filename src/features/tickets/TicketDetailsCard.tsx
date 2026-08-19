import styles from './tickets.module.css';
import type { TicketData } from './ticketCodec';
import { TicketBarcode } from './TicketBarcode';
import { getAirportCoords } from './ticketCodec';

import mapPlaceholder from '../../assets/images/map/map-city-placeholder.jpg';

const ROUTE_IMAGE_DEPARTURE =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="82" height="16" viewBox="0 0 82 16" fill="none">
  <path d="M2 8H29" stroke="#8B6BFF" stroke-width="5" stroke-linecap="round"/>
  <path d="M50 8H79" stroke="#B4ADB5" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="4.8 4.8"/>
  <path d="M47.6 3.1L42.4 6L32.8 5.2L30.5 6.7L39 7.7L41.9 11.2L44.4 11.5L42.3 8.2L50 9L52.3 7.5L43.7 6.5L40.8 3.1L38.3 2.8L40.5 6.1L47.6 3.1Z" fill="white"/>
</svg>`);

const FLAG_RU =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="4" fill="#ffffff"/><rect y="4" width="18" height="4" fill="#0039a6"/><rect y="8" width="18" height="4" fill="#d52b1e"/></svg>'
	);

const FLAG_EG =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="4" fill="#ce1126"/><rect y="4" width="18" height="4" fill="#ffffff"/><rect y="8" width="18" height="4" fill="#000000"/></svg>'
	);

function getRouteImage() {
	return ROUTE_IMAGE_DEPARTURE;
}

function getFlagSvg(city: string) {
	const normalized = city.toLowerCase();
	if (normalized.includes('шарм') || normalized.includes('егип')) return FLAG_EG;
	return FLAG_RU;
}

function getAirportLabel(code: string) {
	// Minimal mapping; main screen uses TicketCodec for city names already.
	if (code.trim().toUpperCase() === 'SVO') return 'Шереметьево';
	if (code.trim().toUpperCase() === 'SSH') return 'Шарм-эль-шейх';
	if (code.trim().toUpperCase() === 'AER') return 'Адлер';
	return code;
}

export function TicketDetailsCard({
	ticket,
	onBackToScan,
}: {
	ticket: TicketData;
	onBackToScan: () => void;
}) {
	const cityFlagFrom = getFlagSvg(ticket.fromCity);
	const cityFlagTo = getFlagSvg(ticket.toCity);

	// For demo we always show "Туда". If you later encode direction into barcode,
	// this can be derived from `ticket`.
	const routeImage = getRouteImage();

	// Get airport coordinates for map display
	const airportCoords = getAirportCoords(ticket.fromCode);

	return (
		<div className={styles.ticketPage}>
			<button type="button" className={styles.ticketBackBtn} onClick={onBackToScan}>
				<span>←</span>
				<span>Сканировать снова</span>
			</button>

			<div className={styles.ticketDetailsCard}>
				<div className={styles.ticketTitle}>
					{ticket.fromCode}-{ticket.toCode}
				</div>
				<div className={styles.ticketSubtitle}>Самолет</div>

				<div className={styles.ticketRouteCard}>
					<div className={styles.ticketTimes}>
						<span>{ticket.departureTime}</span>
						<span>{ticket.arrivalTime}</span>
					</div>

					<div className={styles.ticketRouteGrid}>
						<div className={styles.ticketPoint}>
							<span className={styles.ticketCode}>{ticket.fromCode}</span>
							<div className={styles.ticketCityRow}>
								<span className={styles.ticketCity}>{ticket.fromCity}</span>
								<img src={cityFlagFrom} alt="" className={styles.ticketFlag} />
							</div>
						</div>

						<div className={styles.ticketLine}>
							<img src={routeImage} alt="" className={styles.ticketPlaneArt} />
						</div>

						<div className={styles.ticketPoint}>
							<span className={styles.ticketCode}>{ticket.toCode}</span>
							<div className={styles.ticketCityRow}>
								<span className={styles.ticketCity}>{ticket.toCity}</span>
								<img src={cityFlagTo} alt="" className={styles.ticketFlag} />
							</div>
						</div>
					</div>

					<div className={styles.ticketFooter}>
						<span className={styles.ticketChip}>{ticket.fromCode}</span>
						<span className={styles.ticketDirection}>Туда</span>
					</div>
				</div>

				<div className={styles.ticketCTA}>
					Рейс {ticket.flightNumber} от Аэрофлота в аэропорту {getAirportLabel(ticket.fromCode)}
				</div>

				<div className={styles.ticketAirportRow}>
					<div className={styles.ticketAirportLabel}>Аэропорт: {getAirportLabel(ticket.fromCode)}</div>
					<div className={styles.ticketLogoCircle}>L</div>
				</div>

				<div className={styles.ticketMapSectionTitle}>Местоположение аэропорта на карте</div>
				{airportCoords ? (
					<div className={styles.ticketMapThumb}>
						<img 
							src={`https://static-maps.yandex.ru/1.x/?ll=${airportCoords[0]},${airportCoords[1]}&z=12&l=map&pt=${airportCoords[0]},${airportCoords[1]},pm2rdm`}
							className={styles.ticketMapImg} 
							alt={`Карта аэропорта ${getAirportLabel(ticket.fromCode)}`}
						/>
					</div>
				) : (
					<div className={styles.ticketMapThumb}>
						<img src={mapPlaceholder.src} className={styles.ticketMapImg} alt="Карта аэропорта" />
					</div>
				)}

				<TicketBarcode value={ticket.barcodeValue} />
			</div>
		</div>
	);
}

