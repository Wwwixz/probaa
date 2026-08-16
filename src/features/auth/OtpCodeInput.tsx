import { useRef } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import styles from './auth-form.module.css';

const CODE_LENGTH = 4;

interface OtpCodeInputProps {
	value: string[];
	onChange: (value: string[]) => void;
}

/**
 * 4 отдельные ячейки под код подтверждения, с автопереходом на
 * следующее поле при вводе цифры и на предыдущее по Backspace на
 * пустой ячейке.
 */
export function OtpCodeInput({ value, onChange }: OtpCodeInputProps) {
	const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

	function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
		const digit = event.target.value.replace(/\D/g, '').slice(-1);
		const next = [...value];
		next[index] = digit;
		onChange(next);

		if (digit && index < CODE_LENGTH - 1) {
			inputsRef.current[index + 1]?.focus();
		}
	}

	function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'Backspace' && !value[index] && index > 0) {
			inputsRef.current[index - 1]?.focus();
		}
	}

	return (
		<div className={styles.otpRow}>
			{Array.from({ length: CODE_LENGTH }).map((_, index) => (
				<input
					key={index}
					ref={(el) => {
						inputsRef.current[index] = el;
					}}
					type="text"
					inputMode="numeric"
					maxLength={1}
					value={value[index] ?? ''}
					onChange={(e) => handleChange(index, e)}
					onKeyDown={(e) => handleKeyDown(index, e)}
					className={styles.otpCell}
				/>
			))}
		</div>
	);
}
