import type { ReactNode } from 'react';
import styles from './content-feed.module.css';

interface CategoryCardProps {
	title: ReactNode;
	image: { src: string };
	href: string;
}

/**
 * Карточка категории на главной ("Туристические законы" и т.д.) —
 * фото с градиентным оверлеем (лайм → фиолетовый) и белым заголовком.
 *
 * `image` пока указывает на плейсхолдер в src/assets/images/categories —
 * замените файл на реальный с тем же именем, менять код не нужно.
 */
export function CategoryCard({ title, image, href }: CategoryCardProps) {
	return (
		<a href={href} className={styles.categoryCard}>
			<img src={image.src} alt="" aria-hidden="true" className={styles.categoryCardImage} />
			<span className={styles.categoryCardOverlay} aria-hidden="true" />
			<span className={styles.categoryCardTitle}>{title}</span>
		</a>
	);
}
