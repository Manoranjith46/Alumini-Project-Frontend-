import React, { FC, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Back.module.css';

interface BackProps {
	to?: string | number;
	label?: string;
	className?: string;
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const Back: FC<BackProps> = ({ to, label = 'Back', className = '', onClick, }) => {
	const navigate = useNavigate();

	const handleBack = (event: MouseEvent<HTMLButtonElement>) => {
		if (onClick) {
			onClick(event);
		}

		if (event.defaultPrevented) {
			return;
		}

		if (typeof to === 'number') {
			navigate(to as any); // navigate accepts number, but typing might be strict
			return;
		}

		if (typeof to === 'string' && to.trim()) {
			navigate(to);
			return;
		}

		navigate(-1);
	};

	return (
		<button
			type="button"
			onClick={handleBack}
			className={`${styles.backButton} ${className}`.trim()}
			aria-label={label}
		>
			<span className="material-symbols-outlined" aria-hidden="true">
				arrow_back
			</span>
			<span>{label}</span>
		</button>
	);
};

export default Back;
