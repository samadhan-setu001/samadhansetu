const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VeriCity Smart Contracts", function () {
  let resolutionAnchor;
  let officerReputation;
  let owner, officerUser, unauthorizedUser;

  beforeEach(async function () {
    [owner, officerUser, unauthorizedUser] = await ethers.getSigners();

    const ResolutionAnchor = await ethers.getContractFactory("ResolutionAnchor");
    resolutionAnchor = await ResolutionAnchor.deploy();
    await resolutionAnchor.waitForDeployment();

    const OfficerReputation = await ethers.getContractFactory("OfficerReputation");
    officerReputation = await OfficerReputation.deploy();
    await officerReputation.waitForDeployment();
  });

  describe("ResolutionAnchor", function () {
    it("should deploy with owner set to deployer", async function () {
      expect(await resolutionAnchor.owner()).to.equal(owner.address);
      expect(await resolutionAnchor.getAnchorCount()).to.equal(0);
    });

    it("should allow owner to anchor Merkle root", async function () {
      const sampleRoot = ethers.keccak256(ethers.toUtf8Bytes("vericity-resolution-chain-sample"));
      const totalRecords = 42;

      const tx = await resolutionAnchor.anchorMerkleRoot(sampleRoot, totalRecords);
      await tx.wait();

      expect(await resolutionAnchor.getAnchorCount()).to.equal(1);
      const latest = await resolutionAnchor.getLatestAnchor();
      expect(latest.merkleRoot).to.equal(sampleRoot);
      expect(latest.totalRecords).to.equal(totalRecords);
      expect(latest.timestamp).to.be.greaterThan(0);
    });

    it("should reject non-owner trying to anchor", async function () {
      const sampleRoot = ethers.keccak256(ethers.toUtf8Bytes("unauthorized-root"));
      await expect(
        resolutionAnchor.connect(unauthorizedUser).anchorMerkleRoot(sampleRoot, 10)
      ).to.be.revertedWith("Only contract owner can anchor roots");
    });

    it("should reject zero hash", async function () {
      await expect(
        resolutionAnchor.anchorMerkleRoot(ethers.ZeroHash, 5)
      ).to.be.revertedWith("Invalid empty root");
    });
  });

  describe("OfficerReputation", function () {
    it("should deploy with owner set to deployer", async function () {
      expect(await officerReputation.owner()).to.equal(owner.address);
      expect(await officerReputation.getTotalOfficers()).to.equal(0);
    });

    it("should append officer score records", async function () {
      const officerId = "OFF-1042";
      const scoreBasisPoints = 8550; // 85.50%
      const scoreFormatted = "85.50";

      await officerReputation.recordScore(officerId, scoreBasisPoints, scoreFormatted);

      const history = await officerReputation.getOfficerHistory(officerId);
      expect(history.length).to.equal(1);
      expect(history[0].scoreBasisPoints).to.equal(scoreBasisPoints);
      expect(history[0].scoreFormatted).to.equal(scoreFormatted);

      // Append second score update
      const newScoreBP = 8800; // 88.00%
      await officerReputation.recordScore(officerId, newScoreBP, "88.00");

      const updatedHistory = await officerReputation.getOfficerHistory(officerId);
      expect(updatedHistory.length).to.equal(2);
      expect(updatedHistory[1].scoreBasisPoints).to.equal(newScoreBP);

      const latest = await officerReputation.getLatestScore(officerId);
      expect(latest.scoreBasisPoints).to.equal(newScoreBP);
      expect(latest.scoreFormatted).to.equal("88.00");
    });

    it("should support batch score recording", async function () {
      const ids = ["OFF-1001", "OFF-1002", "OFF-1003"];
      const scores = [9200, 7850, 8900];
      const formatted = ["92.00", "78.50", "89.00"];

      await officerReputation.recordScoresBatch(ids, scores, formatted);

      expect(await officerReputation.getTotalOfficers()).to.equal(3);
      const history1 = await officerReputation.getOfficerHistory("OFF-1001");
      expect(history1[0].scoreFormatted).to.equal("92.00");
      const history2 = await officerReputation.getOfficerHistory("OFF-1002");
      expect(history2[0].scoreFormatted).to.equal("78.50");
    });

    it("should reject non-owner recording scores", async function () {
      await expect(
        officerReputation.connect(unauthorizedUser).recordScore("OFF-1042", 9000, "90.00")
      ).to.be.revertedWith("Only owner can record scores");
    });

    it("should reject scores exceeding 100%", async function () {
      await expect(
        officerReputation.recordScore("OFF-1042", 10001, "100.01")
      ).to.be.revertedWith("Score cannot exceed 100.00%");
    });
  });
});
