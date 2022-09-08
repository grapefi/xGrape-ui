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
const TEN = "10000000000000000000";
const ONE = "1000000000000000000";

async function main() {
  // addresses
  [owner, addr1, addr2, addr3, addr4, addr5, ...addrs] = await ethers.getSigners();

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
  grape = await GrapeContract.deploy("Grape", "GRAPE", ONE_BILLION);
  mim = await MimContract.deploy("Magic Internet Money", "MIM", ONE_BILLION);
  wavax = await WAVAXContract.deploy();
  factory = await FactoryContract.deploy(owner.address);
  console.log(await factory.pairCodeHash());
  router = await RouterContract.deploy(factory.address, wavax.address);
  
  // create an LP between grape and mim
  await mim.approve(router.address, ONE_MILLION);
  await grape.approve(router.address, ONE_MILLION);
  console.log({ router: router.address })
  await router.addLiquidity(
    mim.address,
    grape.address,
    ONE_MILLION,
    ONE_MILLION,
    '0',
    '0',
    owner.address,
    parseInt(new Date().getTime() + 5000000000)
  );

  // create an LP between eth and mim
  await mim.approve(router.address, ONE_MILLION);
  await router.addLiquidityAVAX(
    mim.address,
    ONE_MILLION,
    '0',
    '0',
    owner.address,
    parseInt(new Date().getTime() + 5000000000),
    { value: TEN, from: owner.address }
  );

  console.log('swap done')
  // continue deploying contracts now that there is an LP token
  grapeMimLpTokenAddress = await factory.getPair(grape.address, mim.address);
  grapeMimLpToken = await ethers.getContractAt([
    "function balanceOf(address owner) external view returns (uint256)",
    "function approve(address spender, uint256 value) external returns (bool)",
    "function transfer(address to, uint256 value) external returns (bool)"
  ], grapeMimLpTokenAddress);

  // deploy contracts dependent on LP
  grapeMimLpVault = await GrapeMimLpVaultContract.deploy("GrapeMimLpVault", "GMLPV", ONE_BILLION, grapeMimLpTokenAddress);
  xgrape = await XGrapeContract.deploy(grapeMimLpVault.address, owner.address);

  // transfer lp tokens to addr1
  const gmLpTokenBalance = await grapeMimLpToken.balanceOf(owner.address);
  await grapeMimLpToken.transfer(addr1.address, gmLpTokenBalance);

  // deploy zapper
  zapper = await ZapperContract.deploy(
    xgrape.address, 
    grapeMimLpVault.address, 
    router.address,
    grapeMimLpTokenAddress,
    mim.address,
    grape.address
  );

  // set zapper in xgrape
  await xgrape.setZapper(zapper.address);
  
  // activate xgrape
  await xgrape.activateToken();

  console.log({
    grapeMimLpVault: grapeMimLpVault.address,
    xgrape: xgrape.address,
    grape: grape.address,
    grapeMim: grapeMimLpTokenAddress,
    mim: mim.address,
    zapper: zapper.address,
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });