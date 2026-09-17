/**
 * ============================================================================
 * Pinata IPFS Decentralized Photo Storage Integration
 * ============================================================================
 * Handles uploading resolution "after" photos to IPFS via Pinata API.
 * 
 * Environment Variables required:
 * - NEXT_PUBLIC_PINATA_JWT: Pinata API JWT token (from https://app.pinata.cloud/developers/api-keys)
 * - NEXT_PUBLIC_PINATA_GATEWAY: Dedicated or public IPFS gateway (defaults to https://gateway.pinata.cloud/ipfs/)
 */

import { sha256Hex } from "./hash";

export interface PinataUploadResult {
  cid: string;
  gatewayUrl: string;
  isSimulated: boolean;
}

const DEFAULT_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

/**
 * Returns the public gateway URL for an IPFS CID
 */
export function getIpfsGatewayUrl(cid?: string | null): string {
  if (!cid) return "";
  if (cid.startsWith("http://") || cid.startsWith("https://")) return cid;
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || DEFAULT_GATEWAY;
  const baseUrl = gateway.endsWith("/") ? gateway : `${gateway}/`;
  return `${baseUrl}${cid}`;
}

/**
 * Converts a data URL (base64 string) to a Blob
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1] || "");
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Uploads an image (dataURL, base64 or blob) to Pinata IPFS.
 * Returns the CID (IpfsHash) and public gateway URL.
 */
export async function uploadToPinata(
  dataUrlOrBlob: string | Blob,
  fileName = `vericity_resolution_${Date.now()}.jpg`,
  metadata: Record<string, any> = {}
): Promise<PinataUploadResult> {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT;

  // Graceful fallback if Pinata JWT is not yet configured by the user
  if (!jwt || jwt === "your_pinata_jwt_here") {
    console.warn(
      "[Pinata IPFS] NEXT_PUBLIC_PINATA_JWT is not set. Generating verifiable mock CID. Add your Pinata JWT to .env.local to pin to live IPFS."
    );
    const content = typeof dataUrlOrBlob === "string" ? dataUrlOrBlob : await dataUrlOrBlob.text();
    const hash = await sha256Hex(content);
    const mockCid = `QmVeriCity${hash.slice(0, 36)}`;
    return {
      cid: mockCid,
      gatewayUrl: getIpfsGatewayUrl(mockCid),
      isSimulated: true,
    };
  }

  try {
    const blob = typeof dataUrlOrBlob === "string" ? dataUrlToBlob(dataUrlOrBlob) : dataUrlOrBlob;
    const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);

    const pinataMetadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        platform: "VeriCity",
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1, // Produces modern bafy... CIDs
    });
    formData.append("pinataOptions", pinataOptions);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Pinata IPFS] Upload error response:", errText);
      throw new Error(`Pinata upload failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const cid = data.IpfsHash;

    return {
      cid,
      gatewayUrl: getIpfsGatewayUrl(cid),
      isSimulated: false,
    };
  } catch (error: any) {
    console.error("[Pinata IPFS] Error during upload:", error);
    // Fallback to simulated CID so the officer completion flow never breaks
    const fallbackHash = await sha256Hex(String(Date.now()));
    const mockCid = `QmVeriCityFallback${fallbackHash.slice(0, 30)}`;
    return {
      cid: mockCid,
      gatewayUrl: getIpfsGatewayUrl(mockCid),
      isSimulated: true,
    };
  }
}
