import { useState } from 'react';
import type { FormEvent } from 'react';
import vkLogo from '../../assets/images/vk-logo.svg';
import odnoklassnikiLogo from '../../assets/images/odnoklassniki-logo.svg';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import styles from './auth-form.module.css';

/**
 * Форма регистрации — отдельного макета не было, собрана по аналогии
 * с LoginForm (та же карточка, поля, кнопка), чтобы визуально не
 * выбивалась из остальных экранов авторизации.
 */
export function RegisterForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (password !== confirmPassword) {
			setError('Пароли не совпадают');
			return;
		}

		setError(null);
		// TODO: подключить реальную регистрацию, когда будет бэкенд/MSW-мок
		console.log({ email, password });
	}

	return (
		<form onSubmit={handleSubmit} className={styles.loginForm}>
			<div className="flex flex-col items-center gap-1">
				<h1 className={styles.loginFormTitle}>
					Регистрация в <span className={styles.loginFormAccent}>TUTU</span>
				</h1>
				<div className={styles.loginFormLinks}>
					<span>Уже есть аккаунт?</span>
					<a href="/login">Войти</a>
				</div>
			</div>

			<div className={styles.loginFormField}>
				<label htmlFor="reg-email">Почта</label>
				<Input
					id="reg-email"
					type="email"
					placeholder="Loisbecket@gmail.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className={styles.loginFormInput}
				/>
			</div>

			<div className={styles.loginFormField}>
				<label htmlFor="reg-password">Пароль</label>
				<div className="relative">
					<Input
						id="reg-password"
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

			<div className={styles.loginFormField}>
				<label htmlFor="reg-confirm-password">Повторите пароль</label>
				<div className="relative">
					<Input
						id="reg-confirm-password"
						type={showConfirmPassword ? 'text' : 'password'}
						placeholder="********"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						className={`${styles.loginFormInput} pr-10`}
					/>
					<button
						type="button"
						onClick={() => setShowConfirmPassword((prev) => !prev)}
						className={`${styles.passwordToggle} ${showConfirmPassword ? styles.passwordToggleShown : styles.passwordToggleHidden}`}
						aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
					/>
				</div>
			</div>

			{error && <p className={styles.formError}>{error}</p>}

			<Button type="submit" variant="primary">
				Зарегистрироваться
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
