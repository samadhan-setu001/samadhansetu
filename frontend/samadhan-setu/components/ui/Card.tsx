import { HTMLAttributes } from "react";

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-paper-line bg-paper-raised shadow-card transition-all ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
