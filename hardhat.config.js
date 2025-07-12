require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};

// .env file should contain:
// PRIVATE_KEY=0x... (your wallet private key) 