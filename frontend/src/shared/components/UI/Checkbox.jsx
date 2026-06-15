import { forwardRef } from 'react';
import { cn } from './Button';

export const Checkbox = forwardRef(({ className, label, description, error, ...props }, ref) => {
  return (
    <div className="relative flex items-start">
      <div className="flex h-6 items-center">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "h-4 w-4 min-w-[16px] min-h-[16px] rounded border-gray-300 text-primary focus:ring-secondary focus:ring-offset-2",
            error && "border-danger",
            className
          )}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm leading-6">
        {label && (
          <label className="font-medium text-secondary">
            {label}
          </label>
        )}
        {description && (
          <p className="text-gray-500">{description}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-danger">{error}</p>
        )}
      </div>
    </div>
  );
});
Checkbox.displayName = 'Checkbox';
