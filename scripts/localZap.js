const { ethers } = require("hardhat");

let zapper;
const ONE_HUNDRED_MILLION = "100000000000000000000000000";
const ONE_MILLION = "1000000000000000000000000";
const ONE_HUNDRED = "100000000000000000000";
const ONE = "1000000000000000000";

const ZAPPER_ADDRESS = '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82';

async function main() {
    [owner] = await ethers.getSigners();

    zapper = await ethers.getContractAt("Zapper", ZAPPER_ADDRESS);

    // Zap with avax
    const zap = await zapper.zapWithAvax(0, {
      value: ONE,
      from: owner.address
    });

    console.log(
      'Zapped: ', zap
    );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });