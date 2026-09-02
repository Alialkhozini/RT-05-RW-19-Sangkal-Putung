import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95";
    
    const variants = {
      primary: "bg-primary hover:bg-primary-hover text-white shadow-md hover:shadow-lg",
      secondary: "bg-dark hover:bg-gray-800 text-white shadow-md hover:shadow-lg",
      outline: "bg-transparent border border-neutral-gray text-gray-700 hover:bg-neutral-bg",
      danger: "bg-error-rt hover:bg-red-700 text-white shadow-md hover:shadow-lg",
      success: "bg-success-rt hover:bg-green-700 text-white shadow-md hover:shadow-lg",
      ghost: "bg-transparent hover:bg-neutral-bg text-gray-600 hover:text-primary",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 rounded-lg",
      md: "text-sm px-5 py-2.5 rounded-xl",
      lg: "text-base px-6 py-3.5 rounded-2xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2.5 h-4.5 w-4.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button"

export { Button }
