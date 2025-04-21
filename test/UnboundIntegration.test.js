const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployContracts } = require("./helpers");

describe("Unbound Integration Tests", function() {
  let contracts;
  let sparkRegistry, commentManager, reboundManager;
  let owner, user1, user2;
  let sparkId;

  beforeEach(async function() {
    
    contracts = await deployContracts();
    sparkRegistry = contracts.sparkRegistry;
    commentManager = contracts.commentManager;
    reboundManager = contracts.reboundManager;
    owner = contracts.owner;
    user1 = contracts.user1;
    user2 = contracts.user2;

    const tx = await sparkRegistry.connect(user1).createSpark("Test spark for integration", "");
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'SparkCreated');
    sparkId = event.args[0]; 
  });

  describe("End-to-End Interaction Flow", function() {
    it("should allow creating a spark, commenting, liking, and rebounding", async function() {
      
      await commentManager.connect(user2).createComment(sparkId, "This is a comment", 0);

      const commentIds = await commentManager.getCommentsForSpark(sparkId);
      expect(commentIds.length).to.equal(1);

      await commentManager.connect(user1).likeComment(commentIds[0]);

      const hasLiked = await commentManager.hasLikedComment(commentIds[0], user1.address);
      expect(hasLiked).to.equal(true);

      await reboundManager.connect(user2).createRebound(sparkId, "Rebounding this spark");

      const rebounds = await reboundManager.getReboundsBySpark(sparkId);
      expect(rebounds.length).to.equal(1);

      const spark = await sparkRegistry.getSpark(sparkId);
      expect(spark.rebounds).to.equal(1);
    });
  });

  describe("Comment Tree Structure", function() {
    it("should maintain correct reply structure", async function() {
      
      await commentManager.connect(user1).createComment(sparkId, "Parent comment", 0);
      const commentIds = await commentManager.getCommentsForSpark(sparkId);
      const parentId = commentIds[0];

      await commentManager.connect(user2).createComment(sparkId, "Reply 1", parentId);
      await commentManager.connect(user1).createComment(sparkId, "Reply 2", parentId);

      const replies = await commentManager.getRepliesForComment(parentId);
      expect(replies.length).to.equal(2);

      await commentManager.connect(user2).createComment(sparkId, "Nested reply", replies[0]);

      const nestedReplies = await commentManager.getRepliesForComment(replies[0]);
      expect(nestedReplies.length).to.equal(1);
    });
  });

  describe("Likes System", function() {
    it("should track likes correctly across sparks and comments", async function() {
      
      await sparkRegistry.connect(user2).likeSpark(sparkId);

      await commentManager.connect(user1).createComment(sparkId, "Comment to like", 0);
      const commentIds = await commentManager.getCommentsForSpark(sparkId);

      await commentManager.connect(user2).likeComment(commentIds[0]);

      const spark = await sparkRegistry.getSpark(sparkId);
      expect(spark.likes).to.equal(1);
      
      const comment = await commentManager.getComment(commentIds[0]);
      expect(comment.likes).to.equal(1);

      const userLikedComments = await commentManager.getLikedCommentsByUser(user2.address);
      expect(userLikedComments.length).to.equal(1);
      expect(userLikedComments[0]).to.equal(commentIds[0]);
    });
  });

  describe("Rebounding Mechanism", function() {
    it("should properly track rebounds and update spark counts", async function() {
      
      await reboundManager.connect(user1).createRebound(sparkId, "Rebound 1");
      await reboundManager.connect(user2).createRebound(sparkId, "Rebound 2");

      const sparkRebounds = await reboundManager.getReboundsBySpark(sparkId);
      expect(sparkRebounds.length).to.equal(2);

      const user1Rebounds = await reboundManager.getReboundsByUser(user1.address);
      expect(user1Rebounds.length).to.equal(1);
      
      const user2Rebounds = await reboundManager.getReboundsByUser(user2.address);
      expect(user2Rebounds.length).to.equal(1);

      const user1HasRebounded = await reboundManager.hasRebounded(sparkId, user1.address);
      expect(user1HasRebounded).to.equal(true);
      
      const user2HasRebounded = await reboundManager.hasRebounded(sparkId, user2.address);
      expect(user2HasRebounded).to.equal(true);

      const spark = await sparkRegistry.getSpark(sparkId);
      expect(spark.rebounds).to.equal(2);
    });
  });
}); 