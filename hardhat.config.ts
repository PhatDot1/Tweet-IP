// hardhat.config.js
require("ts-node").register({ project: "./tsconfig.json" });
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: {
      compilers: [
        {
          version: "0.8.28",
          settings: {
            viaIR: true,
            evmVersion: "paris",
            optimizer: { enabled: true, runs: 200 }
          }
        },
        {
          version: "0.8.26",
          settings: {
            viaIR: true,
            evmVersion: "paris",
            optimizer: { enabled: true, runs: 200 }
          }
        }
      ]
    },
  networks: {
    story_testnet: {
      url: "https://aeneid.storyrpc.io",
      chainId: 1315,
      accounts: [process.env.PRIVATE_KEY],
    },
    /* …other networks… */
  },
};
