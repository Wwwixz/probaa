import touristicLaws from '../../assets/images/categories/touristic-laws.svg';
import onlineReviews from '../../assets/images/categories/online-reviews.svg';
import emergencies from '../../assets/images/categories/emergencies.svg';
import ownPath from '../../assets/images/categories/own-path.svg';
import { Header } from '../header/Header';
import { BottomNav } from '../bottom-nav/BottomNav';
import { CategoryCard } from './CategoryCard';
import { FeedCard } from './FeedCard';
import { SectionHeader } from './SectionHeader';
import styles from './content-feed.module.css';

const CATEGORIES = [
	{ title: 'Туристические законы', image: touristicLaws, href: '/topics/laws' },
	{ title: 'Онлайн отзывы', image: onlineReviews, href: '/topics/reviews' },
	{ title: 'ЧП', image: emergencies, href: '/topics/emergencies' },
	{ title: 'Свой путь', image: ownPath, href: '/topics/own-path' },
];

/**
 * Временные тестовые данные ленты — замените на реальные хуки
 * (entities/article, entities/hotel) через shared/api, когда появятся
 * бэкенд/моки.
 */
const DISCUSSED_TOPICS = [
	{ id: 1, title: 'Ghazala beach', subtitle: 'Шарм-эль-шейх', rating: 3.9, discussionsCount: 15 },
	{ id: 2, title: 'Ghazala beach', subtitle: 'Шарм-эль-шейх', rating: 3.9, discussionsCount: 15 },
	{ id: 3, title: 'Ghazala beach', subtitle: 'Шарм-эль-шейх', rating: 3.9, discussionsCount: 15 },
];

const HELPFUL_ARTICLES = [
	{ id: 1, title: 'Ghazala beach', subtitle: 'Шарм-эль-шейх', discussionsCount: 15 },
	{ id: 2, title: 'Ghazala beach', subtitle: 'Шарм-эль-шейх', discussionsCount: 15 },
	{ id: 3, title: 'Ghazala beach', subtitle: 'Шарм-эль-шейх', discussionsCount: 15 },
];

export function HomeFeed() {
	return (
		<>
			<Header />

			<main className={styles.homeMain}>
				<h1 className={styles.homeTitle}>Главная</h1>

				<div className={styles.categoryGrid}>
					{CATEGORIES.map((category) => (
						<CategoryCard
							key={category.href}
							title={category.title}
							image={{ src: category.image.src }}
							href={category.href}
						/>
					))}
				</div>

				<SectionHeader title="Самые обсуждаемые темы" href="/topics/discussed" />
				<div className={styles.feedRow}>
					{DISCUSSED_TOPICS.map((topic) => (
						<FeedCard
							key={topic.id}
							href={`/topics/discussed/${topic.id}`}
							title={topic.title}
							subtitle={topic.subtitle}
							rating={topic.rating}
							discussionsCount={topic.discussionsCount}
						/>
					))}
				</div>

				<SectionHeader title="Полезные статьи при ЧС и ЧП" href="/topics/helpful" />
				<div className={styles.feedRow}>
					{HELPFUL_ARTICLES.map((article) => (
						<FeedCard
							key={article.id}
							href={`/topics/helpful/${article.id}`}
							title={article.title}
							subtitle={article.subtitle}
							discussionsCount={article.discussionsCount}
						/>
					))}
				</div>
			</main>

			<BottomNav activePath="/" />
		</>
	);
}
