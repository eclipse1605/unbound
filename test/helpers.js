const { ethers } = require("hardhat");

async function deployMockContracts() {
  const [owner, user1, user2, coordinator] = await ethers.getSigners();

  const MockCoordinator = await ethers.getContractFactory("MockUnboundCoordinator");
  const mockCoordinator = await MockCoordinator.deploy();
  await mockCoordinator.deployed();

  const MockSparkRegistry = await ethers.getContractFactory("MockSparkRegistry");
  const mockSparkRegistry = await MockSparkRegistry.deploy();
  await mockSparkRegistry.deployed();

  await mockSparkRegistry.createMockSpark(user1.address);
  
  return {
    mockCoordinator,
    mockSparkRegistry,
    owner,
    user1,
    user2,
    coordinator
  };
}

async function deployContracts() {
  const [owner, user1, user2] = await ethers.getSigners();

  const UnboundCoordinator = await ethers.getContractFactory("UnboundCoordinator");
  const coordinator = await UnboundCoordinator.deploy();
  await coordinator.deployed();

  const SparkRegistry = await ethers.getContractFactory("SparkRegistry");
  const sparkRegistry = await SparkRegistry.deploy();
  await sparkRegistry.deployed();

  const CommentManager = await ethers.getContractFactory("CommentManager");
  const commentManager = await CommentManager.deploy(coordinator.address);
  await commentManager.deployed();

  const ReboundManager = await ethers.getContractFactory("ReboundManager");
  const reboundManager = await ReboundManager.deploy();
  await reboundManager.deployed();

  await sparkRegistry.initialize(coordinator.address);
  await reboundManager.initialize(coordinator.address, sparkRegistry.address);

  await coordinator.setSparkRegistry(sparkRegistry.address);
  await coordinator.setCommentManager(commentManager.address);
  await coordinator.setReboundManager(reboundManager.address);
  
  return {
    coordinator,
    sparkRegistry,
    commentManager,
    reboundManager,
    owner,
    user1,
    user2
  };
}

module.exports = {
  deployMockContracts,
  deployContracts
}; 