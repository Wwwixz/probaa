import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Mic, Paperclip, Send, User, Monitor, Search, Plus, Volume2 } from 'lucide-react';
import avatarPlaceholder from '../../assets/images/avatars/avatar-1.jpg';
import myAvatar from '../../assets/images/avatars/avatar-2.jpg';
import { sendAiAgentMessage } from '../../shared/api/ai-agent';
import type { Chat, ChatMessage } from '../../entities/chat/mockChats';
import styles from './chat.module.css';

interface AiAgentScreenProps {
	chat: Chat;
}

/**
 * Словарь быстрых команд для ИИ-агента.
 * При нажатии на кнопку-подсказку (Quick Action) пользователю в чат подставляется
 * расширенная версия промпта для улучшения качества ответа нейросети.
 */
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
 * Компонент экрана чата с ИИ-агентом.
 * Реализует интерфейс мессенджера, поддерживает рендеринг различных типов контента:
 * текст, карточки билетов, кнопки выбора, и индикатор набора текста.
 */
export function AiAgentScreen({ chat }: AiAgentScreenProps) {
	// Состояние локальной истории сообщений
	const [messages, setMessages] = useState<ChatMessage[]>(chat.messages);
	// Состояние текущего набираемого текста
	const [draft, setDraft] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isTyping, setIsTyping] = useState(false);
	
	// Ссылка на конец списка сообщений для автоскролла
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isTyping]);

	/**
	 * Отправляет сообщение пользователя на сервер и обрабатывает ответ ИИ.
	 * @param text - Текст сообщения пользователя
	 */
	async function submitMessage(text: string) {
		const trimmed = text.trim();
		if (!trimmed || isSubmitting) return;

		const userMessage: ChatMessage = {
			id: String(Date.now()),
			author: 'me',
			content: { kind: 'text', text: trimmed },
			time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
		};
		const nextMessages = [...messages, userMessage];

		// Оптимистично добавляем сообщение пользователя в UI
		setMessages(nextMessages);
		setDraft('');
		setError(null);
		setIsSubmitting(true);
		setIsTyping(true); // Включаем анимацию "ИИ печатает..."

		try {
			// Выполняем сетевой запрос к нашему внутреннему API (/api/ai-agent/chat)
			const response = await sendAiAgentMessage(
				nextMessages
					.filter((m) => m.content.kind === 'text')
					.map((message) => ({
						role: message.author === 'me' ? 'user' : 'assistant',
						content: (message.content as { kind: 'text'; text: string }).text,
					}))
			);

			setIsTyping(false);
			
			// Добавляем ответ ИИ в чат
			setMessages((prev) => [
				...prev,
				{
					id: String(Date.now() + 1),
					author: 'them',
					content: {
						kind: 'text',
						text:
							response.toolCalls.length > 0
								? `${response.reply}\n\nИнструменты Tutu MCP: ${response.toolCalls.join(', ')}`
								: response.reply,
					},
					time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
				},
			]);
		} catch (submitError) {
			setIsTyping(false);
			setError(
				submitError instanceof Error ? submitError.message : 'Не удалось получить ответ от ИИ-агента.'
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	/** Обработчик отправки формы из инпута */
	async function handleSend(event: FormEvent) {
		event.preventDefault();
		await submitMessage(draft);
	}

	/** Обработчик нажатия на кнопку быстрых подсказок под чатом */
	async function handleQuickAction(action: string) {
		await submitMessage(QUICK_ACTION_PROMPTS[action] ?? action);
	}

	function handleMoreFlights() {
		console.log('more flights');
	}

	function handleShowRoute() {
		console.log('show route');
	}

	function handleDownloadTickets() {
		console.log('download tickets');
	}

	function handleMiniGame() {
		window.location.href = '/mini-game';
	}

	return (
		<div className={styles.aiAgentPage}>
			<div className={styles.aiTopBar}>
				<button onClick={() => window.history.back()} className={styles.aiTopBarBtn}>
					<ArrowLeft size={18} />
				</button>
				<Monitor size={18} className={styles.aiTopBarIcon} />
				<Search size={18} className={styles.aiTopBarIcon} />
				<span className={styles.aiTopBarTitle}>ИИ</span>
				<Plus size={18} className={styles.aiTopBarIcon} />
				<Volume2 size={18} className={styles.aiTopBarIcon} />
			</div>

			<div className={styles.aiAgentContent}>
				<div className={styles.aiIntroSection}>
					<div className={styles.aiHeaderAvatar}>
						<User size={48} color="#999" />
					</div>
					<h1 className={styles.aiHeaderTitle}>{chat.name}</h1>
					<p className={styles.aiHeaderSubtitle}>{chat.role}</p>
					<span className={styles.chatIntroHint}>Начните чат и вам помогут с вопросами</span>
				</div>

				<div className={styles.messagesList}>
					{messages.map((message) => {
						// Определяем тип сообщения для корректной стилизации фона
						const isButtonMessage =
							message.content.kind === 'moreFlightsButton' ||
							message.content.kind === 'choiceButtons' ||
							message.content.kind === 'actionButton';

						return (
							<div
								key={message.id}
								className={`${styles.messageRow} ${
									isButtonMessage
										? styles.messageRowThem
										: message.author === 'me'
											? styles.messageRowMe
											: styles.messageRowThem
								}`}
							>
								{message.author === 'them' ? (
									<img src={avatarPlaceholder.src} alt="" className={styles.messageAvatar} />
								) : (
									<img src={myAvatar.src} alt="" className={styles.messageAvatar} />
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
										<span
											className={`${styles.messageTime} ${
												message.author === 'me' ? styles.messageTimeMe : styles.messageTimeThem
											}`}
										>
											{message.time}
										</span>
									</div>
								)}

								{message.content.kind === 'flightCard' && (
									<div className={styles.flightCard}>
										<div className={styles.flightRowTop}>
											<span className={styles.flightTime}>{message.content.flight.departureTime}</span>
											<span className={styles.flightTime}>{message.content.flight.arrivalTime}</span>
										</div>

										<div className={styles.flightRoute}>
											<div className={styles.flightPoint}>
												<span className={styles.flightAirport}>{message.content.flight.fromCode}</span>
												<div className={styles.flightCityRow}>
													<span className={styles.flightCity}>{message.content.flight.fromCity}</span>
													<img
														src={message.content.flight.fromFlagSvg}
														alt=""
														className={styles.flightFlagImg}
													/>
												</div>
											</div>

											<div className={styles.flightLine}>
												<div className={styles.flightLineDashes} />
												<div
													className={styles.flightTrail}
													style={{
														background: `linear-gradient(90deg, transparent, ${message.content.flight.trailColor || 'rgba(161, 129, 255, 0.4)'})`,
													}}
												/>
												<div className={styles.flightPlaneOutline}>
													<svg
														width="24"
														height="24"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M21 16.5L13.5 12L21 7.5V6L12 10.5V3L10.5 1.5L9 3V10.5L0 6V7.5L7.5 12L0 16.5V18L9 13.5V21L10.5 22.5L12 21V13.5L21 18V16.5Z"
															fill={message.content.flight.trailColor || '#ffffff'}
														/>
													</svg>
												</div>
											</div>

											<div className={styles.flightPointRight}>
												<span className={styles.flightAirport}>{message.content.flight.toCode}</span>
												<div className={styles.flightCityRow}>
													<span className={styles.flightCity}>{message.content.flight.toCity}</span>
													<img
														src={message.content.flight.toFlagSvg}
														alt=""
														className={styles.flightFlagImg}
													/>
												</div>
											</div>
										</div>

										<div className={styles.flightDashed} />

										<div className={styles.flightRowBottom}>
											<span className={styles.flightNumber}>{message.content.flight.flightNumber}</span>
											<span className={styles.flightDirection}>{message.content.flight.direction}</span>
										</div>
									</div>
								)}

								{message.content.kind === 'moreFlightsButton' && (
									<button type="button" onClick={handleMoreFlights} className={styles.moreFlightsButton}>
										{message.content.label}
									</button>
								)}

								{message.content.kind === 'choiceButtons' && (
									<div className={styles.choiceButtonsRow}>
										{message.content.buttons.map((btn, idx) => (
											<button
												key={idx}
												type="button"
												className={
													btn.variant === 'primary' ? styles.choiceButtonPrimary : styles.choiceButtonOutline
												}
											>
												{btn.label}
											</button>
										))}
									</div>
								)}

								{message.content.kind === 'actionButton' && (
									<button
										type="button"
										className={styles.moreFlightsButton}
										onClick={message.content.label === 'Мини игра' ? handleMiniGame : undefined}
									>
										{message.content.label}
									</button>
								)}

								{message.content.kind === 'routeCard' && (
									<div className={styles.limeCard}>
										<div className={styles.limeCardImageWrap}>
											<img src={message.content.mapImage} alt="" className={styles.limeCardImage} />
										</div>
										<button type="button" onClick={handleShowRoute} className={styles.limeCardDarkButton}>
											{message.content.buttonLabel}
										</button>
									</div>
								)}

								{message.content.kind === 'ticketsCard' && (
									<div className={styles.limeCard}>
										<div className={styles.limeCardTicketsWrap}>
											<img src={message.content.ticketsImage} alt="" className={styles.limeCardTicketsImage} />
										</div>
										<button type="button" onClick={handleDownloadTickets} className={styles.limeCardOrangeButton}>
											{message.content.buttonLabel}
										</button>
									</div>
								)}
							</div>
						);
					})}
					
					{/* Индикатор печати ИИ-агента */}
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
					{error && <div className={styles.agentError}>{error}</div>}
					<div ref={messagesEndRef} />
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

			<div className={styles.chatInputBarContainer}>
				<form onSubmit={handleSend} className={styles.chatInputBar}>
					<div className={styles.chatInputWrapper}>
						<input
							type="text"
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							placeholder="Например: найди поезд Москва - Казань на завтра"
							className={styles.chatInput}
							disabled={isSubmitting}
						/>
					</div>
					<div className={styles.chatButtonsGroup}>
						<button type="button" className={styles.chatIconButton} aria-label="Голосовое сообщение">
							<Mic size={20} />
						</button>
						<button type="button" className={styles.chatIconButton} aria-label="Прикрепить файл">
							<Paperclip size={20} />
						</button>
						<button
							type="submit"
							className={styles.chatSendButton}
							aria-label="Отправить"
							disabled={isSubmitting}
						>
							<Send size={20} />
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
