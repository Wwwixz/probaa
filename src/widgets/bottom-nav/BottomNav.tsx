import homeIcon from '../../assets/icons/nav/nav-home.svg';
import profileIcon from '../../assets/icons/nav/nav-profile.svg';
import mapsIcon from '../../assets/icons/nav/nav-maps.svg';
import chatsIcon from '../../assets/icons/nav/nav-chats.svg';
import statsIcon from '../../assets/icons/nav/nav-stats.svg';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
	{ href: '/', icon: homeIcon, label: 'Главная', isHome: true },
	{ href: '/profile', icon: profileIcon, label: 'Профиль', isHome: false },
	{ href: '/map', icon: mapsIcon, label: 'Карты', isHome: false },
	{ href: '/chats', icon: chatsIcon, label: 'Чаты', isHome: false },
	{ href: '/stats', icon: statsIcon, label: 'Статистика', isHome: false },
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
						className={`${styles.navItem} ${item.isHome ? styles.navItemHome : ''} ${isActive ? styles.navItemActive : ''}`}
						aria-label={item.label}
						aria-current={isActive ? 'page' : undefined}
					>
						<img src={item.icon.src} alt="" width={item.isHome ? 56 : 44} height={item.isHome ? 56 : 44} />
						{isActive && <span className={styles.navDot} aria-hidden="true" />}
					</a>
				);
			})}
		</nav>
	);
}
