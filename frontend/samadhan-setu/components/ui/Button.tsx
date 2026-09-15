import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-civic text-white hover:bg-civic-hover shadow-sm hover:shadow active:scale-[0.99] disabled:bg-civic/40 disabled:shadow-none",
  secondary:
    "bg-paper-raised text-ink border border-paper-line hover:border-slate-300 hover:bg-paper-subtle active:scale-[0.99] shadow-sm disabled:opacity-50",
  ghost:
    "bg-transparent text-ink-soft hover:text-ink hover:bg-paper-subtle active:scale-[0.99]",
  danger:
    "bg-brick text-white hover:bg-red-700 shadow-sm hover:shadow active:scale-[0.99] disabled:bg-brick/40",
  success:
    "bg-verified text-white hover:bg-emerald-700 shadow-sm hover:shadow active:scale-[0.99] disabled:bg-verified/40"
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", fullWidth, className = "", children, ...rest }, ref) => (
    <button
      ref={ref}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold",
        "transition-all duration-150 disabled:cursor-not-allowed",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic",
        fullWidth ? "w-full" : "",
        variantClasses[variant],
        className
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
