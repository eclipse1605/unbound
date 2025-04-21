const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReboundManager", function() {
  let reboundManager;
  let sparkRegistry;
  let owner, user1, user2, coordinator;
  let sparkId = 0;

  beforeEach(async function() {
    [owner, user1, user2, coordinator] = await ethers.getSigners();

    const MockSparkRegistry = await ethers.getContractFactory("MockSparkRegistry");
    sparkRegistry = await MockSparkRegistry.deploy();
    await sparkRegistry.deployed();

    await sparkRegistry.createMockSpark(user1.address);

    const ReboundManager = await ethers.getContractFactory("ReboundManager");
    reboundManager = await ReboundManager.deploy();
    await reboundManager.deployed();

    await reboundManager.initialize(coordinator.address, sparkRegistry.address);
  });

  describe("Initialization", function() {
    it("should initialize with correct values", async function() {
      
      const ReboundManager = await ethers.getContractFactory("ReboundManager");
      const newReboundManager = await ReboundManager.deploy();

      expect(await newReboundManager._initialized).to.equal(false);

      await newReboundManager.initialize(coordinator.address, sparkRegistry.address);

      expect(await newReboundManager._initialized).to.equal(true);
      expect(await newReboundManager._coordinator).to.equal(coordinator.address);
    });

    it("should revert on re-initialization", async function() {
      await expect(
        reboundManager.initialize(coordinator.address, sparkRegistry.address)
      ).to.be.reverted; 
    });
  });

  describe("Rebound Creation", function() {
    it("should create a rebound with a comment", async function() {
      const comment = "This is a rebound comment";
      
      await expect(reboundManager.connect(user2).createRebound(sparkId, comment))
        .to.emit(reboundManager, "SparkRebounded")
        .withArgs(sparkId, 0, user2.address, comment);

      const rebound = await reboundManager.getRebound(0);
      expect(rebound.originalSparkId).to.equal(sparkId);
      expect(rebound.rebounder).to.equal(user2.address);
      expect(rebound.comment).to.equal(comment);

      const sparkRebounds = await reboundManager.getReboundsBySpark(sparkId);
      expect(sparkRebounds.length).to.equal(1);
      expect(sparkRebounds[0]).to.equal(0);

      const userRebounds = await reboundManager.getReboundsByUser(user2.address);
      expect(userRebounds.length).to.equal(1);
      expect(userRebounds[0]).to.equal(0);
    });

    it("should create a rebound without a comment", async function() {
      await reboundManager.connect(user2).createRebound(sparkId, "");

      const rebound = await reboundManager.getRebound(0);
      expect(rebound.comment).to.equal("");
    });

    it("should validate comment content", async function() {

      const veryLongComment = "a".repeat(2001); 

      await expect(
        reboundManager.connect(user2).createRebound(sparkId, veryLongComment)
      ).to.be.reverted;
    });
  });

  describe("Rebound Queries", function() {
    beforeEach(async function() {
      
      await reboundManager.connect(user1).createRebound(sparkId, "Rebound 1");
      await reboundManager.connect(user2).createRebound(sparkId, "Rebound 2");
      await reboundManager.connect(user1).createRebound(1, "Rebound on another spark");
    });

    it("should get rebounds by spark", async function() {
      const sparkRebounds = await reboundManager.getReboundsBySpark(sparkId);
      expect(sparkRebounds.length).to.equal(2);

      const rebound0 = await reboundManager.getRebound(sparkRebounds[0]);
      expect(rebound0.rebounder).to.equal(user1.address);
      expect(rebound0.comment).to.equal("Rebound 1");

      const rebound1 = await reboundManager.getRebound(sparkRebounds[1]);
      expect(rebound1.rebounder).to.equal(user2.address);
      expect(rebound1.comment).to.equal("Rebound 2");
    });

    it("should get rebounds by user", async function() {
      const user1Rebounds = await reboundManager.getReboundsByUser(user1.address);
      expect(user1Rebounds.length).to.equal(2);

      const rebound0 = await reboundManager.getRebound(user1Rebounds[0]);
      expect(rebound0.originalSparkId).to.equal(sparkId);
      expect(rebound0.comment).to.equal("Rebound 1");
      
      const rebound1 = await reboundManager.getRebound(user1Rebounds[1]);
      expect(rebound1.originalSparkId).to.equal(1);
      expect(rebound1.comment).to.equal("Rebound on another spark");

      const user2Rebounds = await reboundManager.getReboundsByUser(user2.address);
      expect(user2Rebounds.length).to.equal(1);
    });

    it("should get rebound count for a spark", async function() {
      const reboundCount = await reboundManager.getReboundCount(sparkId);
      expect(reboundCount).to.equal(2);
      
      const otherSparkReboundCount = await reboundManager.getReboundCount(1);
      expect(otherSparkReboundCount).to.equal(1);
      
      const nonExistentSparkReboundCount = await reboundManager.getReboundCount(999);
      expect(nonExistentSparkReboundCount).to.equal(0);
    });

    it("should check if a user has rebounded a spark", async function() {
      const user1HasRebounded = await reboundManager.hasRebounded(sparkId, user1.address);
      expect(user1HasRebounded).to.equal(true);
      
      const user2HasRebounded = await reboundManager.hasRebounded(sparkId, user2.address);
      expect(user2HasRebounded).to.equal(true);
      
      const userHasNotRebounded = await reboundManager.hasRebounded(999, user1.address);
      expect(userHasNotRebounded).to.equal(false);
    });

    it("should get the original spark ID for a rebound", async function() {
      const originalSparkId = await reboundManager.getOriginalSparkId(0);
      expect(originalSparkId).to.equal(sparkId);
      
      const anotherOriginalSparkId = await reboundManager.getOriginalSparkId(2);
      expect(anotherOriginalSparkId).to.equal(1);
    });
  });

  describe("Rebound Aliases", function() {
    it("should have reboundSpark as an alias for createRebound", async function() {
      const comment = "Rebound using alias";

      await reboundManager.connect(user2).reboundSpark(sparkId, comment);

      const rebound = await reboundManager.getRebound(0);
      expect(rebound.originalSparkId).to.equal(sparkId);
      expect(rebound.rebounder).to.equal(user2.address);
      expect(rebound.comment).to.equal(comment);
    });
  });
}); 