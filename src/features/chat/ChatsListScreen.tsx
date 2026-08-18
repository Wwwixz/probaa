import { Search } from 'lucide-react';
import avatar1 from '../../assets/images/avatars/avatar-1.jpg';
import avatar2 from '../../assets/images/avatars/avatar-2.jpg';
import avatar3 from '../../assets/images/avatars/avatar-3.jpg';
import avatar4 from '../../assets/images/avatars/avatar-4.jpg';
import { Header } from '../../widgets/header/Header';
import { BottomNav } from '../../widgets/bottom-nav/BottomNav';
import { MOCK_CHATS } from '../../entities/chat/mockChats';
import styles from './chat.module.css';

const AVATARS = [avatar1, avatar2, avatar3, avatar4];

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
					<input type="text" placeholder="поиск" className={styles.searchInput} />
					<Search size={16} className={styles.searchIcon} />
				</div>

				<div className={styles.chatList}>
					{MOCK_CHATS.map((chat, index) => (
						<a key={chat.id} href={`/chats/${chat.id}`} className={styles.chatRow}>
							<span className={styles.chatAvatarWrap}>
								<img src={AVATARS[index % AVATARS.length].src} alt="" className={styles.chatAvatar} />
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
