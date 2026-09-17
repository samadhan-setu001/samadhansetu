/**
 * ============================================================================
 * Privy Embedded Wallet & Digital Signatures Integration
 * ============================================================================
 * 
 * Provides:
 * 1. Embedded Ethereum wallet creation and retrieval for citizens.
 * 2. Automated background EIP-191 digital signatures for complaint submissions.
 * 3. Deterministic key derivation fallback for local/demo testing before
 *    NEXT_PUBLIC_PRIVY_APP_ID is configured by the user.
 * 
 * Environment Variables required:
 * - NEXT_PUBLIC_PRIVY_APP_ID: Privy App ID from https://dashboard.privy.io
 * - PRIVY_APP_SECRET: Privy App Secret (for server operations)
 */

import { ethers } from "ethers";
import { sha256Hex } from "./hash";

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
export const HAS_PRIVY = Boolean(PRIVY_APP_ID && PRIVY_APP_ID !== "your_privy_app_id_here");

export interface CitizenWalletSession {
  walletAddress: string;
  phone: string;
  isPrivyManaged: boolean;
}

/**
 * Derives a deterministic Ethereum wallet from a phone number.
 * Ensures repeat logins with the same phone number ALWAYS produce the exact same
 * Ethereum address (0x...) and private key, even when offline or before Privy keys are configured.
 */
export async function getDeterministicCitizenWallet(phone: string): Promise<{
  address: string;
  wallet: ethers.HDNodeWallet | ethers.Wallet;
}> {
  const cleanPhone = phone.replace(/\D/g, "") || "9999999999";
  // Generate a reproducible 32-byte private key seed from phone number + app salt
  const seedString = `vericity:citizen:salt:2026:${cleanPhone}`;
  const hexHash = await sha256Hex(seedString);
  const privateKey = `0x${hexHash}`;
  const wallet = new ethers.Wallet(privateKey);
  return {
    address: wallet.address,
    wallet,
  };
}

/**
 * Formats a complaint submission into a canonical message string for digital signing.
 */
export function formatComplaintSigningMessage(data: {
  domainId: string;
  description?: string | null;
  lat: number;
  long: number;
  timestamp: string;
}): string {
  return [
    "--- VERICITY OFFICIAL CIVIC REPORT ---",
    `Domain: ${data.domainId}`,
    `Description: ${data.description || "N/A"}`,
    `Location: ${data.lat.toFixed(6)}, ${data.long.toFixed(6)}`,
    `Timestamp: ${data.timestamp}`,
    "--------------------------------------",
    "By signing, I verify this civic complaint is accurate and in the public interest."
  ].join("\n");
}

/**
 * Automatically signs a complaint in the background using the citizen's wallet.
 * If a Privy embedded wallet signer is passed, it uses Privy's signing provider.
 * Otherwise, it signs using the deterministic wallet derived from the citizen's authenticated phone.
 */
export async function signComplaintSubmission(
  complaintData: {
    domainId: string;
    description?: string | null;
    lat: number;
    long: number;
    timestamp: string;
  },
  privySigner?: { signMessage: (msg: string) => Promise<string>; address: string } | null,
  citizenPhone?: string
): Promise<{ signature: string; signerAddress: string; message: string }> {
  const message = formatComplaintSigningMessage(complaintData);

  // 1. If Privy signer is provided from Privy embedded wallet
  if (privySigner && privySigner.signMessage) {
    try {
      const signature = await privySigner.signMessage(message);
      return {
        signature,
        signerAddress: privySigner.address,
        message,
      };
    } catch (err) {
      console.warn("[Privy] Signer failed, falling back to deterministic key:", err);
    }
  }

  // 2. Deterministic wallet signing fallback (seamless background signing)
  const phone = citizenPhone || "9999999999";
  const { wallet, address } = await getDeterministicCitizenWallet(phone);
  const signature = await wallet.signMessage(message);

  return {
    signature,
    signerAddress: address,
    message,
  };
}

/**
 * Verifies an EIP-191 signature against the signer address.
 */
export function verifyComplaintSignature(
  message: string,
  signature: string,
  expectedSignerAddress: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedSignerAddress.toLowerCase();
  } catch (err) {
    console.error("[Privy] Signature verification failed:", err);
    return false;
  }
}
