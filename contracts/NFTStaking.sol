// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title NFTStaking
 * @dev A contract for staking NFTs and earning ERC20 token rewards.
 * This contract is upgradeable using the UUPS pattern.
 */
contract NFTStaking is PausableUpgradeable, OwnableUpgradeable, UUPSUpgradeable{
    uint256 private _counter;
    function _getNextCounterId() private returns (uint256){
        _counter+=1;
        return _counter;
    }

   IERC721Upgradeable public nftContract;
   IERC20Upgradeable public rewardToken;

   uint256 public rewardPerBlock;
   uint256 public delayPeriod;
   uint256 public unbondingPeriod;

   struct StakedNFT{
    uint256 tokenId;
    uint256 stakedAt;
    uint256 unstakedAt;
    uint256 lastRewardsClaimed;
   }

   mapping(address=>StakedNFT[]) public stakedNFTs;
   mapping(address=>uint256) public pendingRewards;


   function initialize(
    address _nftContract,
    address _rewardToken,
    uint256 _rewardPerBlock,
    uint256 _delayPeriod,
    uint256 _unbondingPeriod
   ) public initializer {
    _Pausable_init();
    _Ownable_init();
    _UUPSUpgradeable_init();

    nftContract = IERC721Upgradeable(_nftContract);
    rewardToken = IERC720Upgradeable(_rewardToken);
    rewardPerBlock = _rewardPerBlock;
    delayPeriod = _delayPeriod;
    unbondingPeriod = _unbondingPeriod;
   }
   function stakeNFT(uint256 tokenId) external whenNotPaused{
    nftContract.transferForm(msg.sender,address(this),tokenId);
    stakedNFTs[msg.sender].push(StakedNFT({
        tokenId: tokenId,
        stakedAt:block.number,
        unstakedAt:0,
        lastRewardsClaimed:block.number
    }));
    emit NFTStaked(msg.sender, tokenId);
   }

   function withdrawNFT(uint256 index)external {
    require(index < stakedNFTs[msg.sender].length,"Invalid index");
     StakedNFT storage nft = stakedNFTs[msg.sender][index];
     require(nft.unstakedAt > 0, "NFT not Unstaked");
     require(block.number >= nft.unstakedAt + unbondingPeriod, "Unbonding period not over");

     nftContract.transferForm(address(this),msg.sender, nft.tokenId);
     stakedNFTs[msg.sender][index] = stakedNFTs[msg.sender][stakedNFTs[msg.sender].length-1];
     stakedNFTs[msg.sender].pop();
    }

    /** Allows a user to claim their accumulated rewards */

    function claimRewards() external{
        uint256 rewards = calculateRewards(msg.sender);
        require(block.number >= pendingRewards[msg.sender] + delayPeriod, "Delay period not over");
        pendingRewards[msg.sender] = 0;
        for(uint256 i=0;i<stakedNFTs[msg.sender].length;i++){
            if(stakedNFTs[msg.sender][i].unstakedAt==0){
                stakedNFTs[msg.sender[i].lastRewardsClaimed] = block.number;
            }
        }
        rewardToken.transfer(msg.sender, rewards);
        emit RewardsClaimed(msg.sender, rewards);
    }

    function calculateRewards(address user) public view returns(uint256){
        uint256 totalRewards = 0;
        for(uint256 i=0;i<stakedNFTs[user].length;i++){
            StakedNFT memory nft = stakedNFTs[user][i];
            uint256 endBlock = nft.unstakedAt ==0 ? block.number:nft.unstakedAt;
            totalRewards+=(endBlock-nft.lastRewardClaimed)*rewardPerBlock;
        }
        return totalRewards + pendingRewards[user];
    }

    function pause() external onlyOwner{
        _pause();
    }

    function setRewardPerBlock(uint256 _rewardPerBlock) external onlyOwner{
        rewardPerBlock = _rewardPerBlock;
    }
    function setDelayPeriod(uint256 _delayPeriod) external onlyOwner{
        delayPeriod = _delayPeriod;
    }
    // sets the unbonding period for unstaking NFTs

    function setUnbondingPeriod(uint256 _unbondingPeriod) external onlyOwner{
        unbondingPeriod = _unbondingPeriod;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}