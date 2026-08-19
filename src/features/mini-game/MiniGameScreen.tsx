import { useMemo, useState } from 'react';
import { ChevronLeft, Gift, Package, HelpCircle } from 'lucide-react';
import { Header } from '../../widgets/header/Header';
import styles from './mini-game.module.css';

const PRIZES = [10, 15, 20] as const;
type Prize = (typeof PRIZES)[number];
type Phase = 'idle' | 'spinning' | 'result';

const ITEM_HEIGHT = 118;
const ITEM_GAP = 12;
const STRIDE = ITEM_HEIGHT + ITEM_GAP;
const VIEWPORT_HEIGHT = 430;
const LOOPS = 14;

function ticketClass(value: Prize) {
	if (value === 10) return styles.ticket10;
	if (value === 15) return styles.ticket15;
	return styles.ticket20;
}

function Ticket({ value }: { value: Prize }) {
	return (
		<div className={`${styles.ticket} ${ticketClass(value)}`}>
			<span>{value}%</span>
		</div>
	);
}

export function MiniGameScreen() {
	const [phase, setPhase] = useState<Phase>('idle');
	const [balance, setBalance] = useState(1);
	const [prize, setPrize] = useState<Prize>(20);
	const [offset, setOffset] = useState(0);
	const [helpOpen, setHelpOpen] = useState(false);

	const reel = useMemo(
		() => Array.from({ length: LOOPS * PRIZES.length }, (_, index) => PRIZES[index % PRIZES.length]),
		[],
	);

	const centerPad = (VIEWPORT_HEIGHT - ITEM_HEIGHT) / 2;

	function handleBack() {
		if (phase === 'result') {
			setPhase('idle');
			setOffset(0);
			return;
		}
		window.history.back();
	}

	function handleSpin() {
		if (phase === 'spinning' || balance < 1) return;

		const nextPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
		const searchStart = reel.length - 8;
		let landIndex = -1;
		for (let i = reel.length - 1; i >= searchStart; i -= 1) {
			if (reel[i] === nextPrize) {
				landIndex = i;
				break;
			}
		}

		setBalance((value) => value - 1);
		setPrize(nextPrize);
		setPhase('spinning');
		setOffset(0);

		window.requestAnimationFrame(() => {
			setOffset(landIndex * STRIDE);
		});

		window.setTimeout(() => {
			setPhase('result');
		}, 2800);
	}

	return (
		<div className={`${styles.page} ${phase === 'result' ? styles.pageResult : ''}`}>
			{phase === 'result' && <div className={styles.waves} aria-hidden="true" />}

			{phase !== 'result' && (
				<div className={styles.topBar}>
					<Header />
				</div>
			)}

			{phase === 'result' ? (
				<section className={styles.result}>
					<div className={styles.burstWrap}>
						<div className={styles.burst} aria-hidden="true" />
						<div className={`${styles.ticket} ${styles.ticket20} ${styles.resultTicket}`}>
							<span>{prize}%</span>
						</div>
					</div>

					<p className={styles.resultTitle}>
						Поздравляем! Вы выиграли {prize}% скидку на покупку следующих билетов
					</p>
					<p className={styles.resultHint}>Вы можете применить её в любое время до 31.12.2026</p>

					<button
						type="button"
						className={`${styles.spinBtn} ${balance < 1 ? styles.spinBtnDisabled : ''}`}
						onClick={() => {
							setPhase('idle');
							setOffset(0);
							if (balance >= 1) {
								window.setTimeout(handleSpin, 50);
							}
						}}
					>
						<span>Крутить ещё раз</span>
						<div className={styles.spinBadge}>
							<span>{balance}</span>
							<Gift size={16} strokeWidth={2.2} />
						</div>
					</button>
				</section>
			) : (
				<section className={styles.sheet}>
					<div className={styles.gameHeader}>
						<button type="button" className={styles.backBtn} aria-label="Назад" onClick={handleBack}>
							<ChevronLeft size={24} />
						</button>

						<div className={styles.giftBadge}>
							<span>{balance}</span>
							<Gift size={18} strokeWidth={2.2} />
						</div>

						<div className={styles.headerRight}>
							<button type="button" className={styles.iconBtn} aria-label="Инвентарь">
								<Package size={18} />
							</button>
							<button type="button" className={styles.iconBtn} aria-label="Помощь" onClick={() => setHelpOpen(true)}>
								<HelpCircle size={18} />
							</button>
						</div>
					</div>

					<div className={`${styles.stage} ${phase === 'spinning' ? styles.stageSpinning : ''}`}>
						{phase === 'spinning' && (
							<>
								<div className={`${styles.pointer} ${styles.pointerLeft}`} aria-hidden="true" />
								<div className={`${styles.pointer} ${styles.pointerRight}`} aria-hidden="true" />
							</>
						)}

						{phase === 'idle' ? (
							<div className={styles.idleStack}>
								{PRIZES.map((value) => (
									<Ticket key={value} value={value} />
								))}
							</div>
						) : (
							<div className={styles.viewport} style={{ height: VIEWPORT_HEIGHT }}>
								<div
									className={styles.reel}
									style={{
										transform: `translateY(${centerPad - offset}px)`,
									}}
								>
									{reel.map((value, index) => (
										<Ticket key={`${value}-${index}`} value={value} />
									))}
								</div>
							</div>
						)}
					</div>

					<div className={styles.footer}>
						<button
							type="button"
							className={`${styles.spinBtn} ${phase === 'spinning' ? styles.spinBtnBusy : ''} ${balance < 1 ? styles.spinBtnDisabled : ''}`}
							onClick={handleSpin}
							disabled={phase === 'spinning' || balance < 1}
						>
							<span>Крутить</span>
							<div className={styles.spinBadge}>
								<span>{Math.max(balance, 0)}</span>
								<Gift size={16} strokeWidth={2.2} />
							</div>
						</button>
					</div>
				</section>
			)}

			{helpOpen && (
				<div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="help-title">
					<div className={styles.modal}>
						<h2 id="help-title">Как играть</h2>
						<p>Нажмите «Крутить», чтобы потратить 1 подарок и выиграть скидку 10%, 15% или 20%.</p>
						<button type="button" onClick={() => setHelpOpen(false)}>
							Понятно
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
