"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  OFFICER_REPUTATION_ADDRESS,
  getExplorerAddressUrl
} from "@/lib/blockchain";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  officerName?: string;
  officerId?: string;
  domain?: string;
  score?: number | string;
  contractAddress?: string;
  txHash?: string | null;
}

export function BlockchainVerificationModal({
  isOpen,
  onClose,
  officerName = "Field Officer",
  officerId = "OFF-1001",
  domain = "Municipal Department",
  score = "85",
  contractAddress = OFFICER_REPUTATION_ADDRESS,
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const explorerUrl = getExplorerAddressUrl(contractAddress, "events");

  useEffect(() => {
    if (isOpen && explorerUrl) {
      QRCode.toDataURL(explorerUrl, {
        width: 220,
        margin: 1.5,
        color: {
          dark: "#1e1b4b",
          light: "#ffffff"
        }
      })
        .then(setQrDataUrl)
        .catch((err) => console.error("QR Code generation error:", err));
    }
  }, [isOpen, explorerUrl]);

  if (!isOpen) return null;

  const copyAddress = () => {
    if (contractAddress) {
      navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <Card className="relative w-full max-w-md overflow-hidden p-6 shadow-2xl border-purple-200 bg-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-ink-muted hover:bg-paper-subtle hover:text-ink transition-colors"
          title="Close Modal"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800 text-lg font-bold">
            ⛓️
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">
              On-Chain Officer Verification
            </h2>
            <p className="text-xs text-ink-soft">
              Polygon Amoy Testnet · Public Ledger
            </p>
          </div>
        </div>

        {/* Officer Summary Pill */}
        <div className="rounded-xl bg-purple-50/60 border border-purple-100 p-3 mb-4 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-ink text-sm">{officerName}</div>
            <div className="text-ink-soft font-mono text-[11px]">
              Badge: <span className="font-semibold text-officer">{officerId}</span> · {domain}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Score</div>
            <div className="text-base font-black text-purple-900">{score}%</div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-paper-subtle rounded-xl border border-paper-line mb-4">
          <div className="relative p-2 bg-white rounded-lg shadow-xs border border-purple-100">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code to verify ${officerName} on Polygonscan`}
                className="h-44 w-44 rounded"
              />
            ) : (
              <div className="h-44 w-44 flex items-center justify-center text-xs text-ink-muted animate-pulse">
                Generating QR code…
              </div>
            )}
          </div>
          <p className="mt-2.5 text-[11px] font-medium text-ink-soft text-center flex items-center gap-1">
            <span>📷</span> Scan with any mobile camera to view on Polygonscan
          </p>
        </div>

        {/* Contract Address Box */}
        <div className="mb-4 rounded-lg bg-paper p-2.5 border border-paper-line text-xs">
          <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1">
            <span>Smart Contract Address (OfficerReputation):</span>
            <button
              onClick={copyAddress}
              className="font-semibold text-purple-700 hover:text-purple-900"
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <p className="font-mono text-[11px] text-ink break-all select-all font-medium">
            {contractAddress}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <span>Open in Polygonscan Explorer</span>
            <span>↗</span>
          </a>
          <Button variant="secondary" onClick={onClose} className="px-4">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}