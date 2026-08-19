import { useState } from 'react';
import { ChevronLeft, Gift, Package, HelpCircle } from 'lucide-react';
import styles from './mini-game.module.css';

const PRIZES = [10, 15, 20];

export function MiniGameScreen() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<number | null>(null);

  const handleBack = () => {
    window.history.back();
  };

  const handleSpin = () => {
    if (isSpinning) return;

    const nextPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];

    setSelectedPrize(null);
    setIsSpinning(true);

    window.setTimeout(() => {
      setSelectedPrize(nextPrize);
      setIsSpinning(false);
    }, 1200);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backBtn} aria-label="Назад">
          <ChevronLeft size={24} />
        </button>

        <div className={styles.giftBadge}>
          <span>1</span>
          <Gift size={20} fill="currentColor" />
        </div>

        <div className={styles.headerRight}>
          <button className={styles.iconBtn} aria-label="Подарки">
            <Package size={20} />
          </button>
          <button className={styles.iconBtn} aria-label="Помощь">
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      <div className={styles.cardsContainer}>
        {[10, 15, 20].map((value) => (
          <div
            key={value}
            className={[
              styles.ticket,
              value === 10 ? styles.ticket10 : '',
              value === 15 ? styles.ticket15 : '',
              value === 20 ? styles.ticket20 : '',
              selectedPrize === value ? styles.ticketWinner : '',
              isSpinning && selectedPrize === null ? styles.ticketWiggle : '',
            ].join(' ')}
          >
            {value}%
            <div className={`${styles.cutout} ${styles.cutoutTop}`}></div>
            <div className={`${styles.cutout} ${styles.cutoutBottom}`}></div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={`${styles.spinBtn} ${isSpinning ? styles.spinBtnSpinning : ''}`} onClick={handleSpin}>
          <span>Крутить</span>
          <div className={styles.spinBadge}>
            <span>1</span>
            <Gift size={16} fill="currentColor" />
          </div>
        </button>
      </div>
    </div>
  );
}
