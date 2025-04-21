const { ethers } = require("ethers");
const addresses = require("../contract-addresses.json");

async function main() {
  const provider = new ethers.JsonRpcProvider("http:
  const code = await provider.getCode(addresses.sparkRegistry);
  console.log("Deployed code at address:", addresses.sparkRegistry);
  console.log(code);
}

main().catch(console.error);
