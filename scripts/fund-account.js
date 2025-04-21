const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const addressToFund = process.env.DEVELOPER_ADDRESS || "0xca26fB5271aB353C023a114Fd51c1B41759E5213";

  const fundAmount = process.env.FUND_AMOUNT || "100";
  
  console.log(`Funding ${addressToFund} with ${fundAmount} ETH...`);

  const tx = await deployer.sendTransaction({
    to: addressToFund,
    value: hre.ethers.utils.parseEther(fundAmount)
  });

  await tx.wait();

  const balance = await hre.ethers.provider.getBalance(addressToFund);
  
  console.log(`✅ Successfully funded ${addressToFund} with ${fundAmount} ETH`);
  console.log(`Current balance: ${hre.ethers.utils.formatEther(balance)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 