import homeIcon from '../../assets/icons/nav/nav-home.svg';
import profileIcon from '../../assets/icons/nav/nav-profile.svg';
import mapsIcon from '../../assets/icons/nav/nav-maps.svg';
import chatsIcon from '../../assets/icons/nav/nav-chats.svg';
import statsIcon from '../../assets/icons/nav/nav-stats.svg';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
	{ href: '/', icon: homeIcon, label: 'Главная' },
	{ href: '/profile', icon: profileIcon, label: 'Профиль' },
	{ href: '/map', icon: mapsIcon, label: 'Карты' },
	{ href: '/chats', icon: chatsIcon, label: 'Чаты' },
	{ href: '/stats', icon: statsIcon, label: 'Статистика' },
];

interface BottomNavProps {
	/** Текущий путь — используется, чтобы подсветить активный раздел */
	activePath: string;
}

/**
 * Нижняя навигация. Активная иконка определяется текущим роутом
 * (передаётся снаружи), а не хардкодится — один компонент на все
 * состояния.
 *
 * Порядок: Главная → Профиль → Карты → Чаты → Статистика.
 */
export function BottomNav({ activePath }: BottomNavProps) {
	return (
		<nav className={styles.nav}>
			{NAV_ITEMS.map((item) => {
				const isActive = item.href === '/' ? activePath === '/' : activePath.startsWith(item.href);

				return (
					<a
						key={item.href}
						href={item.href}
						className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
						aria-label={item.label}
						aria-current={isActive ? 'page' : undefined}
					>
						<img src={item.icon.src} alt="" width={44} height={44} />
						{isActive && <span className={styles.navDot} aria-hidden="true" />}
					</a>
				);
			})}
		</nav>
	);
}
