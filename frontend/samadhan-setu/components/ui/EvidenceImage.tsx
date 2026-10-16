"use client";

import { useState } from "react";
import { getEvidenceUrl } from "@/lib/api";

interface EvidenceImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  domainId?: string;
  fallbackIcon?: string;
}

export function EvidenceImage({
  src,
  alt = "Civic evidence photo",
  className = "h-full w-full object-cover",
  domainId,
  fallbackIcon
}: EvidenceImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = getEvidenceUrl(src);

  const getDomainIcon = () => {
    if (fallbackIcon) return fallbackIcon;
    if (!domainId) return "📸";
    const d = domainId.toLowerCase();
    if (d.includes("road")) return "🚧";
    if (d.includes("water")) return "💧";
    if (d.includes("light") || d.includes("electric")) return "💡";
    if (d.includes("waste")) return "🗑️";
    return "🏛️";
  };

  if (!resolvedUrl || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 select-none ${className}`}
        title={alt}
      >
        <span className="text-xl sm:text-2xl drop-shadow-xs">{getDomainIcon()}</span>
        <span className="mt-1 text-[10px] font-medium tracking-tight text-slate-500 uppercase">
          Evidence
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
