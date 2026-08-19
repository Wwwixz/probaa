import { ChevronLeft, Gift, Package, HelpCircle } from 'lucide-react';
import styles from './mini-game.module.css';

export function MiniGameScreen() {
  const handleBack = () => {
    window.history.back();
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
        <div className={`${styles.ticket} ${styles.ticket10}`}>
          10%
          <div className={`${styles.cutout} ${styles.cutoutTop}`}></div>
          <div className={`${styles.cutout} ${styles.cutoutBottom}`}></div>
        </div>
        <div className={`${styles.ticket} ${styles.ticket15}`}>
          15%
          <div className={`${styles.cutout} ${styles.cutoutTop}`}></div>
          <div className={`${styles.cutout} ${styles.cutoutBottom}`}></div>
        </div>
        <div className={`${styles.ticket} ${styles.ticket20}`}>
          20%
          <div className={`${styles.cutout} ${styles.cutoutTop}`}></div>
          <div className={`${styles.cutout} ${styles.cutoutBottom}`}></div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.spinBtn}>
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
