import { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
		<label htmlFor={inputId} className="input-field">
			{label && <span className="input-field__label">{label}</span>}
			<input
				id={inputId}
				type={inputType}
				className={`input-base ${className}`}
				{...rest}
			/>
		</label>
	);
}
