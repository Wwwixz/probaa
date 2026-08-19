import { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import styles from './mini-game.module.css';

const DISCOUNTS = ['10%', '15%', '20%'];
const CARD_CLASSES = ['card1', 'card2', 'card3'];

export function MiniGameScreen() {
    const [gifts, setGifts] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [wonDiscount, setWonDiscount] = useState('20%');
    const [offsetY, setOffsetY] = useState(20);
    const [useTransition, setUseTransition] = useState(false);
    
    // Предварительно сгенерированные треки
    const [tracks, setTracks] = useState<{ id: number, text: string, className: string }[]>([]);

    useEffect(() => {
        initTracks();
    }, []);

    const initTracks = () => {
        const newTracks = [];
        for (let i = 0; i < 30; i++) {
            const discount = DISCOUNTS[Math.floor(Math.random() * DISCOUNTS.length)];
            const cardClass = CARD_CLASSES[i % CARD_CLASSES.length];
            
            let content = discount;
            if (i === 0) content = '10%';
            if (i === 1) content = '15%';
            if (i === 2) content = '20%';

            newTracks.push({
                id: i,
                text: content,
                className: cardClass
            });
        }
        setTracks(newTracks);
        setUseTransition(false);
        setOffsetY(20);
    };

    const handleBack = () => {
        window.history.back();
    };

    const startGame = () => {
        if (gifts <= 0 || isPlaying) return;

        setGifts(0);
        setIsPlaying(true);
        setUseTransition(true);

        const targetIndex = 20 + Math.floor(Math.random() * 5);
        const targetCard = tracks[targetIndex];
        
        // Оценочная высота игровой зоны
        const containerHeight = window.innerHeight > 0 ? window.innerHeight : 852;
        const offset = - (targetIndex * 150) + (containerHeight / 2) - 65;
        
        setOffsetY(offset);

        setTimeout(() => {
            const finalDiscount = targetCard.text;
            
            setWonDiscount(finalDiscount);
            setShowResult(true);
        }, 3200);
    };

    const handleClaim = () => {
        setShowResult(false);
        setIsPlaying(false);
        setGifts(1);
        
        initTracks();
        
        // Маленькая задержка для включения транзишена
        setTimeout(() => {
            setUseTransition(true);
        }, 50);
    };

    return (
        <div className={styles.appContainer}>
            {/* Навигационная панель (Фиолетовый фон) */}
            <div className={styles.navContainer}>
                <div className={styles.backBtn} onClick={handleBack}>‹</div>
                <div className={styles.giftBadge}>
                    <span>{gifts}</span> 🎁
                </div>
                <div className={styles.actionBtns}>
                    <div className={styles.actionBtn}>✉</div>
                    <div className={styles.actionBtn}>?</div>
                </div>
            </div>

            {/* Игровая зона */}
            <div className={styles.gameArea}>
                <div className={`${styles.navArrows} ${isPlaying ? styles.navArrowsVisible : ''}`}>
                    <div className={`${styles.arrow} ${styles.arrowLeft}`}></div>
                    <div className={`${styles.arrow} ${styles.arrowRight}`}></div>
                </div>
                
                <div 
                    className={styles.trackContainer} 
                    style={{ 
                        transform: `translateY(${offsetY}px)`,
                        transition: useTransition ? 'transform 3s cubic-bezier(0.1, 0.7, 0.1, 1)' : 'none'
                    }}
                >
                    {tracks.map((track, index) => (
                        <div 
                            key={track.id} 
                            className={`${styles.trackCard} ${styles[track.className]} ${index % 2 !== 0 ? styles.trackCardEven : styles.trackCardOdd}`}
                        >
                            {track.text}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.bottomBar}>
                <button 
                    className={`${styles.buyBtn} ${isPlaying ? styles.buyBtnDisabled : ''}`} 
                    onClick={startGame}
                    disabled={isPlaying || gifts === 0}
                >
                    Купи ТИТР
                </button>
                <div className={styles.giftStatus}>
                    <span>{gifts}</span> 🎁
                </div>
            </div>

            {/* Экран отображения результатов игры */}
            <div className={`${styles.resultScreen} ${showResult ? styles.resultScreenVisible : ''}`}>
                <div className={styles.resultBg}></div>
                
                <div className={styles.resultContent}>
                    <div className={styles.starburst}></div>
                    <div className={styles.resultCard}>
                        <div className={styles.resultDiscount}>{wonDiscount}</div>
                    </div>
                    
                    <p className={styles.resultText} style={{ marginTop: '10px' }}>
                        Поздравляем! Вы выиграли {wonDiscount} скидку на покупку следующих билетов
                    </p>
                    <p className={styles.resultText} style={{ fontSize: '14px', opacity: 0.8 }}>
                        Вы можете применить её в любое время до 31.12.2026
                    </p>
                    
                    <button className={styles.claimBtn} onClick={handleClaim}>
                        Крутить ещё раз
                        <div className={styles.giftBadge} style={{ backgroundColor: '#D0FF1A', padding: '5px 15px', fontSize: '16px', color: '#222222', boxShadow: 'none' }}>
                            0 🎁
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
