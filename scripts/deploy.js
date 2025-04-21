

const hre = require("hardhat");

async function main() {
  console.log("Deploying Unbound contracts...");

  console.log("Deploying UnboundCoordinator...");
  const UnboundCoordinator = await hre.ethers.getContractFactory("UnboundCoordinator");
  const coordinator = await UnboundCoordinator.deploy();
  await coordinator.deployTransaction.wait();
  console.log("UnboundCoordinator deployed to:", coordinator.address);

  console.log("Deploying SparkRegistry...");
  const SparkRegistry = await hre.ethers.getContractFactory("SparkRegistry");
  const sparkRegistry = await SparkRegistry.deploy();
  await sparkRegistry.deployTransaction.wait();
  console.log("SparkRegistry deployed to:", sparkRegistry.address);

  console.log("Deploying ReboundManager...");
  const ReboundManager = await hre.ethers.getContractFactory("ReboundManager");
  const reboundManager = await ReboundManager.deploy();
  await reboundManager.deployTransaction.wait();
  console.log("ReboundManager deployed to:", reboundManager.address);

  console.log("Deploying UnboundSocialGraph...");
  const UnboundSocialGraph = await hre.ethers.getContractFactory("UnboundSocialGraph");
  const socialGraph = await UnboundSocialGraph.deploy();
  await socialGraph.deployTransaction.wait();
  console.log("UnboundSocialGraph deployed to:", socialGraph.address);

  console.log("Deploying InteractionTracker...");
  const InteractionTracker = await hre.ethers.getContractFactory("InteractionTracker");
  const interactionTracker = await InteractionTracker.deploy();
  await interactionTracker.deployTransaction.wait();
  console.log("InteractionTracker deployed to:", interactionTracker.address);

  console.log("Deploying MediaManager...");
  const MediaManager = await hre.ethers.getContractFactory("MediaManager");
  const mediaManager = await MediaManager.deploy();
  await mediaManager.deployTransaction.wait();
  console.log("MediaManager deployed to:", mediaManager.address);

  const coordinatorAddress = coordinator.address;
  const sparkRegistryAddress = sparkRegistry.address;
  const reboundManagerAddress = reboundManager.address;
  const socialGraphAddress = socialGraph.address;
  const interactionTrackerAddress = interactionTracker.address;
  const mediaManagerAddress = mediaManager.address;

  console.log("Initializing contracts...");
  await sparkRegistry.initialize(coordinatorAddress);
  await reboundManager.initialize(coordinatorAddress, sparkRegistryAddress);
  await socialGraph.initialize(coordinatorAddress);
  await interactionTracker.initialize(coordinatorAddress);
  await mediaManager.initialize(coordinatorAddress);

  console.log("Setting initial components in coordinator...");
  await coordinator.setInitialComponents(
    sparkRegistryAddress,
    reboundManagerAddress,
    socialGraphAddress,
    interactionTrackerAddress
  );

  const addresses = {
    coordinator: coordinatorAddress,
    sparkRegistry: sparkRegistryAddress,
    reboundManager: reboundManagerAddress,
    socialGraph: socialGraphAddress,
    interactionTracker: interactionTrackerAddress,
    mediaManager: mediaManagerAddress
  };

  const fs = require('fs');
  fs.writeFileSync('contract-addresses.json', JSON.stringify(addresses, null, 2));
  
  fs.writeFileSync('frontend/contract-addresses.json', JSON.stringify(addresses, null, 2));

  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 