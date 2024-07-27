# NFTStaking 

This project is made using vanilla JS and Solidity.

## Available Scripts

In the project directory, install the nodejs and npm if you haven't:

### `npm install --legacy-peer-deps`(for exact version)

Set up a hardhat project with necessary configurations




## Testnet
In your Hardhat configuration file (hardhat.config.js), set up the network you want to deploy to (e.g., a testnet like Goerli or Sepolia).

Recommended - Sepolia (since goerli testnet is no longer in use)



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`INFURA_PROJECT_ID`=your_infura_project_id
`PRIVATE_KEY`=your_private_key
`NFT_CONTRACT_ADDRESS`=0x...
`REWARD_TOKEN_ADDRESS`=0x...



## Running Tests

To run tests, run the following command

```bash
  npx hardhat compile

  npx hardhat test

  npx hardhat run scripts/deploy.js --network sepolia
```


#Screenshots
If you directly want to see action of nftstaking.sol try remix ide and paste code for testing out functionalities
![image](https://github.com/user-attachments/assets/d438b775-2a3b-424f-a540-8a833bf6c66d)
