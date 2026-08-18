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
 * Карточка категории на главной — ведёт на другую страницу, поэтому
 * технически это ссылка (<a>), а не <button>: браузер сам даёт ей
 * открытие в новой вкладке, показ адреса при наведении и т.п. Внешне
 * выглядит и ведёт себя как кнопка — просто с правильной семантикой.
 *
 * Картинка подключена как CSS background-image (а не <img>), чтобы
 * было удобно управлять эффектами (блик при наведении и т.д.) без
 * лишнего слоя разметки.
 */
export function CategoryCard({ title, image, href }: CategoryCardProps) {
	return (
		<a
			href={href}
			className={styles.categoryCard}
			aria-label={title}
			style={{ backgroundImage: `url(${image.src})` }}
		/>
	);
}
