import React, { type ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'text' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    children, 
    className = '',
    disabled,
    ...props 
}) => {
    return (
        <button 
            className={`btn btn-${variant} btn-${size} ${className}`} 
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <span className="spinner"></span> : children}
        </button>
    );
};

export default Button;
