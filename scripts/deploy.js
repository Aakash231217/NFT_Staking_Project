require('dotenv').config();
const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const NFTStaking = await ethers.getContractFactory("NFTStaking");
  
  const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS;
  const rewardTokenAddress = process.env.REWARD_TOKEN_ADDRESS;
  const rewardPerBlock = ethers.utils.parseEther("1"); // 1 token per block
  const delayPeriod = 100; // 100 blocks delay period
  const unbondingPeriod = 200; // 200 blocks unbonding period

  const nftStaking = await upgrades.deployProxy(NFTStaking, [
    nftContractAddress,
    rewardTokenAddress,
    rewardPerBlock,
    delayPeriod,
    unbondingPeriod
  ]);

  await nftStaking.deployed();

  console.log("NFTStaking deployed to:", nftStaking.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });