const {expect}  = require("chai");
const {ethers, upgrades} = require("hardhat");

describe("NFTStaking",function(){
    let NFTStaking, nftStaking, owner, addr1, addr2;
    let mockNFT, MockNFT;
    let MockERC20, mockERC20;

    beforeEach(async function(){
        [owner,addr1, addr2] = await ethers.getSigners();

        MockNFT = await ethers.getContractFactory("MockNFT");
        mockNFT = await MockNFT.deploy();

        MockERC20 = await ethers.getContractFactory("MockERC20");
        mockERC20 = await upgrades.deploy();

        NFTStaking = await ethers.getContractFactory("NFTStaking");
        nftStaking = await upgrades.deployProxy(NFTStaking, [
            mockNFT.address,
            mockERC20.address,
            ethers.utils.parseEther("1"),
            100,
            200
        ])
        await mockNFT.mint(addr1.address,1);
        await mockNFT.mint(addr1.address,2);

        await mockERC20.mint(nftStaking.address, ethers.utils.parseEther("1000000"));

    });

    describe("Staking",function(){
        it("Should allow staking NFTs",async function(){
            await mockNFT.connect(addr1).approve(nftStaking.address,1);
            await nftStaking.connect(addr1).stakeNFT(1);
            expect(await mockNFT.ownerOf(1).to.equal(nftStaking.address));

        });

        if("Should emit NFTStaked event", async function(){
            await mockNFT.connect(addr1).approve(nftStaking.address,1);
            await expect(nftStaking.connect(addr1).stakeNFT(1))
            .to.emit(nftStaking,"NFTStaked")
            .withArgs(addr1.address,1)
        });
    });
    describe("Withdrawing", function () {
        beforeEach(async function () {
          await mockNFT.connect(addr1).approve(nftStaking.address, 1);
          await nftStaking.connect(addr1).stakeNFT(1);
          await nftStaking.connect(addr1).unstakeNFT(0);
        });
    
        it("Should not allow withdrawing before unbonding period", async function () {
          await expect(nftStaking.connect(addr1).withdrawNFT(0)).to.be.revertedWith("Unbonding period not over");
        });
    
        it("Should allow withdrawing after unbonding period", async function () {
          await ethers.provider.send("hardhat_mine", ["0x200"]); // Mine 512 blocks
          await nftStaking.connect(addr1).withdrawNFT(0);
          expect(await mockNFT.ownerOf(1)).to.equal(addr1.address);
        });
      });
    
      describe("Rewards", function () {
        beforeEach(async function () {
          await mockNFT.connect(addr1).approve(nftStaking.address, 1);
          await nftStaking.connect(addr1).stakeNFT(1);
        });
    
        it("Should calculate rewards correctly", async function () {
          await ethers.provider.send("hardhat_mine", ["0x64"]); // Mine 100 blocks
          const rewards = await nftStaking.calculateRewards(addr1.address);
          expect(rewards).to.equal(ethers.utils.parseEther("100"));
        });
    
        it("Should not allow claiming rewards before delay period", async function () {
          await expect(nftStaking.connect(addr1).claimRewards()).to.be.revertedWith("Delay period not over");
        });
    
        it("Should allow claiming rewards after delay period", async function () {
          await ethers.provider.send("hardhat_mine", ["0x64"]); // Mine 100 blocks
          await nftStaking.connect(addr1).claimRewards();
          expect(await mockERC20.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("100"));
        });
      });
    
      describe("Admin functions", function () {
        it("Should allow owner to pause and unpause", async function () {
          await nftStaking.pause();
          expect(await nftStaking.paused()).to.be.true;
          await nftStaking.unpause();
          expect(await nftStaking.paused()).to.be.false;
        });
    
        it("Should allow owner to set reward per block", async function () {
          await nftStaking.setRewardPerBlock(ethers.utils.parseEther("2"));
          expect(await nftStaking.rewardPerBlock()).to.equal(ethers.utils.parseEther("2"));
        });
    
        it("Should allow owner to set delay period", async function () {
          await nftStaking.setDelayPeriod(200);
          expect(await nftStaking.delayPeriod()).to.equal(200);
        });
    
        it("Should allow owner to set unbonding period", async function () {
          await nftStaking.setUnbondingPeriod(300);
          expect(await nftStaking.unbondingPeriod()).to.equal(300);
        });
      });
    });