import settingsIcon from '../../assets/icons/header/icon-settings.svg';
import searchIcon from '../../assets/icons/header/icon-search.svg';
import cameraIcon from '../../assets/icons/header/icon-camera.svg';
import bellIcon from '../../assets/icons/header/icon-bell.svg';
import styles from './Header.module.css';

/**
 * Верхняя панель главной: настройки слева, поиск/камера/уведомления
 * справа. Каждая иконка — готовый круг 44×44 из Figma (сам круг уже
 * "зашит" в SVG, отдельно фон не рисуем).
 */
export function Header() {
	return (
		<header className={styles.header}>
			<a href="/settings" aria-label="Настройки">
				<img src={settingsIcon.src} alt="" width={44} height={44} />
			</a>

			<div className={styles.headerRight}>
				<a href="/search" aria-label="Поиск">
					<img src={searchIcon.src} alt="" width={44} height={44} />
				</a>
				<a href="/camera" aria-label="Камера">
					<img src={cameraIcon.src} alt="" width={44} height={44} />
				</a>
				<a href="/notifications" aria-label="Уведомления">
					<img src={bellIcon.src} alt="" width={44} height={44} />
				</a>
			</div>
		</header>
	);
}
