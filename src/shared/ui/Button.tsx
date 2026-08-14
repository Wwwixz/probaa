import type { ButtonHTMLAttributes, ReactNode } from 'react';

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
	const base = 'btn-base';
	const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-social';

	return (
		<button className={`${base} ${variantClass} ${className}`} {...rest}>
			{icon}
			{children}
		</button>
	);
}
