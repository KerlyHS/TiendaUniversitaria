import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  children,
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-soft';
  
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-dark',
    secondary: 'bg-secondary text-white hover:bg-secondary-light',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-secondary',
    ghost: 'bg-transparent hover:bg-gray-100 text-secondary',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm min-w-[44px]',
    md: 'h-11 px-4 text-base min-w-[44px]', // 44px min for WCAG
    lg: 'h-12 px-6 text-lg min-w-[44px]',
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
});
Button.displayName = 'Button';
