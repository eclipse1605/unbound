const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SparkRegistry", function() {
  let sparkRegistry;
  let owner, user1, user2, coordinator;

  beforeEach(async function() {
    [owner, user1, user2, coordinator] = await ethers.getSigners();

    const SparkRegistry = await ethers.getContractFactory("SparkRegistry");
    sparkRegistry = await SparkRegistry.deploy();
    await sparkRegistry.deployed();

    await sparkRegistry.initialize(coordinator.address);
  });

  describe("Initialization", function() {
    it("should set the coordinator correctly", async function() {

      await sparkRegistry.connect(user1).createSpark("Test spark", "");

      await sparkRegistry.connect(coordinator).incrementReboundCount(0);

      const spark = await sparkRegistry.getSpark(0);
      expect(spark.rebounds).to.equal(1);
    });

    it("should revert on re-initialization", async function() {
      await expect(
        sparkRegistry.initialize(coordinator.address)
      ).to.be.reverted; 
    });
  });

  describe("Spark Creation", function() {
    it("should create a spark", async function() {
      const content = "This is a test spark";
      const mediaHash = "ipfs:
      
      await expect(sparkRegistry.connect(user1).createSpark(content, mediaHash))
        .to.emit(sparkRegistry, "SparkCreated")
        .withArgs(0, user1.address, content, mediaHash);

      const spark = await sparkRegistry.getSpark(0);
      expect(spark.author).to.equal(user1.address);
      expect(spark.content).to.equal(content);
      expect(spark.mediaHash).to.equal(mediaHash);
      expect(spark.likes).to.equal(0);
      expect(spark.rebounds).to.equal(0);
      expect(spark.isDeleted).to.equal(false);

      expect(await sparkRegistry.getSparkCount()).to.equal(1);

      const userSparks = await sparkRegistry.getSparksByAuthor(user1.address);
      expect(userSparks.length).to.equal(1);
      expect(userSparks[0]).to.equal(0);
    });

    it("should validate content on spark creation", async function() {

      await expect(
        sparkRegistry.connect(user1).createSpark("", "")
      ).to.be.reverted;
    });
  });

  describe("Spark Deletion", function() {
    beforeEach(async function() {
      
      await sparkRegistry.connect(user1).createSpark("Test spark", "");
    });

    it("should delete a spark", async function() {
      await expect(sparkRegistry.connect(user1).deleteSpark(0))
        .to.emit(sparkRegistry, "SparkDeleted")
        .withArgs(0, user1.address);

      const spark = await sparkRegistry.getSpark(0);
      expect(spark.isDeleted).to.equal(true);
    });

    it("should revert when non-author tries to delete a spark", async function() {
      await expect(
        sparkRegistry.connect(user2).deleteSpark(0)
      ).to.be.reverted; 
    });
  });

  describe("Spark Likes", function() {
    beforeEach(async function() {
      
      await sparkRegistry.connect(user1).createSpark("Test spark", "");
    });

    it("should like a spark", async function() {
      await expect(sparkRegistry.connect(user2).likeSpark(0))
        .to.emit(sparkRegistry, "SparkLiked")
        .withArgs(0, user2.address);

      const spark = await sparkRegistry.getSpark(0);
      expect(spark.likes).to.equal(1);
    });

    it("should revert when liking a spark twice", async function() {
      
      await sparkRegistry.connect(user2).likeSpark(0);

      await expect(
        sparkRegistry.connect(user2).likeSpark(0)
      ).to.be.reverted; 
    });

    it("should unlike a spark", async function() {
      
      await sparkRegistry.connect(user2).likeSpark(0);

      await expect(sparkRegistry.connect(user2).unlikeSpark(0))
        .to.emit(sparkRegistry, "SparkUnliked")
        .withArgs(0, user2.address);

      const spark = await sparkRegistry.getSpark(0);
      expect(spark.likes).to.equal(0);
    });

    it("should revert when unliking a spark not liked", async function() {
      await expect(
        sparkRegistry.connect(user2).unlikeSpark(0)
      ).to.be.reverted; 
    });
  });

  describe("Rebound Counts", function() {
    beforeEach(async function() {
      
      await sparkRegistry.connect(user1).createSpark("Test spark", "");
    });

    it("should allow coordinator to increment rebound count", async function() {
      await sparkRegistry.connect(coordinator).incrementReboundCount(0);

      const spark = await sparkRegistry.getSpark(0);
      expect(spark.rebounds).to.equal(1);
    });

    it("should revert when non-coordinator tries to increment rebound count", async function() {
      await expect(
        sparkRegistry.connect(user2).incrementReboundCount(0)
      ).to.be.reverted; 
    });
  });

  describe("Spark Queries", function() {
    beforeEach(async function() {
      
      await sparkRegistry.connect(user1).createSpark("Spark 1", "");
      await sparkRegistry.connect(user1).createSpark("Spark 2", "");
      await sparkRegistry.connect(user2).createSpark("Spark 3", "");
    });

    it("should get the correct spark count", async function() {
      expect(await sparkRegistry.getSparkCount()).to.equal(3);
    });

    it("should get all sparks by an author", async function() {
      const user1Sparks = await sparkRegistry.getSparksByAuthor(user1.address);
      expect(user1Sparks.length).to.equal(2);
      expect(user1Sparks[0]).to.equal(0);
      expect(user1Sparks[1]).to.equal(1);
      
      const user2Sparks = await sparkRegistry.getSparksByAuthor(user2.address);
      expect(user2Sparks.length).to.equal(1);
      expect(user2Sparks[0]).to.equal(2);
    });
  });
}); 