import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, hint, className = "", id, ...rest }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={[
          "rounded-lg border border-paper-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink",
          "placeholder:text-ink-muted transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-civic/20 focus:border-civic",
          className
        ].join(" ")}
        {...rest}
      />
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function TextArea({ label, hint, className = "", id, ...rest }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={[
          "rounded-lg border border-paper-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink",
          "placeholder:text-ink-muted min-h-[100px] transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-civic/20 focus:border-civic",
          className
        ].join(" ")}
        {...rest}
      />
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
