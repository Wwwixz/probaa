import { useState } from 'react';
import { Plus, Minus, MapPinOff } from 'lucide-react';
import mapPlaceholder from '../../assets/images/map/map-city-placeholder.jpg';
import { Header } from '../../widgets/header/Header';
import { BottomNav } from '../../widgets/bottom-nav/BottomNav';
import styles from './map.module.css';

type ViewMode = '3D' | '2D' | 'HD';

/**
 * Экран карты. Сама карта — статичный плейсхолдер-скриншот, не
 * настоящий SDK. Когда подключим реальный картографический провайдер
 * (2ГИС/Mapbox — см. docs/ARCHITECTURE.md), эта картинка заменяется
 * на компонент карты, а элементы управления (зум, переключатель
 * режима, метка) — на реальные обработчики.
 */
export function MapScreen() {
	const [zoom, setZoom] = useState(14);
	const [viewMode, setViewMode] = useState<ViewMode>('3D');

	return (
		<>
			<Header />

			<div className={styles.mapWrap}>
				<img src={mapPlaceholder.src} alt="Карта города" className={styles.mapImage} />

				<div className={styles.locationPill}>
					<MapPinOff size={14} />
					<span>Москва</span>
				</div>

				<div className={styles.zoomControls}>
					<button
						type="button"
						onClick={() => setZoom((z) => Math.min(z + 1, 20))}
						className={styles.mapControlButton}
						aria-label="Приблизить"
					>
						<Plus size={16} />
					</button>
					<button
						type="button"
						onClick={() => setZoom((z) => Math.max(z - 1, 1))}
						className={styles.mapControlButton}
						aria-label="Отдалить"
					>
						<Minus size={16} />
					</button>
				</div>

				<div className={styles.viewModeSwitcher}>
					{(['3D', '2D', 'HD'] as ViewMode[]).map((mode) => (
						<button
							key={mode}
							type="button"
							onClick={() => setViewMode(mode)}
							className={`${styles.viewModeButton} ${viewMode === mode ? styles.viewModeButtonActive : ''}`}
						>
							{mode}
						</button>
					))}
				</div>

				<div className={styles.locationMarker} aria-hidden="true">
					<span className={styles.locationMarkerPulse} />
					<span className={styles.locationMarkerDot} />
				</div>
			</div>

			<BottomNav activePath="/map" />
		</>
	);
}
