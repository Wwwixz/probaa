import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Header } from '../../widgets/header/Header';
import backIcon from '../../assets/icons/header/icon-back.svg';
import { logout } from '../../shared/api/auth';
import styles from './settings.module.css';

const THEME_KEY = 'tutu-theme';
const LANGUAGE_KEY = 'tutu-language';

type ThemeOption = 'light' | 'dark';
type LanguageOption = 'ru' | 'en';

const LANGUAGE_LABEL: Record<LanguageOption, string> = {
	ru: 'Русский',
	en: 'English',
};

export function SettingsScreen() {
	const [theme, setTheme] = useState<ThemeOption>('dark');
	const [language, setLanguage] = useState<LanguageOption>('ru');
	const [languageOpen, setLanguageOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	useEffect(() => {
		const storedTheme = window.localStorage.getItem(THEME_KEY);
		const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY);

		if (storedTheme === 'light' || storedTheme === 'dark') {
			setTheme(storedTheme);
			document.documentElement.dataset.theme = storedTheme;
		} else {
			document.documentElement.dataset.theme = 'dark';
		}

		if (storedLanguage === 'ru' || storedLanguage === 'en') {
			setLanguage(storedLanguage);
		}
	}, []);

	function selectTheme(next: ThemeOption) {
		setTheme(next);
		window.localStorage.setItem(THEME_KEY, next);
		document.documentElement.dataset.theme = next;
	}

	function selectLanguage(next: LanguageOption) {
		setLanguage(next);
		window.localStorage.setItem(LANGUAGE_KEY, next);
		setLanguageOpen(false);
	}

	async function switchAccount() {
		try {
			await logout();
		} finally {
			window.location.href = '/login';
		}
	}

	return (
		<div className={styles.page}>
			<div className={styles.blob} aria-hidden="true" />

			<div className={styles.topBar}>
				<Header />
			</div>

			<section className={styles.sheet}>
				<div className={styles.subHeader}>
					<button
						type="button"
						className={styles.backBtn}
						aria-label="Назад"
						onClick={() => window.history.back()}
					>
						<img src={backIcon.src} alt="" width={44} height={44} />
					</button>
					<h1 className={styles.title}>Настройки</h1>
				</div>

				<div className={styles.rows}>
					<a href="/profile" className={styles.rowLink}>
						<span>Профиль</span>
						<ChevronRight size={22} strokeWidth={2.4} aria-hidden="true" />
					</a>

					<div className={styles.block}>
						<p className={styles.blockLabel}>Тема</p>
						<div className={styles.themeRow} role="group" aria-label="Тема оформления">
							<button
								type="button"
								className={theme === 'light' ? styles.themeBtnActive : styles.themeBtnIdle}
								aria-pressed={theme === 'light'}
								onClick={() => selectTheme('light')}
							>
								Светлая
							</button>
							<button
								type="button"
								className={theme === 'dark' ? styles.themeBtnActive : styles.themeBtnIdle}
								aria-pressed={theme === 'dark'}
								onClick={() => selectTheme('dark')}
							>
								Темная
							</button>
						</div>
					</div>

					<div className={styles.block}>
						<p className={styles.blockLabel}>Техническая поддержка</p>
						<div className={styles.supportBox}>
							Почта: teh@44.com. Телефон: +********...
						</div>
					</div>

					<button type="button" className={styles.rowLink} onClick={() => setLanguageOpen(true)}>
						<span>Выбор языка</span>
						<ChevronRight size={22} strokeWidth={2.4} aria-hidden="true" />
					</button>
				</div>

				<div className={styles.actions}>
					<button type="button" className={styles.dangerBtn} onClick={() => setDeleteOpen(true)}>
						Удалить аккаунт
					</button>
					<button type="button" className={styles.textBtn} onClick={switchAccount}>
						Сменить аккаунт
					</button>
				</div>
			</section>

			{languageOpen && (
				<div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="language-title">
					<div className={styles.modal}>
						<h2 id="language-title" className={styles.modalTitle}>
							Выбор языка
						</h2>
						<button
							type="button"
							className={language === 'ru' ? styles.optionActive : styles.option}
							onClick={() => selectLanguage('ru')}
						>
							{LANGUAGE_LABEL.ru}
						</button>
						<button
							type="button"
							className={language === 'en' ? styles.optionActive : styles.option}
							onClick={() => selectLanguage('en')}
						>
							{LANGUAGE_LABEL.en}
						</button>
						<button type="button" className={styles.modalCancel} onClick={() => setLanguageOpen(false)}>
							Закрыть
						</button>
					</div>
				</div>
			)}

			{deleteOpen && (
				<div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="delete-title">
					<div className={styles.modal}>
						<h2 id="delete-title" className={styles.modalTitle}>
							Удалить аккаунт?
						</h2>
						<p className={styles.modalText}>Это действие нельзя отменить. Профиль и данные будут удалены.</p>
						<button type="button" className={styles.dangerBtn} onClick={() => setDeleteOpen(false)}>
							Удалить аккаунт
						</button>
						<button type="button" className={styles.modalCancel} onClick={() => setDeleteOpen(false)}>
							Отмена
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
