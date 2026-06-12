import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-600 text-white hover:bg-primary-700 hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(37,99,235,.25)]",
        secondary:
          "bg-white text-ink border border-border hover:bg-surface-section hover:border-border-strong",
        outline:
          "bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50",
        ghost: "bg-transparent text-ink hover:bg-surface-section",
        whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-dark",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px] rounded-sm",
        md: "h-12 px-5 text-[15px]",
        lg: "h-14 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
