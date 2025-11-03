import { forwardRef, type ButtonHTMLAttributes } from "react";
import classNames from "classnames";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

/**
 * Base Button component - extracted from SchemaForm.tsx
 * Preserves all TailwindCSS classes for consistent styling
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth = false, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={classNames(
          "rounded-md font-semibold shadow-sm transition-colors focus:outline-none disabled:cursor-not-allowed",
          {
            // Variants
            "bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-ink-300":
              variant === "primary",
            "border border-ink-200 bg-white text-ink-700 hover:bg-ink-100":
              variant === "secondary",
            "bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-300":
              variant === "danger",
            "text-ink-600 hover:bg-ink-100": variant === "ghost",
            
            // Sizes
            "px-3 py-1 text-xs": size === "sm",
            "px-4 py-1.5 text-sm": size === "md",
            "px-6 py-2 text-base": size === "lg",
            
            // Width
            "w-full": fullWidth,
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
