
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-mps-primary/30 disabled:opacity-50 disabled:pointer-events-none";
  
  const variantStyles = {
    primary: "bg-mps-primary text-white hover:bg-mps-primary/90",
    secondary: "bg-white text-mps-primary border border-mps-primary hover:bg-mps-secondary/50",
    ghost: "bg-transparent text-mps-primary hover:bg-mps-secondary/30"
  };
  
  const sizeStyles = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-5 py-2.5",
    lg: "text-lg px-6 py-3"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
