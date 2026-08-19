import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, CreditCard, Gift, MapPin, Mic, Paperclip, Plus, Search, Send, Sparkles, User, X, Clock, Plane } from 'lucide-react';
import avatarPlaceholder from '../../assets/images/avatars/avatar-1.jpg';
import myAvatar from '../../assets/images/avatars/avatar-2.jpg';
import departureIcon from '../../assets/images/tickets/departure.png';
import arrivalIcon from '../../assets/images/tickets/arrival.png';
import widgetAltIcon from '../../assets/images/tickets/Widget_alt.png';
import searchLightIcon from '../../assets/images/tickets/Search_light.png';
import chatAddIcon from '../../assets/images/tickets/Chat_alt_add_light.png';
import expandLeftIcon from '../../assets/images/tickets/Expand_left_light.png';
import nfcIcon from '../../assets/images/tickets/NFC.png';
import samolIcon from '../../assets/images/tickets/samol.png';
import buletIcon from '../../assets/images/tickets/bulet.png';
import { sendAiAgentMessage, type AiAgentOfferCard } from '../../shared/api/ai-agent';
import type { Chat, ChatMessage } from '../../entities/chat/mockChats';
import styles from './chat.module.css';

interface AiAgentScreenProps {
	chat: Chat;
}

type AgentMessage = ChatMessage & {
	offerCards?: AiAgentOfferCard[];
	paymentActionsCard?: {
		routeImage?: string;
		ticketsImage?: string;
		offer?: AiAgentOfferCard;
	};
};

interface AgentChat {
	id: string;
	title: string;
	updatedAt: number;
	messages: AgentMessage[];
}

interface PaymentFormState {
	cardNumber: string;
	holderName: string;
	expiry: string;
	cvv: string;
}

const STORAGE_KEY = 'tutu.aiAgent.chats';
const ACTIVE_KEY = 'tutu.aiAgent.activeChatId';

function todayGroupKey(ts: number): 'Сегодня' | 'Вчера' | 'Ранее' {
	const d = new Date(ts);
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	const sameDay = (a: Date, b: Date) =>
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate();

	if (sameDay(d, today)) return 'Сегодня';
	if (sameDay(d, yesterday)) return 'Вчера';
	return 'Ранее';
}

function defaultChatTitle(firstText: string): string {
	const trimmed = firstText.trim();
	if (!trimmed) return 'Новый чат';
	if (trimmed.length <= 40) return trimmed;
	return trimmed.slice(0, 40).trim() + '…';
}

function loadChatsFromStorage(): AgentChat[] {
	try {
		const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
		if (!raw) return [];
		const parsed = JSON.parse(raw) as AgentChat[];
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch {
		return [];
	}
}

function saveChatsToStorage(chats: AgentChat[]) {
	try {
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
		}
	} catch {
		/* ignore */
	}
}

function loadActiveChatId(): string | null {
	try {
		return typeof window !== 'undefined' ? window.localStorage.getItem(ACTIVE_KEY) : null;
	} catch {
		return null;
	}
}

function saveActiveChatId(id: string | null) {
	try {
		if (typeof window === 'undefined') return;
		if (id == null) window.localStorage.removeItem(ACTIVE_KEY);
		else window.localStorage.setItem(ACTIVE_KEY, id);
	} catch {
		/* ignore */
	}
}

function createNewEmptyChat(): AgentChat {
	return {
		id: 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
		title: 'Новый чат',
		updatedAt: Date.now(),
		messages: [],
	};
}

const FLAG_RU =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="4" fill="#ffffff"/><rect y="4" width="18" height="4" fill="#0039a6"/><rect y="8" width="18" height="4" fill="#d52b1e"/></svg>'
	);

const FLAG_EG =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12"><rect width="18" height="4" fill="#ce1126"/><rect y="4" width="18" height="4" fill="#ffffff"/><rect y="8" width="18" height="4" fill="#000000"/></svg>'
	);

function getRouteImage(direction: string) {
	const normalized = direction.toLowerCase();
	if (normalized.includes('обратно') || normalized.includes('прилет') || normalized.includes('arrival')) {
		return arrivalIcon.src;
	}
	return departureIcon.src;
}

function getFlagSvg(city: string) {
	const normalized = city.toLowerCase();

	if (normalized.includes('шарм') || normalized.includes('егип')) {
		return FLAG_EG;
	}

	return FLAG_RU;
}

function cleanAiText(raw: string): string {
	let text = raw.replace(/\n\nИнструменты Tutu MCP:[^\n]*$/g, '');
	text = text.replace(/^Инструменты Tutu MCP:[^\n]*$/gm, '');
	text = text.replace(/\*([^*]+)\*/g, '$1');
	text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
	text = text.replace(/^#+\s+/gm, '');
	text = text.replace(/`([^`]+)`/g, '$1');
	text = text.replace(/_{1,2}([^_]+)_{1,2}/g, '$1');
	text = text.replace(/~~([^~]+)~~/g, '$1');
	text = text.replace(/^[-*+]\s+/gm, '• ');
	text = text.replace(/^\d+\.\s+/gm, (m) => m);
	text = text.replace(/\n{3,}/g, '\n\n');
	return text.trim();
}

function renderMessageText(text: string) {
	const parts: Array<{ type: 'text' | 'link'; content: string; href?: string }> = [];
	const urlRegex = /(https?:\/\/[^\s]+)/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = urlRegex.exec(text)) !== null) {
		if (match.index > lastIndex) {
			parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
		}
		parts.push({ type: 'link', content: 'Оформить на Tutu', href: match[0] });
		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < text.length) {
		parts.push({ type: 'text', content: text.slice(lastIndex) });
	}

	if (parts.length === 0) {
		return <>{text}</>;
	}

	return (
		<>
			{parts.map((part, i) =>
				part.type === 'link' ? (
					<a
						key={i}
						href={part.href}
						target="_blank"
						rel="noopener noreferrer"
						className={styles.messageLink}
					>
						{part.content} ↗
					</a>
				) : (
					<span key={i}>{part.content}</span>
				)
			)}
		</>
	);
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

export function AiAgentScreen({ chat }: AiAgentScreenProps) {
	const [chats, setChats] = useState<AgentChat[]>(() => {
		const fromStorage = loadChatsFromStorage();
		if (fromStorage.length > 0) return fromStorage;

		const initial: AgentChat = {
			id: 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
			title: chat.name ?? 'ИИ-агент',
			updatedAt: Date.now(),
			messages: (chat.messages ?? []) as AgentMessage[],
		};
		return [initial];
	});

	const [activeChatId, setActiveChatId] = useState<string>(() => {
		const stored = loadActiveChatId();
		if (stored) return stored;
		const fromStorage = loadChatsFromStorage();
		if (fromStorage.length > 0) return fromStorage[0].id;
		return '';
	});

	const [draft, setDraft] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isTyping, setIsTyping] = useState(false);
	const [selectedOffer, setSelectedOffer] = useState<AiAgentOfferCard | null>(null);
	const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
		cardNumber: '',
		holderName: '',
		expiry: '',
		cvv: ''
	});
	const [paymentError, setPaymentError] = useState<string | null>(null);
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [dailyTicketUnlocked, setDailyTicketUnlocked] = useState(false);
	const [rewardClaimed, setRewardClaimed] = useState(false);
	const [routeModalOpen, setRouteModalOpen] = useState(false);
	const [routeModalOffer, setRouteModalOffer] = useState<AiAgentOfferCard | null>(null);
	const [generatingTicket, setGeneratingTicket] = useState(false);
	const [lastPaidOffer, setLastPaidOffer] = useState<AiAgentOfferCard | null>(null);

	const [historyOpen, setHistoryOpen] = useState(false);
	const [historyQuery, setHistoryQuery] = useState('');
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const activeChat = chats.find((c) => c.id === activeChatId) ?? chats[0] ?? null;
	const messages = activeChat?.messages ?? chat.messages ?? [];

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		if (chats.length > 0 && !activeChatId) {
			setActiveChatId(chats[0].id);
			saveActiveChatId(chats[0].id);
		}
	}, [chats, activeChatId]);

	useEffect(() => {
		saveChatsToStorage(chats);
	}, [chats]);

	useEffect(() => {
		if (activeChatId) saveActiveChatId(activeChatId);
	}, [activeChatId]);

	useEffect(() => {
		scrollToBottom();
	}, [messages, isTyping, activeChatId]);

	function updateActiveChat(updater: (prev: AgentChat) => AgentChat) {
		setChats((prev) => {
			const next = prev.map((c) => (c.id === activeChatId ? updater(c) : c));
			const active = next.find((c) => c.id === activeChatId);
			if (active) {
				active.updatedAt = Date.now();
			}
			return next;
		});
	}

	function switchChat(chatId: string) {
		setActiveChatId(chatId);
		setHistoryOpen(false);
		setError(null);
	}

	function startNewChat() {
		const fresh = createNewEmptyChat();
		setChats((prev) => [fresh, ...prev]);
		setActiveChatId(fresh.id);
		setError(null);
		setSelectedOffer(null);
		setDailyTicketUnlocked(false);
		setRewardClaimed(false);
	}

	const showIntro = messages.length <= 1;

	const filteredChatsForHistory = chats
		.filter((c) => !historyQuery.trim() || c.title.toLowerCase().includes(historyQuery.trim().toLowerCase()))
		.sort((a, b) => b.updatedAt - a.updatedAt);

	const groupedChats: Record<string, AgentChat[]> = { Сегодня: [], Вчера: [], Ранее: [] };
	for (const c of filteredChatsForHistory) {
		const key = todayGroupKey(c.updatedAt);
		groupedChats[key].push(c);
	}

	async function submitMessage(text: string) {
		const trimmed = text.trim();
		if (!trimmed || isSubmitting) return;

		const userMessage: AgentMessage = {
			id: String(Date.now()),
			author: 'me',
			content: { kind: 'text', text: trimmed },
			time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
		};

		const isFirstMessage = messages.length === 0;
		const nextMessages = [...messages, userMessage];

		updateActiveChat((prev) => ({
			...prev,
			title: isFirstMessage ? defaultChatTitle(trimmed) : prev.title,
			messages: nextMessages,
		}));

		setDraft('');
		setError(null);
		setIsSubmitting(true);
		setIsTyping(true);

		try {
			const response = await sendAiAgentMessage(
				nextMessages
					.filter((m) => m.content.kind === 'text')
					.map((message) => ({
						role: message.author === 'me' ? 'user' : 'assistant',
						content: (message.content as { kind: 'text'; text: string }).text,
					}))
			);

			setIsTyping(false);

			const agentReply: AgentMessage = {
				id: String(Date.now() + 1),
				author: 'them',
				content: {
					kind: 'text',
					text: cleanAiText(response.reply),
				},
				time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
				offerCards: response.offerCards,
			};

			updateActiveChat((prev) => ({
				...prev,
				messages: [...prev.messages, agentReply],
			}));
		} catch (submitError) {
			setIsTyping(false);
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

	function openPayment(offer: AiAgentOfferCard) {
		setSelectedOffer(offer);
		setPaymentError(null);
	}

	function closePayment() {
		setSelectedOffer(null);
		setPaymentError(null);
	}

	function updatePaymentField(field: keyof PaymentFormState, value: string) {
		setPaymentForm((prev) => ({ ...prev, [field]: value }));
	}

	function claimDailyReward() {
		if (rewardClaimed) return;

		const rewardMsg: AgentMessage = {
			id: String(Date.now() + 3),
			author: 'them',
			content: {
				kind: 'text',
				text:
					'Поздравляем! За покупку вы получили "Билет дня". В демо это бесплатный апгрейд следующего заказа и доступ к спецпредложению на следующую поездку.',
			},
			time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
		};

		updateActiveChat((prev) => ({
			...prev,
			messages: [...prev.messages, rewardMsg],
		}));
		setRewardClaimed(true);
	}

	function generatePNR(): string {
		const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		let result = '';
		for (let i = 0; i < 6; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	function generateSeatNumber(): string {
		const row = Math.floor(Math.random() * 28) + 1;
		const seat = ['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)];
		return `${row}${seat}`;
	}

	function generateFlightNumber(offer: AiAgentOfferCard): string {
		const carriers = ['SU', 'S7', 'UT', 'FV', 'DP', 'U6'];
		const carrier = carriers[Math.floor(Math.random() * carriers.length)];
		const num = Math.floor(Math.random() * 8000) + 100;
		return `${carrier} ${num}`;
	}

	function formatTicketDate(offer: AiAgentOfferCard): string {
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);
		const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
		return `${tomorrow.getDate()} ${months[tomorrow.getMonth()]}`;
	}

	function fallbackOffer(): AiAgentOfferCard {
		return {
			id: 'offer_fallback_' + Date.now(),
			kind: 'rail',
			title: 'Эконом',
			subtitle: 'Прямой рейс',
			fromCode: 'MOW',
			fromCity: 'Москва',
			toCode: 'AER',
			toCity: 'Сочи',
			departureTime: '08:45',
			arrivalTime: '11:20',
			duration: '2 ч 35 мин',
			price: '12 490 ₽',
			rating: '4.8',
			checkoutUrl: 'https://tutu.ru',
		};
	}

	function resolveOffer(offer: AiAgentOfferCard | undefined | null): AiAgentOfferCard {
		return offer ?? lastPaidOffer ?? fallbackOffer();
	}

	function openRouteModal(offer: AiAgentOfferCard | undefined) {
		const resolved = resolveOffer(offer);
		setRouteModalOffer(resolved);
		setRouteModalOpen(true);
	}

	function closeRouteModal() {
		setRouteModalOpen(false);
		setRouteModalOffer(null);
	}

	async function handleDownloadTicket(offer: AiAgentOfferCard | undefined) {
		const resolved = resolveOffer(offer);
		setGeneratingTicket(true);

		try {
			await new Promise((r) => setTimeout(r, 700));

			const pnr = generatePNR();
			const seat = generateSeatNumber();
			const flight = generateFlightNumber(resolved);
			const date = formatTicketDate(resolved);
			const eTicketNumber = '643' + Math.floor(Math.random() * 1_000_000_000_000).toString().padStart(13, '0');
			const passenger = 'IVAN IVANOV';

			const ticketContent = `
═══════════════════════════════════════════════
                 BOARDING PASS
       ╔═══════════════════════════════════╗
       ║        AVIABILET / E-TICKET       ║
       ╚═══════════════════════════════════╝

  Номер билета (e-ticket):    ${eTicketNumber}
  PNR / Код бронирования:    ${pnr}
  Пассажир:                   ${passenger}

───────────────────────────────────────────────
  РЕЙС:
    Номер рейса:              ${flight}
    Маршрут:                  ${resolved.fromCity} (${resolved.fromCode}) → ${resolved.toCity} (${resolved.toCode})
    Дата:                     ${date}
    Вылет:                    ${resolved.departureTime}
    Прибытие:                ${resolved.arrivalTime}
    Время в пути:            ${resolved.duration}

───────────────────────────────────────────────
  ПОСАДКА:
    Место:                    ${seat}
    Класс обслуживания:       Economy
    Выход на посадку:         ${Math.floor(Math.random() * 8) + 1}
    Начало посадки:           ${resolved.departureTime.slice(0, -3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}

───────────────────────────────────────────────
  ТАРИФ И ОПЛАТА:
    Стоимость:                ${resolved.price}
    Тариф:                    ${resolved.title}
    Возврат/обмен:            По правилам тарифа

───────────────────────────────────────────────
   ⚠  Регистрация заканчивается за 40 минут
      до вылета. Приятного полёта!
═══════════════════════════════════════════════
  Сгенерировано в демо-приложении Tutu
  ${new Date().toLocaleString('ru-RU')}
`.trim();

			const blob = new Blob([ticketContent], { type: 'text/plain;charset=utf-8' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `TICKET_${pnr}_${resolved.fromCode}-${resolved.toCode}.txt`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} finally {
			setGeneratingTicket(false);
		}
	}

	async function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!selectedOffer) return;

		if (
			paymentForm.cardNumber.replace(/\s/g, '').length < 16 ||
			paymentForm.holderName.trim().length < 3 ||
			paymentForm.expiry.trim().length < 4 ||
			paymentForm.cvv.trim().length < 3
		) {
			setPaymentError('Заполните данные карты полностью, чтобы завершить демо-оплату.');
			return;
		}

		setPaymentError(null);
		setIsProcessingPayment(true);
		const offerTitle = selectedOffer.title;
		const offerSnapshot = { ...selectedOffer };

		window.setTimeout(() => {
			setIsProcessingPayment(false);
			setDailyTicketUnlocked(true);
			setLastPaidOffer(offerSnapshot);

			const nowBase = Date.now();
			const successMsg: AgentMessage = {
				id: String(nowBase + 2),
				author: 'them',
				content: {
					kind: 'text',
					text: `Оплата прошла успешно. ${offerTitle} подтверждён, а билет оформлен внутри демо без перехода на внешний сайт.`,
				},
				time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			};

			const actionsMsg: AgentMessage = {
				id: String(nowBase + 4),
				author: 'them',
				content: {
					kind: 'text',
					text: '',
				},
				time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
				paymentActionsCard: {
					routeImage: samolIcon.src,
					ticketsImage: buletIcon.src,
					offer: offerSnapshot,
				},
			};

			updateActiveChat((prev) => ({
				...prev,
				messages: [...prev.messages, successMsg, actionsMsg],
			}));
			setSelectedOffer(null);
			setPaymentForm({
				cardNumber: '',
				holderName: '',
				expiry: '',
				cvv: ''
			});
		}, 900);
	}

	return (
		<div className={styles.aiAgentPage}>
			<div className={styles.aiTopBar}>
				<button onClick={() => window.history.back()} className={styles.aiTopBarBtn}>
					<ArrowLeft size={18} />
				</button>
				<button
					type="button"
					className={styles.aiTopBarIconBtn}
					aria-label="История чатов"
					onClick={() => setHistoryOpen(true)}
				>
					<img src={widgetAltIcon.src} alt="" className={styles.aiTopBarIconImg} />
				</button>
				<button type="button" className={styles.aiTopBarIconBtn} aria-label="Поиск в чате">
					<img src={searchLightIcon.src} alt="" className={styles.aiTopBarIconImg} />
				</button>
				<span className={styles.aiTopBarTitle}>ИИ</span>
				<button
					type="button"
					className={styles.aiTopBarIconBtn}
					aria-label="Новый чат"
					onClick={startNewChat}
				>
					<img src={chatAddIcon.src} alt="" className={styles.aiTopBarIconImg} />
				</button>
				<button type="button" className={styles.aiTopBarIconBtn} aria-label="NFC">
					<img src={nfcIcon.src} alt="" className={styles.aiTopBarIconImg} />
				</button>
				<button type="button" className={styles.aiTopBarIconBtn} aria-label="Развернуть">
					<img src={expandLeftIcon.src} alt="" className={styles.aiTopBarIconImg} />
				</button>
			</div>

			<div className={styles.aiAgentContent}>
				{showIntro && (
					<div className={styles.aiIntroSection}>
						<div className={styles.aiHeaderAvatar}>
							<User size={48} color="#999" />
						</div>
						<h1 className={styles.aiHeaderTitle}>{activeChat?.title || chat.name}</h1>
						<p className={styles.aiHeaderSubtitle}>{chat.role}</p>
						<span className={styles.chatIntroHint}>
							Выберите сценарий ниже или напишите запрос своими словами.
						</span>
					</div>
				)}

				<div className={styles.messagesList}>
					{messages.map((message) =>
						message.content.kind === 'text' ? (
							<div
								key={message.id}
								className={`${styles.messageRow} ${
									message.author === 'me' ? styles.messageRowMe : styles.messageRowThem
								}`}
							>
								{message.author === 'them' ? (
									<img src={avatarPlaceholder.src} alt="" className={styles.messageAvatar} />
								) : (
									<img src={myAvatar.src} alt="" className={styles.messageAvatar} />
								)}
								<div className={styles.messageGroup}>
									{message.content.text && (
										<div
											className={`${styles.messageBubble} ${
												message.author === 'me' ? styles.messageBubbleMe : styles.messageBubbleThem
											}`}
										>
											<div
												className={`${styles.messageText} ${
													message.author === 'me' ? styles.messageTextMe : styles.messageTextThem
												}`}
											>
												{renderMessageText(message.content.text)}
											</div>
											<span
												className={`${styles.messageTime} ${
													message.author === 'me' ? styles.messageTimeMe : styles.messageTimeThem
												}`}
											>
												{message.time}
											</span>
										</div>
									)}

									{message.author === 'them' && message.offerCards && message.offerCards.length > 0 && (
										<div className={styles.offerCardsList}>
											{message.offerCards.map((card) => (
												<button
													key={card.id}
													className={styles.offerCard}
													type="button"
													onClick={() => openPayment(card)}
												>
													<div className={styles.offerCardTimes}>
														<span>{card.departureTime}</span>
														<span>{card.arrivalTime}</span>
													</div>

													<div className={styles.offerCardRoute}>
														<div className={styles.offerCardPoint}>
															<span className={styles.offerCardCode}>{card.fromCode}</span>
															<div className={styles.offerCardCityRow}>
																<span className={styles.offerCardCity}>{card.fromCity}</span>
																<img src={getFlagSvg(card.fromCity)} alt="" className={styles.offerCardFlag} />
															</div>
														</div>

														<div className={styles.offerCardLine}>
															<img src={getRouteImage('Туда')} alt="" className={styles.offerCardPlaneArt} />
														</div>

														<div className={`${styles.offerCardPoint} ${styles.offerCardPointRight}`}>
															<span className={styles.offerCardCode}>{card.toCode}</span>
															<div className={styles.offerCardCityRow}>
																<span className={styles.offerCardCity}>{card.toCity}</span>
																<img src={getFlagSvg(card.toCity)} alt="" className={styles.offerCardFlag} />
															</div>
														</div>
													</div>

													<div className={styles.offerCardFooter}>
														<span className={styles.offerCardChip}>{card.title.replace('Поезд ', '')}</span>
														<span className={styles.offerCardDirection}>Туда</span>
													</div>
												</button>
											))}
										</div>
									)}

									{message.author === 'them' && message.paymentActionsCard && (
										<div className={styles.postPayCard}>
											<div className={styles.postPayRouteBlock}>
												<img
													src={samolIcon.src}
													alt="Маршрут"
													className={styles.postPayRouteImg}
												/>
												<button
													type="button"
													className={styles.postPayRouteBtn}
													onClick={() => openRouteModal(message.paymentActionsCard?.offer)}
												>
													Посмотреть маршрут
												</button>
											</div>

											<div className={styles.postPayTicketsBlock}>
												<img
													src={buletIcon.src}
													alt="Билеты"
													className={styles.postPayTicketsImg}
												/>
												<button
													type="button"
													className={styles.postPayTicketsBtn}
													onClick={() => handleDownloadTicket(message.paymentActionsCard?.offer)}
													disabled={generatingTicket}
												>
													{generatingTicket ? 'Генерирую билет...' : 'Скачать билеты'}
												</button>
											</div>
										</div>
									)}
								</div>
							</div>
						) : null
					)}
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
					{dailyTicketUnlocked && (
						<div className={styles.rewardCard}>
							<div className={styles.rewardHeader}>
								<Gift size={18} />
								<span>Билет дня</span>
							</div>
							<p className={styles.rewardText}>
								После покупки у пользователя есть одна попытка в день открыть бонусный билет или спецприз.
							</p>
							<button
								type="button"
								className={styles.rewardButton}
								onClick={claimDailyReward}
								disabled={rewardClaimed}
							>
								{rewardClaimed ? 'Бонус уже открыт сегодня' : 'Открыть ежедневный бонус'}
							</button>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{chat.quickActions && showIntro && (
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

			{selectedOffer && (
				<div className={styles.paymentOverlay}>
					<div className={styles.paymentModal}>
						<div className={styles.paymentHeader}>
							<div>
								<span className={styles.paymentEyebrow}>Демо-оплата</span>
								<h2 className={styles.paymentTitle}>Подтвердить поездку</h2>
							</div>
							<button type="button" className={styles.paymentClose} onClick={closePayment}>
								<ArrowLeft size={18} />
							</button>
						</div>

						<div className={styles.paymentSummary}>
							<div>
								<span className={styles.paymentSummaryTitle}>{selectedOffer.title}</span>
								<span className={styles.paymentSummarySubtitle}>{selectedOffer.subtitle}</span>
							</div>
							<div className={styles.paymentSummaryMeta}>
								<span>{selectedOffer.departureTime} {'->'} {selectedOffer.arrivalTime}</span>
								<span>{selectedOffer.price}</span>
							</div>
						</div>

						<form className={styles.paymentForm} onSubmit={handlePaymentSubmit}>
							<label className={styles.paymentField}>
								<span>Номер карты</span>
								<div className={styles.paymentInputWrap}>
									<CreditCard size={16} />
									<input
										value={paymentForm.cardNumber}
										onChange={(e) => updatePaymentField('cardNumber', e.target.value)}
										placeholder="2200 1234 5678 9012"
										className={styles.paymentInput}
									/>
								</div>
							</label>

							<label className={styles.paymentField}>
								<span>Имя держателя</span>
								<input
									value={paymentForm.holderName}
									onChange={(e) => updatePaymentField('holderName', e.target.value)}
									placeholder="IVAN IVANOV"
									className={styles.paymentInput}
								/>
							</label>

							<div className={styles.paymentRow}>
								<label className={styles.paymentField}>
									<span>Срок</span>
									<input
										value={paymentForm.expiry}
										onChange={(e) => updatePaymentField('expiry', e.target.value)}
										placeholder="08/28"
										className={styles.paymentInput}
									/>
								</label>
								<label className={styles.paymentField}>
									<span>CVV</span>
									<input
										value={paymentForm.cvv}
										onChange={(e) => updatePaymentField('cvv', e.target.value)}
										placeholder="123"
										className={styles.paymentInput}
									/>
								</label>
							</div>

							{paymentError && <div className={styles.paymentError}>{paymentError}</div>}

							<div className={styles.paymentHint}>
								<Sparkles size={14} />
								<span>После оплаты пользователь получает шанс открыть ежедневный бонусный билет.</span>
							</div>

							<button type="submit" className={styles.paymentSubmit} disabled={isProcessingPayment}>
								{isProcessingPayment ? 'Проводим оплату...' : `Оплатить ${selectedOffer.price}`}
							</button>
						</form>
					</div>
				</div>
			)}

			{historyOpen && (
				<div className={styles.historyOverlay} onClick={() => setHistoryOpen(false)}>
					<div
						className={styles.historyDrawer}
						onClick={(e) => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
					>
						<div className={styles.historySearchWrap}>
							<Search size={18} className={styles.historySearchIcon} />
							<input
								type="text"
								className={styles.historySearch}
								placeholder="Поиск по названию"
								value={historyQuery}
								onChange={(e) => setHistoryQuery(e.target.value)}
							/>
						</div>

						<div className={styles.historyList}>
							{(['Сегодня', 'Вчера', 'Ранее'] as const).map((groupName) => {
								const items = groupedChats[groupName];
								if (!items || items.length === 0) return null;
								return (
									<div key={groupName} className={styles.historyGroup}>
										<div className={styles.historyGroupLabel}>{groupName}</div>
										<div className={styles.historyGroupItems}>
											{items.map((c) => (
												<button
													key={c.id}
													type="button"
													className={`${styles.historyItem} ${
														c.id === activeChatId ? styles.historyItemActive : ''
													}`}
													onClick={() => switchChat(c.id)}
												>
													{typeof c.title === 'string' ? c.title : 'Без названия'}
												</button>
											))}
										</div>
									</div>
								);
							})}

							{filteredChatsForHistory.length === 0 && (
								<div className={styles.historyEmpty}>
									Пока нет сохранённых чатов. Напишите первое сообщение — и чат появится здесь.
								</div>
							)}
						</div>

						<div className={styles.historyFooter}>
							<div className={styles.profileRow}>
								<div className={styles.profileAvatar}>
									<User size={22} />
								</div>
								<div className={styles.profileInfo}>
									<div className={styles.profileName}>User23</div>
								</div>
								<ArrowLeft size={18} className={styles.profileChevron} />
							</div>
						</div>
					</div>
				</div>
			)}

			{routeModalOpen && routeModalOffer && (
				<div className={styles.routeModalOverlay} onClick={closeRouteModal}>
					<div
						className={styles.routeModal}
						onClick={(e) => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
					>
						<div className={styles.routeModalHeader}>
							<div>
								<span className={styles.routeModalEyebrow}>Информация о рейсе</span>
								<h2 className={styles.routeModalTitle}>Маршрут</h2>
							</div>
							<button type="button" className={styles.routeModalClose} onClick={closeRouteModal}>
								<X size={18} />
							</button>
						</div>

						<div className={styles.routeBody}>
							<div className={styles.routeHeaderCard}>
								<div className={styles.routeCities}>
									<span className={styles.routeCityFrom}>{routeModalOffer.fromCity}</span>
									<div className={styles.routePlaneIcon}>
										<Plane size={20} />
									</div>
									<span className={styles.routeCityTo}>{routeModalOffer.toCity}</span>
								</div>
								<div className={styles.routeCodes}>
									<span className={styles.routeCode}>{routeModalOffer.fromCode}</span>
									<div className={styles.routeDashedLine} />
									<span className={styles.routeCode}>{routeModalOffer.toCode}</span>
								</div>
							</div>

							<div className={styles.routeTimeline}>
								<div className={styles.routeTimelineCol}>
									<div className={styles.routeTimelineDotGreen} />
									<div className={styles.routeTimelineLine} />
									<div className={styles.routeTimelineDotRed} />
								</div>
								<div className={styles.routeTimelineContent}>
									<div className={styles.routeTimelineItem}>
										<div className={styles.routeTimelineTime}>{routeModalOffer.departureTime}</div>
										<div className={styles.routeTimelineInfo}>
											<MapPin size={14} />
											<span>Вылет: {routeModalOffer.fromCity}</span>
										</div>
										<div className={styles.routeTimelineMeta}>
											<Clock size={12} />
											<span>Регистрация до {routeModalOffer.departureTime.slice(0, -3)}:10</span>
										</div>
									</div>

									<div className={styles.routeTimelineDuration}>
										<span>Время в пути: {routeModalOffer.duration}</span>
										<span>Прямой рейс</span>
									</div>

									<div className={styles.routeTimelineItem}>
										<div className={styles.routeTimelineTime}>{routeModalOffer.arrivalTime}</div>
										<div className={styles.routeTimelineInfo}>
											<MapPin size={14} />
											<span>Прибытие: {routeModalOffer.toCity}</span>
										</div>
										<div className={styles.routeTimelineMeta}>
											<Clock size={12} />
											<span>Терминал {Math.floor(Math.random() * 4) + 1}</span>
										</div>
									</div>
								</div>
							</div>

							<div className={styles.routeDetailsGrid}>
								<div className={styles.routeDetailCard}>
									<span className={styles.routeDetailLabel}>Номер рейса</span>
									<span className={styles.routeDetailValue}>
										{['SU', 'S7', 'U6', 'FV'][Math.floor(Math.random() * 4)]} {Math.floor(Math.random() * 9000) + 1000}
									</span>
								</div>
								<div className={styles.routeDetailCard}>
									<span className={styles.routeDetailLabel}>Класс</span>
									<span className={styles.routeDetailValue}>Economy</span>
								</div>
								<div className={styles.routeDetailCard}>
									<span className={styles.routeDetailLabel}>Тариф</span>
									<span className={styles.routeDetailValue}>{routeModalOffer.title}</span>
								</div>
								<div className={styles.routeDetailCard}>
									<span className={styles.routeDetailLabel}>Цена</span>
									<span className={styles.routeDetailValue}>{routeModalOffer.price}</span>
								</div>
							</div>

							<div className={styles.routeFooterCard}>
								<div className={styles.routeFooterRow}>
									<span className={styles.routeFooterLabel}>Багаж</span>
									<span className={styles.routeFooterValue}>1 место (до 23 кг)</span>
								</div>
								<div className={styles.routeFooterRow}>
									<span className={styles.routeFooterLabel}>Ручная кладь</span>
									<span className={styles.routeFooterValue}>1 место (до 10 кг)</span>
								</div>
								<div className={styles.routeFooterRow}>
									<span className={styles.routeFooterLabel}>Питание на борту</span>
									<span className={styles.routeFooterValue}>Включено</span>
								</div>
								<div className={styles.routeFooterRow}>
									<span className={styles.routeFooterLabel}>Возврат</span>
									<span className={styles.routeFooterValue}>По правилам тарифа</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
