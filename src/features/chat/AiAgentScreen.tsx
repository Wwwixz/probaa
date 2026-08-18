import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Monitor, Search, Plus, Volume2, Mic, Paperclip, Send } from 'lucide-react';
import avatarPlaceholder from '../../assets/images/avatars/avatar-1.jpg';
import myAvatar from '../../assets/images/avatars/avatar-2.jpg';
import { Header } from '../../widgets/header/Header';
import type { Chat } from '../../entities/chat/mockChats';
import styles from './chat.module.css';

interface AiAgentScreenProps {
	chat: Chat;
}

/**
 * Экран ИИ-агента — похож на обычный диалог (ChatDetailScreen), но с
 * особой верхней панелью (доп. иконки), цветным блюр-фоном (как на
 * экранах авторизации) и рядом quick actions над полем ввода.
 *
 * TODO: quick actions пока просто console.log — подключить реальные
 * tool calls, когда определится контракт с MCP/бэкендом (см.
 * docs/ARCHITECTURE.md).
 */
export function AiAgentScreen({ chat }: AiAgentScreenProps) {
	const [messages, setMessages] = useState(chat.messages);
	const [draft, setDraft] = useState('');

	function handleSend(event: FormEvent) {
		event.preventDefault();
		if (!draft.trim()) return;

		setMessages((prev) => [
			...prev,
			{ id: String(prev.length + 1), author: 'me' as const, text: draft.trim(), time: 'сейчас' },
		]);
		setDraft('');
	}

	function handleQuickAction(action: string) {
		// TODO: реальный вызов инструмента вместо console.log
		console.log('quick action:', action);
	}

	return (
		<>
			<Header showSearch={false} />

			<div className={styles.aiAgentPage}>
				<div className={styles.aiAgentContent}>
					<div className={styles.aiHeaderBar}>
						<button
							type="button"
							onClick={() => window.history.back()}
							className={styles.chatBackButton}
							aria-label="Назад"
						>
							<ArrowLeft size={16} />
						</button>
						<Monitor size={16} className={styles.aiHeaderIcon} />
						<Search size={16} className={styles.aiHeaderIcon} />
						<span className={styles.chatHeaderName}>ИИ</span>
						<Plus size={16} className={styles.aiHeaderIcon} />
						<Volume2 size={16} className={styles.aiHeaderIcon} />
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
			</div>

			{chat.quickActions && (
				<div className={styles.quickActionsRow}>
					{chat.quickActions.map((action) => (
						<button
							key={action}
							type="button"
							onClick={() => handleQuickAction(action)}
							className={styles.quickActionChip}
						>
							{action}
						</button>
					))}
				</div>
			)}

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
