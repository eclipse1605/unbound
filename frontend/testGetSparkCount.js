const { ethers } = require("ethers");
const addresses = require("../contract-addresses.json");
const sparkRegistryAbi = require("./abis/SparkRegistry.json").abi;

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const contract = new ethers.Contract(addresses.sparkRegistry, sparkRegistryAbi, provider);
  try {
    const sparkCount = await contract.getSparkCount();
    console.log("getSparkCount() result:", sparkCount.toString());
  } catch (err) {
    console.error("Error calling getSparkCount():", err);
  }
}

main();
