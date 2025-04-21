

const { ethers } = require("ethers");
const addresses = require("../contract-addresses.json");
const sparkRegistryAbi = require("./abis/SparkRegistry.json").abi;

async function main() {
  try {
    
    console.log("Connecting to local blockchain at http://127.0.0.1:8545");
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const network = await provider.getNetwork();
    console.log(`Connected to network: Chain ID ${network.chainId}`);

    const sparkRegistryAddress = addresses.sparkRegistry;
    console.log(`\nVerifying SparkRegistry at address: ${sparkRegistryAddress}`);
    
    const code = await provider.getCode(sparkRegistryAddress);
    
    if (code === "0x") {
      console.error("ERROR: No contract deployed at this address!");
      console.log("You need to:");
      console.log("1. Make sure your local blockchain is running");
      console.log("2. Make sure you've deployed the contracts");
      console.log("3. Verify contract-addresses.json has the correct address");
      return;
    }
    
    console.log("✅ Contract found at address");

    console.log("\nTesting SparkRegistry contract methods...");
    const contract = new ethers.Contract(sparkRegistryAddress, sparkRegistryAbi, provider);

    try {
      const sparkCount = await contract.getSparkCount();
      console.log(`✅ getSparkCount() successful: ${sparkCount.toString()} sparks`);
    } catch (error) {
      console.error("❌ getSparkCount() failed:", error.message);
    }
    
    console.log("\nContract verification complete!");
    
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main();
