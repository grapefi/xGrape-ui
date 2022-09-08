require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
const privateKey = process.env.PRIVATE_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const etherscanKey = process.env.ETHERSCAN_KEY;
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
      // mining: {
      //   auto: false,
      //   interval: [2000, 5000]
      // }
    },
    // avaxMainnet: {
    //   url: 'https://api.avax.network/ext/bc/C/rpc',
    //   accounts: [`${privateKey}`]
    // },
    // fujiTestnet: {
    // url: `https://api.avax-test.network/ext/bc/C/rpc`,
    // accounts: [`${privateKey}`]
    //},
    // goerliTestnet: {
    //   url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    //   accounts: [`${privateKey}`]
    // },
    // bscTestnet: {
    //   url: `https://data-seed-prebsc-2-s1.binance.org:8545/`,
    //   accounts: [`${privateKey}`]
    // },
  },
  etherscan: {
    apiKey: `${etherscanKey}`
  },
  solidity: {
    compilers: [
      {
        version: "0.8.14",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 500
          }
        }
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 500
          }
        }
      },
      {
        version: "0.6.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50
          }
        }
      },
      {
        version: "0.5.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50
          }
        }
      },
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: false,
            runs: 200
          }
        }
      }
    ]
  }
};


