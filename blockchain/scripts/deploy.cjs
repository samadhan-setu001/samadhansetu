const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = hre.network.name;
  console.log(`\n🚀 Starting VeriCity Smart Contracts Deployment to [${networkName}]...`);

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Address : ${deployer.address}`);
  console.log(`Deployer Balance : ${hre.ethers.formatEther(balance)} ETH/POL\n`);

  // 1. Deploy ResolutionAnchor
  console.log("Deploying ResolutionAnchor...");
  const ResolutionAnchor = await hre.ethers.getContractFactory("ResolutionAnchor");
  const resolutionAnchor = await ResolutionAnchor.deploy();
  await resolutionAnchor.waitForDeployment();
  const resolutionAnchorAddress = await resolutionAnchor.getAddress();
  console.log(`✅ ResolutionAnchor deployed at: ${resolutionAnchorAddress}`);

  // 2. Deploy OfficerReputation
  console.log("Deploying OfficerReputation...");
  const OfficerReputation = await hre.ethers.getContractFactory("OfficerReputation");
  const officerReputation = await OfficerReputation.deploy();
  await officerReputation.waitForDeployment();
  const officerReputationAddress = await officerReputation.getAddress();
  console.log(`✅ OfficerReputation deployed at: ${officerReputationAddress}`);

  // 3. Write deployed addresses to JSON
  const deploymentInfo = {
    network: networkName,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      ResolutionAnchor: {
        address: resolutionAnchorAddress,
        explorerUrl: `https://amoy.polygonscan.com/address/${resolutionAnchorAddress}`
      },
      OfficerReputation: {
        address: officerReputationAddress,
        explorerUrl: `https://amoy.polygonscan.com/address/${officerReputationAddress}`
      }
    }
  };

  const outputPath = path.join(__dirname, "..", "deployed-contracts.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nSaved contract deployment manifest to: ${outputPath}`);

  // 4. Update frontend .env.local if present
  const frontendEnvPath = path.join(__dirname, "..", "..", "frontend", "samadhan-setu", ".env.local");
  if (fs.existsSync(frontendEnvPath)) {
    let envContent = fs.readFileSync(frontendEnvPath, "utf-8");
    
    const updateEnvVar = (key, val) => {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${val}`);
      } else {
        envContent += `\n${key}=${val}`;
      }
    };

    updateEnvVar("NEXT_PUBLIC_RESOLUTION_ANCHOR_ADDRESS", resolutionAnchorAddress);
    updateEnvVar("NEXT_PUBLIC_OFFICER_REPUTATION_ADDRESS", officerReputationAddress);
    updateEnvVar("NEXT_PUBLIC_POLYGON_AMOY_EXPLORER", "https://amoy.polygonscan.com");

    fs.writeFileSync(frontendEnvPath, envContent);
    console.log(`✅ Updated frontend .env.local with deployed contract addresses.`);
  }

  console.log("\n================ Deployment Summary ================");
  console.log(`Network             : ${networkName}`);
  console.log(`ResolutionAnchor    : ${resolutionAnchorAddress}`);
  console.log(`OfficerReputation   : ${officerReputationAddress}`);
  if (networkName === "amoy") {
    console.log(`\nPolygonscan Amoy Links:`);
    console.log(`ResolutionAnchor    : https://amoy.polygonscan.com/address/${resolutionAnchorAddress}`);
    console.log(`OfficerReputation   : https://amoy.polygonscan.com/address/${officerReputationAddress}`);
  }
  console.log("====================================================\n");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
