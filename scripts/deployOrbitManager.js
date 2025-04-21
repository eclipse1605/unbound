
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying OrbitManager contract...");

  const OrbitManager = await hre.ethers.getContractFactory("OrbitManager");
  const orbitManager = await OrbitManager.deploy();
  await orbitManager.deployTransaction.wait();
  
  const address = orbitManager.address;
  console.log("OrbitManager deployed to:", address);

  const addresses = {
    orbitManager: address
  };
  
  fs.writeFileSync('orbit-manager-address.json', JSON.stringify(addresses, null, 2));
  console.log("Address saved to orbit-manager-address.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
