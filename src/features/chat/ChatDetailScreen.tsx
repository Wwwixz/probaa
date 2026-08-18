import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Phone, Mic, Paperclip, Send } from 'lucide-react';
import avatarPlaceholder from '../../assets/images/avatars/avatar-3.jpg';
import myAvatar from '../../assets/images/avatars/avatar-2.jpg';
import { Header } from '../../widgets/header/Header';
import type { Chat } from '../../entities/chat/mockChats';
import styles from './chat.module.css';

interface ChatDetailScreenProps {
	chat: Chat;
}

/**
 * Экран диалога. Вместо нижней навигации — поле ввода сообщения
 * (фиксировано снизу). Фон тёмный, как экраны авторизации/деталки
 * статьи.
 *
 * TODO: сейчас отправка сообщений только локально в React state —
 * подключить реальный WebSocket, когда будет бэкенд (см.
 * docs/ARCHITECTURE.md, раздел про чат).
 */
export function ChatDetailScreen({ chat }: ChatDetailScreenProps) {
	const [messages, setMessages] = useState(chat.messages);
	const [draft, setDraft] = useState('');

	function handleSend(event: FormEvent) {
		event.preventDefault();
		if (!draft.trim()) return;

		setMessages((prev) => [
			...prev,
			{
				id: String(prev.length + 1),
				author: 'me',
				text: draft.trim(),
				time: 'сейчас',
			},
		]);
		setDraft('');
	}

	return (
		<>
			<Header showSearch={false} />

			<div className={styles.detailDarkSection}>
				<div className={styles.chatHeaderBar}>
					<button
						type="button"
						onClick={() => window.history.back()}
						className={styles.chatBackButton}
						aria-label="Назад"
					>
						<ArrowLeft size={16} />
					</button>
					<span className={styles.chatHeaderName}>{chat.name}</span>
					<a href="tel:" className={styles.chatCallButton} aria-label="Позвонить">
						<Phone size={16} />
					</a>
				</div>

				<div className={styles.chatIntro}>
					<img src={avatarPlaceholder.src} alt="" className={styles.chatIntroAvatar} />
					<span className={styles.chatIntroName}>{chat.name}</span>
					{chat.role && <span className={styles.chatIntroRole}>{chat.role}</span>}
					<span className={styles.chatIntroHint}>Начните чат и вам помогут с вопросами</span>
				</div>

				<div className={styles.messagesList}>
					{messages.map((message) => (
						<div key={message.id} className={styles.messageRow}>
							<div className={styles.messageBubble}>
								<span className={styles.messageText}>{message.text}</span>
								<span className={styles.messageTime}>{message.time}</span>
							</div>
							{message.author === 'me' && (
								<img src={myAvatar.src} alt="" className={styles.messageAvatar} />
							)}
						</div>
					))}
				</div>
			</div>

			<form onSubmit={handleSend} className={styles.chatInputBar}>
				<input
					type="text"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					placeholder="Напишите сообщение...."
					className={styles.chatInput}
				/>
				<button type="button" className={styles.chatIconButton} aria-label="Голосовое сообщение">
					<Mic size={16} />
				</button>
				<button type="button" className={styles.chatIconButton} aria-label="Прикрепить файл">
					<Paperclip size={16} />
				</button>
				<button type="submit" className={styles.chatSendButton} aria-label="Отправить">
					<Send size={16} />
				</button>
			</form>
		</>
	);
}
