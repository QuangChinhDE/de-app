import { forwardRef, type InputHTMLAttributes } from "react";
import classNames from "classnames";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

/**
 * Base Checkbox component - extracted from SchemaForm.tsx
 * Preserves all TailwindCSS classes for consistent styling
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    const checkbox = (
      <input
        ref={ref}
        type="checkbox"
        className={classNames(
          "h-4 w-4 rounded border-ink-300 text-indigo-600",
          className
        )}
        {...props}
      />
    );

    if (!label) {
      return checkbox;
    }

    return (
      <label className="inline-flex items-center gap-2 text-sm text-ink-600">
        {checkbox}
        <span>{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
