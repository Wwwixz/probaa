import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Mic, Paperclip, Send, User, Monitor, Search, Plus, Volume2 } from 'lucide-react';
import avatarPlaceholder from '../../assets/images/avatars/avatar-1.jpg';
import myAvatar from '../../assets/images/avatars/avatar-2.jpg';
import type { Chat, ChatMessage } from '../../entities/chat/mockChats';
import styles from './chat.module.css';

interface AiAgentScreenProps {
	chat: Chat;
}

export function AiAgentScreen({ chat }: AiAgentScreenProps) {
	const [messages, setMessages] = useState<ChatMessage[]>(chat.messages);
	const [draft, setDraft] = useState('');

	function handleSend(event: FormEvent) {
		event.preventDefault();
		if (!draft.trim()) return;

		setMessages((prev) => [
			...prev,
			{
				id: String(prev.length + 1),
				author: 'me',
				content: { kind: 'text', text: draft.trim() },
				time: 'сейчас',
			},
		]);
		setDraft('');
	}

	function handleQuickAction(action: string) {
		console.log('quick action:', action);
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
						const isButtonMessage =
							message.content.kind === 'moreFlightsButton' ||
							message.content.kind === 'choiceButtons' ||
							message.content.kind === 'actionButton';

						return (
							<div
								key={message.id}
								className={`${styles.messageRow} ${
									isButtonMessage
										? styles.messageRowCenter
										: message.author === 'me'
											? styles.messageRowMe
											: styles.messageRowThem
								}`}
							>
								{!isButtonMessage &&
									(message.author === 'them' ? (
										<img src={avatarPlaceholder.src} alt="" className={styles.messageAvatar} />
									) : (
										<img src={myAvatar.src} alt="" className={styles.messageAvatar} />
									))}

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
									<button type="button" className={styles.moreFlightsButton}>
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

			<div className={styles.chatInputBarContainer}>
				<form onSubmit={handleSend} className={styles.chatInputBar}>
					<div className={styles.chatInputWrapper}>
						<input
							type="text"
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							placeholder="Напишите сообщение...."
							className={styles.chatInput}
						/>
					</div>
					<div className={styles.chatButtonsGroup}>
						<button type="button" className={styles.chatIconButton} aria-label="Голосовое сообщение">
							<Mic size={20} />
						</button>
						<button type="button" className={styles.chatIconButton} aria-label="Прикрепить файл">
							<Paperclip size={20} />
						</button>
						<button type="submit" className={styles.chatSendButton} aria-label="Отправить">
							<Send size={20} />
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
