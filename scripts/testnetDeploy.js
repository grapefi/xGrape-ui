const { ethers } = require("hardhat");

let XGrapeContract;
let xgrape;
let GrapeMimLpVaultContract;
let grapeMimLpVault;
let GrapeContract;
let grape;
let MimContract;
let mim;
let ZapperContract;
let zapper;
let RouterContract;
let router;
let FactoryContract;
let factory;
let WAVAXContract;
let wavax;

const ONE_BILLION = "1000000000000000000000000000";
const ONE_HUNDRED_MILLION = "100000000000000000000000000";
const ONE_MILLION = "1000000000000000000000000";
const ONE_HUNDRED = "100000000000000000000";
const ONE = "1000000000000000000";
const POINT_ONE = "100000000000000000";
const ZEROZEROZEROONE = "1000000000000000";

async function verify (address, args) {
  try {
  // verify the token contract code
  await hre.run("verify:verify", {
      address: address,
      constructorArguments: args
  });
  } catch (e) {
  console.log("error verifying contract", e);
  }
  await sleep(1000);
}

async function sleep (ms) {
  return new Promise(resolve => {
  setTimeout(() => {
      return resolve()
  }, ms);
  })
}


async function main() {
  // addresses
  [owner, addr1, addr2, addr3, addr4, addr5, ...addrs] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", owner.address);
  console.log("Account balance:", (await owner.getBalance()).toString());

  // manage nonce to prevent "replacement fee too low" errors
  let baseNonce = ethers.provider.getTransactionCount(owner.address);
  let nonceOffset = 0;
  function getNonce() {
    return baseNonce.then((nonce) => (nonce + (nonceOffset++)));
  }

  // contracts
  XGrapeContract = await ethers.getContractFactory("contracts/xGRAPE.sol:xGRAPE");
  GrapeMimLpVaultContract = await ethers.getContractFactory("contracts/test_contracts/GrapeMimLpVault.sol:GrapeMimLpVault");
  GrapeContract = await ethers.getContractFactory("contracts/test_contracts/Grape.sol:Grape");
  MimContract = await ethers.getContractFactory("contracts/test_contracts/MIM.sol:MIM");
  ZapperContract = await ethers.getContractFactory("contracts/Zapper.sol:Zapper");
  FactoryContract = await ethers.getContractFactory("contracts/test_contracts/JoeFactory.sol:JoeFactory");
  RouterContract = await ethers.getContractFactory("contracts/test_contracts/JoeRouter02.sol:JoeRouter02");
  WAVAXContract = await ethers.getContractFactory("contracts/test_contracts/WAVAX.sol:WAVAX");

  // deploy contracts
  grape = await GrapeContract.deploy("Grape", "GRAPE", ONE_BILLION, { nonce: getNonce() });
  await sleep(3000);
  mim = await MimContract.deploy("Magic Internet Money", "MIM", ONE_BILLION, { nonce: getNonce() });
  await sleep(3000);
  wavax = await WAVAXContract.deploy({ nonce: getNonce() });
  await sleep(3000);
  factory = await ethers.getContractAt("JoeFactory", "0xf5c7d9733e5f53abcc1695820c4818c59b457c2c");
  console.log({ factory: factory.address })
  await sleep(3000);
  router = await ethers.getContractAt("JoeRouter02", "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901");
  console.log({ router: router.address })

  // create an LP between grape and mim
  await mim.approve(router.address, ONE_MILLION, { nonce: getNonce() });
  console.log('approved mim...');
  await sleep(3000);
  await grape.approve(router.address, ONE_MILLION, { nonce: getNonce() });
  console.log('approved grape...');
  await sleep(5000);
  console.log({ router: router.address })
  await router.addLiquidity(
    mim.address,
    grape.address,
    ONE_MILLION,
    ONE_MILLION,
    '0',
    '0',
    owner.address,
    ONE_HUNDRED_MILLION,
    { nonce: getNonce() }
  );
  console.log('LP1 done')

  await sleep(2000);
  // create an LP between eth and mim
  await mim.approve(router.address, ONE_MILLION, { nonce: getNonce() });
  console.log('mim approved...')
  await sleep(5000);
  await router.addLiquidityAVAX(
    mim.address,
    ONE_MILLION,
    '0',
    '0',
    owner.address,
    ONE_HUNDRED_MILLION,
    { value: POINT_ONE, from: owner.address, nonce: getNonce() }
  );

  console.log('LP2 done')
  await sleep(5000);
  // continue deploying contracts now that there is an LP token
  grapeMimLpTokenAddress = await factory.getPair(grape.address, mim.address);
  grapeMimLpToken = await ethers.getContractAt([
    "function balanceOf(address owner) external view returns (uint256)",
    "function approve(address spender, uint256 value) external returns (bool)",
    "function transfer(address to, uint256 value) external returns (bool)"
  ], grapeMimLpTokenAddress);

  // deploy contracts dependent on LP
  grapeMimLpVault = await GrapeMimLpVaultContract.deploy("GrapeMimLpVault", "GMLPV", ONE_BILLION, grapeMimLpTokenAddress, { nonce: getNonce() });
  await sleep(3000);
  console.log('LP Vault: ', grapeMimLpVault.address);

  xgrape = await XGrapeContract.deploy(grapeMimLpVault.address, owner.address, { nonce: getNonce() });
  await sleep(3000);

  // deploy zapper
  zapper = await ZapperContract.deploy(
    xgrape.address, 
    grapeMimLpVault.address, 
    router.address,
    grapeMimLpTokenAddress,
    mim.address,
    grape.address,
    { nonce: getNonce() }
  );
  await sleep(2000);

  // set zapper in xgrape
  await xgrape.setZapper(zapper.address, { nonce: getNonce() });
  await sleep(2000);
  
  // activate xgrape
  await xgrape.activateToken({ nonce: getNonce() });

  console.log({
    grapeMimLpVault: grapeMimLpVault,
    xgrape: xgrape.address,
    grape: grape.address,
    grapeMim: grapeMimLpTokenAddress,
    mim: mim.address,
    zapper: zapper.address,
  })

  // verifications
  await verify(mim.address, ["Magic Internet Money", "MIM", ONE_BILLION]);
  await verify(grape.address, ["Grape", "GRAPE", ONE_BILLION])
  await verify(grapeMimLpVault.address, ["GrapeMimLpVault", "GMLPV", ONE_BILLION, grapeMimLpTokenAddress]);
  await verify(xgrape.address, [grapeMimLpVault.address, owner.address]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });