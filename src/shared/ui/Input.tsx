import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	isPassword?: boolean;
}

export function Input({
	label,
	isPassword = false,
	id,
	className = '',
	...rest
}: InputProps) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const inputType = rest.type ?? (isPassword ? 'password' : 'text');

	return (
		<label htmlFor={inputId} className={styles.inputField}>
			{label && <span className={styles.inputFieldLabel}>{label}</span>}
			<input
				id={inputId}
				type={inputType}
				className={`${styles.inputBase} ${className}`}
				{...rest}
			/>
		</label>
	);
}
