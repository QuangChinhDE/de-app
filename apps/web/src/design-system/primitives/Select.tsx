import { forwardRef, type SelectHTMLAttributes } from "react";
import classNames from "classnames";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  fullWidth?: boolean;
}

/**
 * Base Select component - extracted from SchemaForm.tsx
 * Preserves all TailwindCSS classes for consistent styling
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, fullWidth = true, className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={classNames(
          "rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none",
          {
            "w-full": fullWidth,
            "border-ink-200 focus:border-indigo-400": !error,
            "border-rose-500 focus:border-rose-600": error,
          },
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
