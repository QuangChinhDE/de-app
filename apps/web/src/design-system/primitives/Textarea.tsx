import { forwardRef, type TextareaHTMLAttributes } from "react";
import classNames from "classnames";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  fullWidth?: boolean;
}

/**
 * Base Textarea component - extracted from SchemaForm.tsx
 * Preserves all TailwindCSS classes for consistent styling
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, fullWidth = true, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={classNames(
          "rounded-md border px-3 py-2 font-mono text-sm shadow-sm focus:outline-none",
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

Textarea.displayName = "Textarea";
