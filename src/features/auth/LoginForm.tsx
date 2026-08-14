import { useState } from 'react';
import type { FormEvent } from 'react';
import vkLogo from '../../assets/images/vk-logo.svg';
import odnoklassnikiLogo from '../../assets/images/odnoklassniki-logo.svg';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';

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
		<form onSubmit={handleSubmit} className="login-form">
			<div className="flex flex-col items-center gap-1">
				<h1 className="login-form__title">
					Войти через <span className="login-form__title-accent">TUTU</span>
				</h1>
				<div className="login-form__links">
					<a href="#">Нет аккаунта?</a>
					<a href="#">Зарегистрироваться</a>
				</div>
			</div>

			<div className="login-form__field">
				<label htmlFor="email">Почта</label>
				<Input
					id="email"
					type="email"
					placeholder="Loisbecket@gmail.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="login-form__input"
				/>
			</div>

			<div className="login-form__field">
				<label htmlFor="password">Пароль</label>
				<div className="relative">
					<Input
						id="password"
						type={showPassword ? 'text' : 'password'}
						placeholder="********"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="login-form__input pr-10"
					/>
					<button
						type="button"
						onClick={() => setShowPassword((prev) => !prev)}
						className={`password-toggle ${showPassword ? 'password-toggle--shown' : 'password-toggle--hidden'}`}
						aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
					/>
				</div>
			</div>

			<div className="login-form__meta">
				<label className="login-form__remember">
					<input
						type="checkbox"
						checked={rememberMe}
						onChange={(e) => setRememberMe(e.target.checked)}
						className="login-form__checkbox"
					/>
					Запомнить меня
				</label>
				<a href="/login/forgot" className="login-form__link">
					Забыли пароль ?
				</a>
			</div>

			<Button type="submit" variant="primary" className="login-form__button login-form__button--primary">
				Войти
			</Button>

			<div className="login-form__divider">Или</div>

			<Button
				type="button"
				variant="social"
				className="login-form__button login-form__button--social"
				icon={<img src={vkLogo.src} alt="VK" className="login-form__social-icon login-form__social-icon--vk" />}
			>
				Продолжить в VK
			</Button>

			<Button
				type="button"
				variant="social"
				className="login-form__button login-form__button--social"
				icon={<img src={odnoklassnikiLogo.src} alt="Одноклассники" className="login-form__social-icon login-form__social-icon--ok" />}
			>
				Продолжить в Одноклассниках
			</Button>
		</form>
	);
}
