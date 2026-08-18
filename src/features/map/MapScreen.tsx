import { useEffect, useRef, useState } from 'react';
import { Plus, Minus, MapPinOff } from 'lucide-react';
import mapPlaceholder from '../../assets/images/map/map-city-placeholder.jpg';
import { Header } from '../../widgets/header/Header';
import { BottomNav } from '../../widgets/bottom-nav/BottomNav';
import styles from './map.module.css';

type ViewMode = '3D' | '2D' | 'HD';

// Координаты центра Москвы — старт по умолчанию, пока нет геолокации пользователя
const DEFAULT_CENTER: [number, number] = [37.6173, 55.7558];

/**
 * Экран карты на реальном 2ГИС MapGL SDK.
 *
 * Требует API-ключ: зарегистрироваться на https://docs.2gis.com/ru/mapgl/overview,
 * получить бесплатный ключ для разработки и положить его в .env как
 * PUBLIC_2GIS_API_KEY=ваш_ключ (переменные с префиксом PUBLIC_ в Astro
 * доступны в браузере — см. .env.example).
 *
 * Без ключа показывается статичный плейсхолдер-скриншот вместо
 * реальной карты — ничего не падает, просто карта не интерактивна.
 */
export function MapScreen() {
	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<any>(null);
	const markerRef = useRef<any>(null);

	const [zoom, setZoom] = useState(14);
	const [viewMode, setViewMode] = useState<ViewMode>('3D');
	const [mapReady, setMapReady] = useState(false);
	const [mapFailed, setMapFailed] = useState(false);

	const apiKey = import.meta.env.PUBLIC_2GIS_API_KEY as string | undefined;

	useEffect(() => {
		if (!apiKey || !containerRef.current) {
			setMapFailed(true);
			return;
		}

		let cancelled = false;

		import('@2gis/mapgl')
			.then(({ load }) => load())
			.then((mapglAPI) => {
				if (cancelled || !containerRef.current) return;

				const map = new mapglAPI.Map(containerRef.current, {
					center: DEFAULT_CENTER,
					zoom,
					pitch: 45,
					key: apiKey,
				});

				const marker = new mapglAPI.Marker(map, {
					coordinates: DEFAULT_CENTER,
				});

				mapRef.current = map;
				markerRef.current = marker;
				setMapReady(true);
			})
			.catch((error) => {
				console.error('Не удалось загрузить 2ГИС MapGL', error);
				if (!cancelled) setMapFailed(true);
			});

		return () => {
			cancelled = true;
			mapRef.current?.destroy?.();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiKey]);

	function handleZoomChange(next: number) {
		const clamped = Math.max(1, Math.min(20, next));
		setZoom(clamped);
		mapRef.current?.setZoom(clamped);
	}

	function handleViewModeChange(mode: ViewMode) {
		setViewMode(mode);
		if (!mapRef.current) return;
		// У 2ГИС нет прямого переключателя "3D/2D/HD" как на макете —
		// приближённо эмулируем через наклон камеры (pitch)
		mapRef.current.setPitch(mode === '3D' ? 45 : 0);
	}

	return (
		<>
			<Header />

			<div className={styles.mapWrap}>
				{/* Контейнер для реальной карты 2ГИС — всегда в DOM, чтобы
				    MapGL было куда рендериться, даже пока mapReady === false */}
				<div ref={containerRef} className={styles.mapContainer} />

				{/* Плейсхолдер поверх — виден, пока карта не готова
				    (нет ключа, скрипт не загрузился и т.п.) */}
				{!mapReady && (
					<img src={mapPlaceholder.src} alt="Карта города" className={styles.mapImage} />
				)}

				{mapFailed && !apiKey && (
					<div className={styles.mapKeyWarning}>
						Нет ключа 2ГИС — добавьте PUBLIC_2GIS_API_KEY в .env
					</div>
				)}

				<div className={styles.locationPill}>
					<MapPinOff size={14} />
					<span>Москва</span>
				</div>

				<div className={styles.zoomControls}>
					<button
						type="button"
						onClick={() => handleZoomChange(zoom + 1)}
						className={styles.mapControlButton}
						aria-label="Приблизить"
					>
						<Plus size={16} />
					</button>
					<button
						type="button"
						onClick={() => handleZoomChange(zoom - 1)}
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
							onClick={() => handleViewModeChange(mode)}
							className={`${styles.viewModeButton} ${viewMode === mode ? styles.viewModeButtonActive : ''}`}
						>
							{mode}
						</button>
					))}
				</div>

				{!mapReady && (
					<div className={styles.locationMarker} aria-hidden="true">
						<span className={styles.locationMarkerPulse} />
						<span className={styles.locationMarkerDot} />
					</div>
				)}
			</div>

			<BottomNav activePath="/map" />
		</>
	);
}
