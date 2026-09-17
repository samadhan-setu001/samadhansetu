import { ethers } from "ethers";

function buildMerkleRoot(hashes) {
  if (!hashes || hashes.length === 0) {
    return ethers.keccak256(ethers.toUtf8Bytes("VERICITY_GENESIS_ROOT"));
  }

  let currentLevel = hashes.map((h) =>
    h.startsWith("0x") && h.length === 66 ? h : ethers.keccak256(ethers.toUtf8Bytes(h))
  );

  while (currentLevel.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1];
        const combined = left.toLowerCase() < right.toLowerCase()
          ? ethers.concat([left, right])
          : ethers.concat([right, left]);
        nextLevel.push(ethers.keccak256(combined));
      } else {
        const single = currentLevel[i];
        const combined = ethers.concat([single, single]);
        nextLevel.push(ethers.keccak256(combined));
      }
    }
    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

const sampleHashes = [
  "hash_1_complaint_repaired_road_pothole_fix_001",
  "hash_2_complaint_repaired_streetlight_replaced_002",
  "hash_3_complaint_repaired_water_pipe_leak_003"
];

const root1 = buildMerkleRoot(sampleHashes);
const root2 = buildMerkleRoot(sampleHashes);

console.log("Merkle Root:", root1);
if (root1 === root2 && root1.startsWith("0x") && root1.length === 66) {
  console.log("✓ Merkle Root verification test passed (deterministic & 32-byte bytes32 format)");
} else {
  console.error("✗ Merkle Root verification test failed");
  process.exit(1);
}
