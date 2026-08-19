import touristicLaws from '../../assets/images/categories/touristic-laws.svg';
import onlineReviews from '../../assets/images/categories/online-reviews.svg';
import emergencies from '../../assets/images/categories/emergencies.svg';
import ownPath from '../../assets/images/categories/own-path.svg';
import { Header } from '../header/Header';
import { BottomNav } from '../bottom-nav/BottomNav';
import { CategoryCard } from './CategoryCard';
import { FeedCard } from './FeedCard';
import { SectionHeader } from './SectionHeader';
import { MOCK_ARTICLES } from '../../entities/article/mockArticles';
import styles from './content-feed.module.css';

const CATEGORIES = [
	{ title: 'Туристические законы', image: touristicLaws, href: '/topics/laws' },
	{ title: 'Онлайн отзывы', image: onlineReviews, href: '/topics/reviews' },
	{ title: 'ЧП', image: emergencies, href: '/topics/emergencies' },
	{ title: 'Свой путь', image: ownPath, href: '/topics/own-path' },
];

const DISCUSSED_TOPICS = MOCK_ARTICLES.filter((article) => article.type === 'hotel')
	.sort((a, b) => b.discussionsCount - a.discussionsCount)
	.slice(0, 3);

const HELPFUL_ARTICLES = MOCK_ARTICLES.filter((article) => article.type === 'article')
	.sort((a, b) => b.discussionsCount - a.discussionsCount)
	.slice(0, 3);

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
							href={`/topics/${topic.id}`}
							image={{ src: topic.coverImage }}
							title={topic.title}
							subtitle={topic.subtitle}
							rating={topic.rating}
							discussionsCount={topic.discussionsCount}
							variant={topic.type}
						/>
					))}
				</div>

				<SectionHeader title="Полезные статьи при ЧС и ЧП" href="/topics/helpful" />
				<div className={styles.feedRow}>
					{HELPFUL_ARTICLES.map((article) => (
						<FeedCard
							key={article.id}
							href={`/topics/${article.id}`}
							image={{ src: article.coverImage }}
							title={article.title}
							subtitle={article.subtitle}
							discussionsCount={article.discussionsCount}
							variant={article.type}
						/>
					))}
				</div>
			</main>

			<BottomNav activePath="/" />
		</>
	);
}
