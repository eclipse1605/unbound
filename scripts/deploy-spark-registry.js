
const hre = require("hardhat");

async function main() {
  console.log("Deploying SparkRegistry contract...");

  const SparkRegistry = await hre.ethers.getContractFactory("SparkRegistry");
  const sparkRegistry = await SparkRegistry.deploy();
  await sparkRegistry.deployTransaction.wait();
  
  const address = sparkRegistry.address;
  console.log("SparkRegistry deployed to:", address);

  const fs = require('fs');
  const addresses = {
    sparkRegistry: address
  };
  
  fs.writeFileSync('contract-addresses.json', JSON.stringify(addresses, null, 2));
  console.log("Address saved to contract-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
