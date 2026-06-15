import { forwardRef } from 'react';
import { cn } from './Button';

export const Card = forwardRef(({ className, children, level = 1, ...props }, ref) => {
  
  // Tonal Layering Spec
  const levels = {
    1: 'border border-gray-200 shadow-level-1', // Base
    2: 'border border-primary shadow-level-2',  // Hover effect typically applied via parent group-hover
    3: 'border border-transparent shadow-level-3', // Modals
  };

  return (
    <div
      ref={ref}
      className={cn("bg-white rounded-lg overflow-hidden", levels[level], className)}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';
