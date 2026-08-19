import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Header } from '../../widgets/header/Header';
import backIcon from '../../assets/icons/header/icon-back.svg';
import vkLogo from '../../assets/images/vk-logo.svg';
import okLogo from '../../assets/images/odnoklassniki-logo.svg';
import { getMe } from '../../shared/api/auth';
import styles from './profile.module.css';

export function ProfileScreen() {
	const [nickname, setNickname] = useState('Loisbecket@gmail.com');
	const [fullName, setFullName] = useState('Линк Е Рафулаева');
	const [password, setPassword] = useState('Linkirek24');
	const [email, setEmail] = useState('Linkirek24@yandex.ru');
	const [displayName, setDisplayName] = useState('Линк Е');
	const [editing, setEditing] = useState(false);

	useEffect(() => {
		getMe()
			.then(({ user }) => {
				if (user.email) {
					setEmail(user.email);
					setNickname(user.email);
				}
				if (user.displayName) {
					setFullName(user.displayName);
					setDisplayName(user.displayName);
				}
			})
			.catch(() => {
				/* Оставляем значения с макета, если сессия недоступна */
			});
	}, []);

	function handleSave(event?: FormEvent) {
		event?.preventDefault();
		const nextName = fullName.trim() || displayName;
		setDisplayName(nextName.split(' ').slice(0, 2).join(' ') || nextName);
		setEditing(false);
	}

	return (
		<div className={styles.page}>
			<Header />

			<form className={styles.content} onSubmit={handleSave}>
				<div className={styles.subHeader}>
					<button
						type="button"
						className={styles.backBtn}
						aria-label="Назад"
						onClick={() => window.history.back()}
					>
						<img src={backIcon.src} alt="" width={44} height={44} />
					</button>
					<h1 className={styles.title}>Профиль</h1>
					<div className={styles.subHeaderSpacer} aria-hidden="true" />
				</div>

				<div className={styles.hero}>
					<div className={styles.avatar} aria-hidden="true" />
					<p className={styles.username}>{displayName}</p>
				</div>

				<label className={styles.field}>
					<span>Никнейм</span>
					<input
						type="text"
						value={nickname}
						onChange={(e) => setNickname(e.target.value)}
						disabled={!editing}
						autoComplete="username"
					/>
				</label>

				<label className={styles.field}>
					<span>ФИО</span>
					<input
						type="text"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						disabled={!editing}
						autoComplete="name"
					/>
				</label>

				<label className={styles.field}>
					<span>Пароль</span>
					<input
						type="text"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={!editing}
						autoComplete="current-password"
					/>
				</label>

				<label className={styles.field}>
					<span>Почта</span>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={!editing}
						autoComplete="email"
					/>
				</label>

				<div className={styles.socialSection}>
					<span className={styles.socialLabel}>Привязанные аккаунты</span>
					<div className={styles.socialButtons}>
						<button type="button" className={styles.socialBtn} aria-label="ВКонтакте">
							<img src={vkLogo.src} alt="" width={28} height={28} />
						</button>
						<button type="button" className={styles.socialBtn} aria-label="Одноклассники">
							<img src={okLogo.src} alt="" width={28} height={28} />
						</button>
					</div>
				</div>

				<button
					type="button"
					className={styles.primaryBtn}
					onClick={() => setEditing(true)}
				>
					Изменить профиль
				</button>

				<button type="submit" className={styles.textBtn}>
					Сохранить изменения
				</button>
			</form>
		</div>
	);
}
