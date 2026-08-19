import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Monitor, Search, Plus, Volume2, Mic, Paperclip, Send } from 'lucide-react';
import avatarPlaceholder from '../../assets/images/avatars/avatar-1.jpg';
import myAvatar from '../../assets/images/avatars/avatar-2.jpg';
import { sendAiAgentMessage } from '../../shared/api/ai-agent';
import { Header } from '../../widgets/header/Header';
import type { Chat } from '../../entities/chat/mockChats';
import styles from './chat.module.css';

interface AiAgentScreenProps {
	chat: Chat;
}

const QUICK_ACTION_PROMPTS: Record<string, string> = {
	'Мои билеты': 'Покажи, как можно помочь с уже купленными билетами через Tutu.',
	'Перенести рейс': 'Объясни, как проверить варианты переноса или обмена авиабилета через Tutu.',
	'История поездок': 'Расскажи, какие travel-сценарии можно показать по истории поездок пользователя в демо.',
	'Мои документы': 'Подскажи, какие документы важны для поездки и что стоит проверить перед вылетом.',
	'Найди поезд Москва -> Питер на завтра':
		'Найди поезд из Москвы в Санкт-Петербург на завтра для 1 пассажира и предложи самый быстрый вариант.',
	'Самый дешёвый авиабилет в Сочи':
		'Найди самый дешёвый авиабилет из Москвы в Сочи на завтра для 1 пассажира.',
	'Собери маршрут с пересадками':
		'Собери мультимаршрут из Москвы в Архыз на ближайшую субботу для 1 пассажира и объясни, как его купить.',
	'Подбери отель у моря':
		'Подбери отель у моря в Сочи на 2 ночи на ближайшие выходные для 2 гостей с бесплатной отменой.'
};

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
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function submitMessage(text: string) {
		const trimmed = text.trim();
		if (!trimmed || isSubmitting) return;

		const userMessage = {
			id: String(Date.now()),
			author: 'me' as const,
			text: trimmed,
			time: 'сейчас',
		};
		const nextMessages = [...messages, userMessage];

		setMessages(nextMessages);
		setDraft('');
		setError(null);
		setIsSubmitting(true);

		try {
			const response = await sendAiAgentMessage(
				nextMessages.map((message) => ({
					role: message.author === 'me' ? 'user' : 'assistant',
					content: message.text,
				}))
			);

			setMessages((prev) => [
				...prev,
				{
					id: String(Date.now() + 1),
					author: 'them' as const,
					text:
						response.toolCalls.length > 0
							? `${response.reply}\n\nИнструменты Tutu MCP: ${response.toolCalls.join(', ')}`
							: response.reply,
					time: 'сейчас',
				},
			]);
		} catch (submitError) {
			setError(
				submitError instanceof Error ? submitError.message : 'Не удалось получить ответ от ИИ-агента.'
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleSend(event: FormEvent) {
		event.preventDefault();
		await submitMessage(draft);
	}

	async function handleQuickAction(action: string) {
		await submitMessage(QUICK_ACTION_PROMPTS[action] ?? action);
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
						<span className={styles.chatIntroHint}>
							Нахожу реальные варианты через Tutu MCP и стараюсь сразу вести к оформлению.
						</span>
					</div>

					<div className={styles.messagesList}>
						{messages.map((message) => (
							<div
								key={message.id}
								className={`${styles.messageRow} ${
									message.author === 'me' ? styles.messageRowMine : styles.messageRowTheirs
								}`}
							>
								{message.author === 'them' && (
									<img src={avatarPlaceholder.src} alt="" className={styles.messageAvatar} />
								)}
								<div
									className={`${styles.messageBubble} ${
										message.author === 'me' ? styles.messageBubbleMine : styles.messageBubbleTheirs
									}`}
								>
									<span className={styles.messageText}>{message.text}</span>
									<span className={styles.messageTime}>{message.time}</span>
								</div>
								{message.author === 'me' && (
									<img src={myAvatar.src} alt="" className={styles.messageAvatar} />
								)}
							</div>
						))}
						{isSubmitting && (
							<div className={`${styles.messageRow} ${styles.messageRowTheirs}`}>
								<img src={avatarPlaceholder.src} alt="" className={styles.messageAvatar} />
								<div className={`${styles.messageBubble} ${styles.messageBubbleTheirs}`}>
									<span className={styles.messageText}>Ищу варианты через Tutu MCP...</span>
								</div>
							</div>
						)}
						{error && (
							<div className={styles.agentError}>
								{error}
							</div>
						)}
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
							disabled={isSubmitting}
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
					placeholder="Например: найди поезд Москва - Казань на завтра"
					className={styles.chatInput}
				/>
				<button type="button" className={styles.chatIconButton} aria-label="Голосовое сообщение">
					<Mic size={16} />
				</button>
				<button type="button" className={styles.chatIconButton} aria-label="Прикрепить файл">
					<Paperclip size={16} />
				</button>
				<button type="submit" className={styles.chatSendButton} aria-label="Отправить" disabled={isSubmitting}>
					<Send size={16} />
				</button>
			</form>
		</>
	);
}
