const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("content Contract", function (){
  let Content;
  let contentContract;
  let owner, addr1, addrs;

  beforeEach(async function (){
    Content = await ethers.getContractFactory("Content");
    contentContract = await Content.deploy();
    [owner, addr1, ...addrs] = await ethers.getSigners();
  });

  describe("deployment", function (){
    it("should have an initial sparkCount of 0", async function (){
      const sparkCount = await contentContract.sparkCount();
      expect(sparkCount).to.equal(0);
    });
  });

  describe("creating Sparks", function () {
    it("should create a spark and increment the count", async function (){
      const sparkText = "helo";
      const tx = await contentContract.createSpark(sparkText);
      await tx.wait();
      const sparkCount = await contentContract.sparkCount();
      expect(sparkCount).to.equal(1);
      const spark = await contentContract.getSpark(1);
      expect(spark.id).to.equal(1);
      expect(spark.author).to.equal(owner.address);
      expect(spark.content).to.equal(sparkText);
    });
  });
});