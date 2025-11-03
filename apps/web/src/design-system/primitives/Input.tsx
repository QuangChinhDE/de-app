import { forwardRef, type InputHTMLAttributes } from "react";
import classNames from "classnames";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  fullWidth?: boolean;
}

/**
 * Base Input component - extracted from SchemaForm.tsx
 * Preserves all TailwindCSS classes for consistent styling
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, fullWidth = true, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={classNames(
          "rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none",
          {
            "w-full": fullWidth,
            "border-ink-200 focus:border-indigo-400": !error,
            "border-rose-500 focus:border-rose-600": error,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
