import { Search, Volume2 } from 'lucide-react';
import figmaAvatar from '../../assets/images/avatars/figma-avatar.png';
import { Header } from '../../widgets/header/Header';
import { BottomNav } from '../../widgets/bottom-nav/BottomNav';
import { MOCK_CHATS } from '../../entities/chat/mockChats';
import styles from './chat.module.css';

/**
 * Список чатов. Аватарки — плейсхолдеры (по кругу переиспользуются 4
 * сгенерированные картинки) — заменить на реальные фото/аватары
 * пользователей, когда будет бэкенд.
 */
export function ChatsListScreen() {
	return (
		<>
			<Header showSearch={false} />

			<main className={styles.listPage}>
				<h1 className={styles.listTitle}>Чаты</h1>

				<div className={styles.searchBar}>
					<Search size={16} className={styles.searchIcon} />
					<input type="text" placeholder="поиск" className={styles.searchInput} />
					<Volume2 size={16} className={styles.voiceIcon} />
				</div>

				<div className={styles.chatList}>
					{MOCK_CHATS.map((chat) => (
						<a key={chat.id} href={`/chats/${chat.id}`} className={styles.chatRow}>
							<span className={styles.chatAvatarWrap}>
								<img src={figmaAvatar.src} alt="" className={styles.chatAvatar} />
								{chat.online && <span className={styles.onlineDot} aria-hidden="true" />}
							</span>
							<span className={styles.chatInfo}>
								<span className={styles.chatName}>{chat.name}</span>
								<span className={styles.chatPreview}>{chat.preview}</span>
							</span>
						</a>
					))}
				</div>
			</main>

			<BottomNav activePath="/chats" />
		</>
	);
}
