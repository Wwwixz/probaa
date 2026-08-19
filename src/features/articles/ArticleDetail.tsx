import { ArrowLeft } from 'lucide-react';
import mapPlaceholder from '../../assets/images/articles/map-placeholder.jpg';
import type { Article } from '../../entities/article/mockArticles';
import styles from './article-detail.module.css';

interface ArticleDetailProps {
	article: Article;
}

/**
 * Детальный экран статьи/отеля. Верх (кнопка назад) — на светлом фоне
 * app-shell, всё начиная с фото — на тёмном (как экраны авторизации).
 * Фото и карта пока плейсхолдеры — заменить на реальные, когда будут
 * ассеты/бэкенд.
 */
export function ArticleDetail({ article }: ArticleDetailProps) {
	return (
		<>
			<div className={styles.backRow}>
				<button
					type="button"
					onClick={() => window.history.back()}
					className={styles.backButton}
					aria-label="Назад"
				>
					<ArrowLeft size={18} />
				</button>
			</div>

			<div className={styles.darkSection}>
				<div className={styles.heroWrap}>
					<img src={article.coverImage} alt={article.title} className={styles.heroImage} />
					{article.type === 'hotel' && article.rating !== undefined && (
						<span className={styles.ratingBadge}>{article.rating.toFixed(1).replace('.', ',')}</span>
					)}
				</div>

				<div className={styles.content}>
					<h1 className={styles.title}>{article.title}</h1>
					<p className={styles.subtitle}>{article.subtitle}</p>

					<h2 className={styles.sectionLabel}>
						{article.type === 'hotel' ? 'Описание темы' : 'Описание статьи'}
					</h2>
					<p className={styles.descriptionBox}>{article.description}</p>

					<h2 className={styles.sectionLabel}>Местоположение на карте</h2>
					<img src={mapPlaceholder.src} alt="Карта расположения" className={styles.mapImage} />

					<h2 className={styles.sectionLabel}>Комментарии</h2>
					<div className={styles.commentsList}>
						{article.comments.map((comment) => (
							<div key={comment.id} className={styles.commentCard}>
								<div className={styles.commentAvatar} aria-hidden="true" />
								<div className={styles.commentBody}>
									<p className={styles.commentText}>{comment.text}</p>
									<span className={styles.commentTime}>{comment.time}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
