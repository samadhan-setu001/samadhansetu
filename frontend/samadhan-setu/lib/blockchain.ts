/**
 * ============================================================================
 * VeriCity Blockchain Configuration & Explorer Helpers
 * ============================================================================
 */

export const POLYGON_AMOY_EXPLORER =
  process.env.NEXT_PUBLIC_POLYGON_AMOY_EXPLORER || "https://amoy.polygonscan.com";

export const RESOLUTION_ANCHOR_ADDRESS =
  process.env.NEXT_PUBLIC_RESOLUTION_ANCHOR_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const OFFICER_REPUTATION_ADDRESS =
  process.env.NEXT_PUBLIC_OFFICER_REPUTATION_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export function getExplorerAddressUrl(address?: string | null, tab = "events"): string {
  const addr = address || OFFICER_REPUTATION_ADDRESS;
  const baseUrl = POLYGON_AMOY_EXPLORER.endsWith("/")
    ? POLYGON_AMOY_EXPLORER.slice(0, -1)
    : POLYGON_AMOY_EXPLORER;
  return `${baseUrl}/address/${addr}${tab ? `#${tab}` : ""}`;
}

export function getExplorerTxUrl(txHash?: string | null): string {
  if (!txHash) return POLYGON_AMOY_EXPLORER;
  const baseUrl = POLYGON_AMOY_EXPLORER.endsWith("/")
    ? POLYGON_AMOY_EXPLORER.slice(0, -1)
    : POLYGON_AMOY_EXPLORER;
  return `${baseUrl}/tx/${txHash}`;
}
