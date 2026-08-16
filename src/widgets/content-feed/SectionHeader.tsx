import { ArrowRight } from 'lucide-react';
import styles from './content-feed.module.css';

interface SectionHeaderProps {
	title: string;
	href: string;
}

/**
 * Заголовок секции ленты ("Самые обсуждаемые темы →",
 * "Полезные статьи при ЧС и ЧП →"). Контейнер: Fill по ширине,
 * space-between, padding 8px 24px — как в Figma (Layout panel).
 *
 * Шрифт/цвет текста и стрелки сняты приблизительно (точных значений
 * из Figma не было) — поправить, если не совпадёт с макетом.
 */
export function SectionHeader({ title, href }: SectionHeaderProps) {
	return (
		<div className={styles.sectionHeader}>
			<h2 className={styles.sectionHeaderTitle}>{title}</h2>
			<a href={href} aria-label={`Все: ${title}`} className={styles.sectionHeaderArrow}>
				<ArrowRight size={20} />
			</a>
		</div>
	);
}
