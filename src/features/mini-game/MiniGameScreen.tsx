import { useState, useEffect } from 'react';
import { ChevronLeft, Gift, HelpCircle, Settings, Search, Camera, Bell, Mail } from 'lucide-react';
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
        
        // Оценочная высота игровой зоны (в браузере мобильном около 600px)
        const containerHeight = window.innerHeight * 0.6; 
        const offset = - (targetIndex * 135) + (containerHeight / 2) - 60;
        
        setOffsetY(offset);

        setTimeout(() => {
            const finalDiscount = targetCard.text.includes('/') 
                ? targetCard.text.split('/')[1] 
                : targetCard.text;
            
            setWonDiscount(finalDiscount);
            setShowResult(true);
        }, 3200);
    };

    const handleClaim = () => {
        alert('Скидка успешно добавлена!');
        
        setShowResult(false);
        setIsPlaying(false);
        setGifts(1);
        
        initTracks();
    };

    return (
        <div className={styles.appContainer}>
            {/* Верхушка */}
            <div className={styles.topBar}>
                <div className={styles.iconBtn}><Settings size={20} /></div>
                <div className={styles.iconBtn}><Search size={20} /></div>
                <div className={styles.iconBtn}><Camera size={20} /></div>
                <div className={styles.iconBtn}><Bell size={20} /></div>
            </div>

            <div className={styles.navContainer}>
                <div className={styles.iconBtn} style={{ backgroundColor: '#6234EC' }} onClick={handleBack}>
                    <ChevronLeft size={24} />
                </div>
                <div className={styles.giftBadge}>
                    <span>{gifts}</span>
                    <Gift size={18} fill="currentColor" />
                </div>
                <div className={styles.actionBtns}>
                    <div className={styles.actionBtn}><Mail size={20} /></div>
                    <div className={styles.actionBtn}><HelpCircle size={20} /></div>
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
                            className={`${styles.trackCard} ${styles[track.className]} ${index % 2 !== 0 ? styles.trackCardEven : ''}`}
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
                    <span>{gifts}</span>
                    <Gift size={18} fill="currentColor" />
                </div>
            </div>

            {/* Экран выигрыша */}
            <div className={`${styles.resultScreen} ${showResult ? styles.resultScreenVisible : ''}`}>
                <div className={styles.stars}>
                    <div className={styles.star} style={{ top: '20%', left: '15%' }}>★</div>
                    <div className={styles.star} style={{ top: '15%', right: '20%', animationDelay: '0.3s' }}>★</div>
                    <div className={styles.star} style={{ top: '60%', left: '10%', animationDelay: '0.6s' }}>★</div>
                    <div className={styles.star} style={{ top: '70%', right: '15%', animationDelay: '0.9s' }}>★</div>
                </div>
                
                <h2 className={styles.resultText}>Поздравляем!</h2>
                
                {showResult && (
                    <div className={styles.resultCard}>
                        <div className={styles.resultDiscount}>{wonDiscount}</div>
                    </div>
                )}
                
                <p className={styles.resultText} style={{ fontSize: '16px', marginTop: '10px' }}>Вы выиграли скидку на покупку ТИТР</p>
                
                <button className={styles.claimBtn} onClick={handleClaim}>Круто!</button>
            </div>
        </div>
    );
}
