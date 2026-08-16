import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../shared/ui/Button';
import { OtpCodeInput } from './OtpCodeInput';
import styles from './auth-form.module.css';

const CODE_LENGTH = 4;
const RESEND_TIMEOUT_SECONDS = 60;

function formatTime(totalSeconds: number) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Шаг 2 восстановления пароля — ввод OTP-кода из письма.
 * Пока код "истекает" (secondsLeft > 0), вместо кнопки повтора
 * показывается таймер. Когда время вышло — можно запросить код заново,
 * что перезапускает отсчёт.
 */
export function OtpCodeForm() {
	const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
	const [secondsLeft, setSecondsLeft] = useState(RESEND_TIMEOUT_SECONDS);

	useEffect(() => {
		if (secondsLeft <= 0) return;

		const timer = setInterval(() => {
			setSecondsLeft((prev) => Math.max(prev - 1, 0));
		}, 1000);

		return () => clearInterval(timer);
	}, [secondsLeft]);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		// TODO: подключить реальную проверку кода, когда будет бэкенд/MSW-мок
		console.log({ code: code.join('') });
	}

	function handleResend() {
		// TODO: подключить реальный повторный запрос кода
		console.log('resend code');
		setCode(Array(CODE_LENGTH).fill(''));
		setSecondsLeft(RESEND_TIMEOUT_SECONDS);
	}

	return (
		<form onSubmit={handleSubmit} className={styles.loginForm}>
			<div className="flex flex-col items-center gap-1 text-center">
				<h1 className={`${styles.loginFormTitle} ${styles.loginFormAccent}`}>
					Забыли пароль?
				</h1>
				<p className={styles.otpSubtitle}>
					Код подтверждения был отправлен по указанному адресу
				</p>
			</div>

			<div className={styles.loginFormField}>
				<label>Код</label>
				<OtpCodeInput value={code} onChange={setCode} />
			</div>

			<Button type="submit" variant="primary">
				Далее
			</Button>

			<p className={styles.otpTimer}>
				{secondsLeft > 0 ? (
					<>
						Код истекает через: <span className={styles.loginFormAccent}>{formatTime(secondsLeft)}</span>
					</>
				) : (
					<button type="button" onClick={handleResend} className={styles.otpResendLink}>
						Отправить код ещё раз
					</button>
				)}
			</p>
		</form>
	);
}
