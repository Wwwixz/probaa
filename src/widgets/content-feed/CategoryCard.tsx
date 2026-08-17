import styles from './content-feed.module.css';

interface CategoryCardProps {
	/** Название категории — используется как подпись для скринридеров
	 *  (сам текст уже "запечён" в картинке визуально, поэтому на экране
	 *  не дублируется). */
	title: string;
	image: { src: string };
	href: string;
}

/**
 * Карточка категории на главной. Картинка приходит уже полностью
 * готовой из Figma (фото + градиент + подпись внутри самого SVG) —
 * компонент просто выводит её, ничего сверху не рисует.
 */
export function CategoryCard({ title, image, href }: CategoryCardProps) {
	return (
		<a href={href} className={styles.categoryCard} aria-label={title}>
			<img src={image.src} alt="" aria-hidden="true" className={styles.categoryCardImage} />
		</a>
	);
}
