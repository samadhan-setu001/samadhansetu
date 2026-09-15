import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  tagline?: string;
  className?: string;
}

export function Logo({
  size = "md",
  showWordmark = true,
  tagline,
  className = ""
}: LogoProps) {
  const iconDimensions = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }[size];

  const titleSizes = {
    sm: "text-base tracking-tight",
    md: "text-xl tracking-tight",
    lg: "text-2xl tracking-tight",
    xl: "text-3xl tracking-tight"
  }[size];

  if (!showWordmark) {
    return (
      <div className={`relative flex-shrink-0 ${iconDimensions} ${className}`}>
        <img
          src="/logo-icon.png"
          alt="Samadhan Setu"
          className="w-full h-full object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex-shrink-0 ${iconDimensions}`}>
        <img
          src="/logo-icon.png"
          alt="Samadhan Setu"
          className="w-full h-full object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105"
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`font-sans font-bold text-slate-900 ${titleSizes}`}>
          Samadhan <span className="text-blue-600">Setu</span>
        </span>
        {tagline && (
          <span className="text-[11px] font-medium tracking-wide text-slate-500">
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
