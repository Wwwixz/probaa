import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import styles from './auth-form.module.css';

/**
 * Шаг 1 восстановления пароля — ввод email, на который отправится код.
 * Переиспользует карточку auth-form.module.css (тот же дизайн, что и
 * на экране входа).
 */
export function ForgotPasswordForm() {
	const [email, setEmail] = useState('');

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		// TODO: подключить реальную отправку кода, когда будет бэкенд/MSW-мок
		console.log({ email });
		window.location.href = '/verifyCode';
	}

	return (
		<form onSubmit={handleSubmit} className={styles.loginForm}>
			<div className="flex flex-col items-center gap-1">
				<h1 className={`${styles.loginFormTitle} ${styles.loginFormAccent}`}>
					Забыли пароль?
				</h1>
			</div>

			<div className={styles.loginFormField}>
				<label htmlFor="email">Почта</label>
				<Input
					id="email"
					type="email"
					placeholder="введите вашу почту"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className={styles.loginFormInput}
				/>
			</div>

			<Button type="submit" variant="primary">
				Далее
			</Button>
		</form>
	);
}
