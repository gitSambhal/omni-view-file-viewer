import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:opacity-95 active:opacity-90 font-medium",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:opacity-95 active:opacity-90",
        outline:
          "border border-border bg-card text-foreground shadow-2xs hover:bg-muted active:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground shadow-2xs hover:opacity-90 active:opacity-80",
        ghost: "hover:bg-muted text-foreground active:bg-accent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8.5 px-3.5 py-1.5 text-xs",
        sm: "h-7.5 rounded-lg px-2.5 text-xs",
        lg: "h-9.5 rounded-lg px-5 text-sm",
        icon: "h-8.5 w-8.5 rounded-lg",
        "icon-sm": "h-7 w-7 rounded-lg",
        "icon-xs": "h-6 w-6 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
