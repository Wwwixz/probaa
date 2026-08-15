import { useState } from 'react';
import type { FormEvent } from 'react';
import vkLogo from '../../assets/images/vk-logo.svg';
import odnoklassnikiLogo from '../../assets/images/odnoklassniki-logo.svg';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import styles from './auth-form.module.css';

/**
 * Форма "Войти через TUTU" — верстка по макету, пока без реальной
 * отправки на бэкенд (заглушка onSubmit).
 */
export function LoginForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		// TODO: подключить реальный запрос, когда будет бэкенд/MSW-мок
		console.log({ email, password, rememberMe });
	}

	return (
		<form onSubmit={handleSubmit} className={styles.loginForm}>
			<div className="flex flex-col items-center gap-1">
				<h1 className={styles.loginFormTitle}>
					Войти через <span className={styles.loginFormAccent}>TUTU</span>
				</h1>
				<div className={styles.loginFormLinks}>
					<a href="#">Нет аккаунта?</a>
					<a href="#">Зарегистрироваться</a>
				</div>
			</div>

			<div className={styles.loginFormField}>
				<label htmlFor="email">Почта</label>
				<Input
					id="email"
					type="email"
					placeholder="Loisbecket@gmail.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className={styles.loginFormInput}
				/>
			</div>

			<div className={styles.loginFormField}>
				<label htmlFor="password">Пароль</label>
				<div className="relative">
					<Input
						id="password"
						type={showPassword ? 'text' : 'password'}
						placeholder="********"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className={`${styles.loginFormInput} pr-10`}
					/>
					<button
						type="button"
						onClick={() => setShowPassword((prev) => !prev)}
						className={`${styles.passwordToggle} ${showPassword ? styles.passwordToggleShown : styles.passwordToggleHidden}`}
						aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
					/>
				</div>
			</div>

			<div className={styles.loginFormMeta}>
				<label className={styles.loginFormRemember}>
					<input
						type="checkbox"
						checked={rememberMe}
						onChange={(e) => setRememberMe(e.target.checked)}
						className={styles.loginFormCheckbox}
					/>
					Запомнить меня
				</label>
				<a href="/forgotPassword" className={styles.loginFormLink}>
					Забыли пароль ?
				</a>
			</div>

			<Button type="submit" variant="primary">
				Войти
			</Button>

			<div className={styles.loginFormDivider}>Или</div>

			<Button
				type="button"
				variant="social"
				icon={<img src={vkLogo.src} alt="VK" className="h-5 w-5" />}
			>
				Продолжить в VK
			</Button>

			<Button
				type="button"
				variant="social"
				icon={<img src={odnoklassnikiLogo.src} alt="Одноклассники" className="h-5 w-5" />}
			>
				Продолжить в Одноклассниках
			</Button>
		</form>
	);
}
