import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Phone, Mic, Paperclip, Send, Check } from 'lucide-react';
import avatarPlaceholder from '../../assets/images/avatars/avatar-3.jpg';
import myAvatar from '../../assets/images/avatars/avatar-2.jpg';
import { Header } from '../../widgets/header/Header';
import type { Chat, ChatMessage } from '../../entities/chat/mockChats';
import styles from './chat.module.css';

interface ChatDetailScreenProps {
	chat: Chat;
}

export function ChatDetailScreen({ chat }: ChatDetailScreenProps) {
	const [messages, setMessages] = useState<ChatMessage[]>(chat.messages);
	const [draft, setDraft] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isTyping]);

	function handleSend(event: FormEvent) {
		event.preventDefault();
		if (!draft.trim()) return;

		const userMsg: ChatMessage = {
			id: String(Date.now()),
			author: 'me',
			content: { kind: 'text', text: draft.trim() },
			time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
		};

		setMessages((prev) => [...prev, userMsg]);
		setDraft('');

		// Имитация ответа
		setTimeout(() => {
			setIsTyping(true);
			setTimeout(() => {
				setIsTyping(false);
				const reply: ChatMessage = {
					id: String(Date.now() + 1),
					author: 'them',
					content: {
						kind: 'text',
						text: 'Спасибо за ваше сообщение! Мы скоро свяжемся с вами для уточнения деталей.',
					},
					time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
				};
				setMessages((prev) => [...prev, reply]);
			}, 2000);
		}, 1000);
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
					{messages.length === 0 && (
						<div className={styles.chatIntroHint} style={{ margin: '40px auto' }}>
							Здесь пока нет сообщений. Напишите что-нибудь, чтобы начать диалог.
						</div>
					)}
					{messages.map((message) => (
						<div
							key={message.id}
							className={`${styles.messageRow} ${
								message.author === 'me' ? styles.messageRowMe : styles.messageRowThem
							}`}
						>
							{message.author === 'them' && (
								<img src={avatarPlaceholder.src} alt="" className={styles.messageAvatar} />
							)}
							{message.content.kind === 'text' && (
								<div
									className={`${styles.messageBubble} ${
										message.author === 'me' ? styles.messageBubbleMe : styles.messageBubbleThem
									}`}
								>
									<span
										className={`${styles.messageText} ${
											message.author === 'me' ? styles.messageTextMe : styles.messageTextThem
										}`}
									>
										{message.content.text}
									</span>
									<div className={styles.messageFooter}>
										<span
											className={`${styles.messageTime} ${
												message.author === 'me' ? styles.messageTimeMe : styles.messageTimeThem
											}`}
										>
											{message.time}
										</span>
										{message.author === 'me' && (
											<span className={styles.statusIcon}>
												<Check size={10} />
											</span>
										)}
									</div>
								</div>
							)}
							{message.author === 'me' && (
								<img src={myAvatar.src} alt="" className={styles.messageAvatar} />
							)}
						</div>
					))}
					{isTyping && (
						<div className={styles.messageRow + ' ' + styles.messageRowThem}>
							<img src={avatarPlaceholder.src} alt="" className={styles.messageAvatar} />
							<div className={styles.typingIndicator}>
								<div className={styles.typingDot} />
								<div className={styles.typingDot} />
								<div className={styles.typingDot} />
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{chat.quickActions && chat.quickActions.length > 0 && (
				<div className={styles.quickActionsRow} style={{ bottom: '80px' }}>
					{chat.quickActions.map((action) => (
						<button
							key={action}
							type="button"
							onClick={() => {
								setDraft(action);
							}}
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
