import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'social';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	icon?: ReactNode;
}

export function Button({
	variant = 'primary',
	icon,
	children,
	className = '',
	...rest
}: ButtonProps) {
	const variantClass = variant === 'primary' ? styles.btnPrimary : styles.btnSocial;

	return (
		<button className={`${styles.btnBase} ${variantClass} ${className}`} {...rest}>
			{icon}
			{children}
		</button>
	);
}
