import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, type = "text", id, ...props }, ref) => {
    const inputId = id || React.useId();
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-medium text-dark transition-all duration-200 outline-none focus:bg-white placeholder:text-gray-400 ${
            error 
              ? 'border-error-rt focus:border-error-rt focus:ring-1 focus:ring-error-rt/20' 
              : 'border-neutral-gray focus:border-primary focus:ring-1 focus:ring-primary/10'
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-error-rt font-semibold animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-gray-400 font-medium">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input"

export { Input }
