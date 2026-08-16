import styles from './content-feed.module.css';

interface FeedCardProps {
	href: string;
	image?: { src: string };
	rating?: number;
	title: string;
	subtitle: string;
	discussionsCount: number;
	/** Пока просто N серых кружков-плейсхолдеров — заменим на реальные
	 *  аватарки, когда будут данные/API. */
	avatarsCount?: number;
}

/**
 * Карточка ленты (отель/тема) — "Ghazala beach" и подобные.
 * 138×130, radius 12px.
 */
export function FeedCard({
	href,
	image,
	rating,
	title,
	subtitle,
	discussionsCount,
	avatarsCount = 3,
}: FeedCardProps) {
	return (
		<a href={href} className={styles.feedCard}>
			<div className={styles.feedCardImageWrap}>
				{image && <img src={image.src} alt="" className={styles.feedCardImage} />}
				{rating !== undefined && (
					<span className={styles.feedCardRating}>{rating.toFixed(1).replace('.', ',')}</span>
				)}
			</div>

			<div className={styles.feedCardBody}>
				<span className={styles.feedCardTitle}>{title}</span>
				<span className={styles.feedCardSubtitle}>{subtitle}</span>

				<div className={styles.feedCardDiscussions}>
					<span>Обсуждений:</span>
					<span className={styles.feedCardAvatars} aria-hidden="true">
						{Array.from({ length: Math.min(avatarsCount, 3) }).map((_, i) => (
							<span key={i} className={styles.feedCardAvatar} />
						))}
					</span>
					<span className={styles.feedCardMoreCount}>+{discussionsCount}</span>
				</div>
			</div>
		</a>
	);
}
