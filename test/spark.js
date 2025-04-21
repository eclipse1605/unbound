const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SparkRegistry Contract", function (){
  let SparkRegistry;
  let sparkRegistry;
  let owner, addr1, addrs;

  beforeEach(async function (){
    SparkRegistry = await ethers.getContractFactory("SparkRegistry");
    sparkRegistry = await SparkRegistry.deploy();
    [owner, addr1, ...addrs] = await ethers.getSigners();

    await sparkRegistry.initialize(owner.address);
  });

  describe("deployment", function (){
    it("should have an initial sparkCount of 0", async function (){
      const sparkCount = await sparkRegistry.getSparkCount();
      expect(sparkCount).to.equal(0);
    });
  });

  describe("creating Sparks", function () {
    it("should create a spark and return the id", async function (){
      const sparkContent = "Hello blockchain world!";
      const tx = await sparkRegistry.createSpark(sparkContent, "");
      const receipt = await tx.wait();
      
      const sparkCount = await sparkRegistry.getSparkCount();
      expect(sparkCount).to.equal(1);
      
      const spark = await sparkRegistry.getSpark(0);
      expect(spark.author).to.equal(owner.address);
      expect(spark.content).to.equal(sparkContent);
      expect(spark.likes).to.equal(0);
      expect(spark.rebounds).to.equal(0);
      expect(spark.isDeleted).to.equal(false);
    });
    
    it("should emit SparkCreated event", async function() {
      const sparkContent = "Test content";
      await expect(sparkRegistry.createSpark(sparkContent, ""))
        .to.emit(sparkRegistry, "SparkCreated")
        .withArgs(0, owner.address, sparkContent, "");
    });
  });
});