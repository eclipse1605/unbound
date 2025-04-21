const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CommentManager", function() {
  let commentManager;
  let owner, user1, user2;
  let mockCoordinator;
  let sparkId = 1;

  beforeEach(async function() {
    
    [owner, user1, user2] = await ethers.getSigners();

    const MockCoordinator = await ethers.getContractFactory("MockUnboundCoordinator");
    mockCoordinator = await MockCoordinator.deploy();
    await mockCoordinator.deployed();

    const CommentManager = await ethers.getContractFactory("CommentManager");
    commentManager = await CommentManager.deploy(mockCoordinator.address);
    await commentManager.deployed();
  });

  describe("Comment Creation", function() {
    it("should create a comment", async function() {
      const content = "This is a test comment";
      
      await expect(commentManager.connect(user1).createComment(sparkId, content, 0))
        .to.emit(commentManager, "CommentCreated")
        .withArgs(1, sparkId, user1.address, 0);

      const commentIds = await commentManager.getCommentsForSpark(sparkId);
      expect(commentIds.length).to.equal(1);

      const comment = await commentManager.getComment(commentIds[0]);
      expect(comment.author).to.equal(user1.address);
      expect(comment.content).to.equal(content);
      expect(comment.sparkId).to.equal(sparkId);
      expect(comment.parentId).to.equal(0);
      expect(comment.likes).to.equal(0);
    });

    it("should revert when creating a comment with empty content", async function() {
      await expect(
        commentManager.connect(user1).createComment(sparkId, "", 0)
      ).to.be.revertedWith("Comment content cannot be empty");
    });

    it("should revert when creating a comment with content too long", async function() {
      
      const longContent = "a".repeat(1001);
      
      await expect(
        commentManager.connect(user1).createComment(sparkId, longContent, 0)
      ).to.be.revertedWith("Comment content too long");
    });

    it("should revert when parent comment does not exist", async function() {
      await expect(
        commentManager.connect(user1).createComment(sparkId, "Test comment", 999)
      ).to.be.revertedWith("Parent comment does not exist");
    });
  });

  describe("Comment Replies", function() {
    it("should create nested replies", async function() {
      
      await commentManager.connect(user1).createComment(sparkId, "Parent comment", 0);
      const commentIds = await commentManager.getCommentsForSpark(sparkId);
      const parentId = commentIds[0];

      await commentManager.connect(user2).createComment(sparkId, "Reply to parent", parentId);

      const replyIds = await commentManager.getRepliesForComment(parentId);
      expect(replyIds.length).to.equal(1);

      const reply = await commentManager.getComment(replyIds[0]);
      expect(reply.content).to.equal("Reply to parent");
      expect(reply.parentId).to.equal(parentId);
    });

    it("should revert when replying to a deleted comment", async function() {
      
      await commentManager.connect(user1).createComment(sparkId, "Parent comment", 0);
      const commentIds = await commentManager.getCommentsForSpark(sparkId);
      const parentId = commentIds[0];

      await commentManager.connect(user1).deleteComment(parentId);

      await expect(
        commentManager.connect(user2).createComment(sparkId, "Reply to deleted", parentId)
      ).to.be.revertedWith("Cannot reply to a deleted comment");
    });
  });

  describe("Comment Likes", function() {
    let commentId;

    beforeEach(async function() {
      
      await commentManager.connect(user1).createComment(sparkId, "Test comment", 0);
      const commentIds = await commentManager.getCommentsForSpark(sparkId);
      commentId = commentIds[0];
    });

    it("should like a comment", async function() {
      await expect(commentManager.connect(user2).likeComment(commentId))
        .to.emit(commentManager, "CommentLiked")
        .withArgs(commentId, user2.address);

      const comment = await commentManager.getComment(commentId);
      expect(comment.likes).to.equal(1);

      const hasLiked = await commentManager.hasLikedComment(commentId, user2.address);
      expect(hasLiked).to.equal(true);

      const likedComments = await commentManager.getLikedCommentsByUser(user2.address);
      expect(likedComments.length).to.equal(1);
      expect(likedComments[0]).to.equal(commentId);
    });

    it("should revert when liking a comment twice", async function() {
      
      await commentManager.connect(user2).likeComment(commentId);

      await expect(
        commentManager.connect(user2).likeComment(commentId)
      ).to.be.revertedWith("Already liked this comment");
    });

    it("should unlike a comment", async function() {
      
      await commentManager.connect(user2).likeComment(commentId);

      await expect(commentManager.connect(user2).unlikeComment(commentId))
        .to.emit(commentManager, "CommentUnliked")
        .withArgs(commentId, user2.address);

      const comment = await commentManager.getComment(commentId);
      expect(comment.likes).to.equal(0);

      const hasLiked = await commentManager.hasLikedComment(commentId, user2.address);
      expect(hasLiked).to.equal(false);

      const likedComments = await commentManager.getLikedCommentsByUser(user2.address);
      expect(likedComments.length).to.equal(0);
    });

    it("should revert when unliking a comment not liked", async function() {
      await expect(
        commentManager.connect(user2).unlikeComment(commentId)
      ).to.be.revertedWith("Haven't liked this comment");
    });

    it("should revert when liking a deleted comment", async function() {
      
      await commentManager.connect(user1).deleteComment(commentId);

      await expect(
        commentManager.connect(user2).likeComment(commentId)
      ).to.be.revertedWith("Cannot like a deleted comment");
    });
  });

  describe("Comment Deletion", function() {
    let commentId;

    beforeEach(async function() {
      
      await commentManager.connect(user1).createComment(sparkId, "Test comment", 0);
      const commentIds = await commentManager.getCommentsForSpark(sparkId);
      commentId = commentIds[0];
    });

    it("should delete a comment", async function() {
      await expect(commentManager.connect(user1).deleteComment(commentId))
        .to.emit(commentManager, "CommentDeleted")
        .withArgs(commentId);

      const comment = await commentManager.getComment(commentId);
      expect(comment.content).to.equal("");
    });

    it("should revert when non-author tries to delete a comment", async function() {
      await expect(
        commentManager.connect(user2).deleteComment(commentId)
      ).to.be.revertedWith("Only the author can perform this action");
    });

    it("should revert when deleting a comment twice", async function() {
      
      await commentManager.connect(user1).deleteComment(commentId);

      await expect(
        commentManager.connect(user1).deleteComment(commentId)
      ).to.be.revertedWith("Comment already deleted");
    });
  });

  describe("Comment Queries", function() {
    beforeEach(async function() {
      
      await commentManager.connect(user1).createComment(sparkId, "Comment 1", 0);
      await commentManager.connect(user2).createComment(sparkId, "Comment 2", 0);
      
      const commentIds = await commentManager.getCommentsForSpark(sparkId);
      await commentManager.connect(user1).createComment(sparkId, "Reply 1", commentIds[0]);
      await commentManager.connect(user2).createComment(sparkId, "Reply 2", commentIds[0]);
    });

    it("should get all comments for a spark", async function() {
      const commentIds = await commentManager.getCommentsForSpark(sparkId);
      expect(commentIds.length).to.equal(2); 
    });

    it("should get all replies for a comment", async function() {
      const commentIds = await commentManager.getCommentsForSpark(sparkId);
      const replyIds = await commentManager.getRepliesForComment(commentIds[0]);
      expect(replyIds.length).to.equal(2);
    });

    it("should revert when querying a non-existent comment", async function() {
      await expect(
        commentManager.getComment(999)
      ).to.be.revertedWith("Comment does not exist");
    });
  });

  describe("Admin Functions", function() {
    it("should allow owner to update coordinator", async function() {
      const newCoordinator = ethers.Wallet.createRandom().address;
      await commentManager.connect(owner).setCoordinator(newCoordinator);

      expect(await commentManager.coordinator()).to.equal(newCoordinator);
    });

    it("should revert when non-owner tries to update coordinator", async function() {
      const newCoordinator = ethers.Wallet.createRandom().address;
      
      await expect(
        commentManager.connect(user1).setCoordinator(newCoordinator)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
}); 