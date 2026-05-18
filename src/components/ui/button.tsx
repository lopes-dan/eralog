import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-ember-500 text-white hover:bg-ember-400 shadow-lg shadow-ember-500/20',
        ghost: 'bg-transparent hover:bg-ink-800 text-ink-300 hover:text-ink-100',
        outline: 'border border-ink-700 bg-transparent hover:bg-ink-800 text-ink-300 hover:text-ink-100',
        secondary: 'bg-ink-800 text-ink-200 hover:bg-ink-700',
        destructive: 'bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-600/20',
        gold: 'bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 border border-gold-500/20',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
