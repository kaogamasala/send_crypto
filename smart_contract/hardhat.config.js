require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/Ybl-Y53wGnl9VcdXz_6DVpVGlnl63-7w',
      accounts: [ '7df801d1913e33a1a89e6e617cd30488e39d4c5cfee8d0c484be106d10b4440d' ]
    }
  }
};
