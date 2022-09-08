const hre = require("hardhat");
const ethers = hre.ethers;

let DFA;
let DFAContract;
let BuyReceiver;
let BuyReceiverContract;
let SellReceiver;
let SellReceiverContract;
let TransferReceiver;
let TransferReceiverContract;
let DFASwapper;
let DFASwapperContract;
let DFAStaking;
let DFAStakingContract;
let DFAStakingSwapper;
let DFAStakingSwapperContract;
let RewardDistributor;
let RewardDistributorContract;
let FactoryContract;
let pair;
let owner;

const Router = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const Factory = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
const WETH = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const pETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const pETHSwapper = "0xEb4A32930D18c503780423C9447B6b79FEEAd974";


async function sleep (ms) {
    return new Promise(resolve => {
    setTimeout(() => {
        return resolve()
    }, ms);
    })
}

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

async function main () {

    // addresses
    [owner] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", owner.address);
    console.log("Account balance:", (await owner.getBalance()).toString());

    // manage nonce to prevent "replacement fee too low" errors
    let baseNonce = ethers.provider.getTransactionCount(owner.address);
    let nonceOffset = 0;
    function getNonce() {
    return baseNonce.then((nonce) => (nonce + (nonceOffset++)));
    }

    // Fetch Contract Factories    
    DFAContract = await ethers.getContractFactory("contracts/DFA/DFAToken.sol:DFA");
    DFASwapperContract = await ethers.getContractFactory("contracts/DFA/DFASwapper.sol:DFASwapper");
    BuyReceiverContract = await ethers.getContractFactory("contracts/DFA/BuyReceiver.sol:BuyReceiver");
    SellReceiverContract = await ethers.getContractFactory("contracts/DFA/SellReceiver.sol:SellReceiver");
    TransferReceiverContract = await ethers.getContractFactory("contracts/DFA/TransferReceiver.sol:TransferReceiver");
    DFAStakingContract = await ethers.getContractFactory("contracts/DFA/DFAStaking.sol:DualReflectionStaking");
    RewardDistributorContract = await ethers.getContractFactory("contracts/DFA/RewardDistributor.sol:RewardDistributor");
    DFAStakingSwapperContract = await ethers.getContractFactory("contracts/DFA/MAXISwapper.sol:DFAMAXISwapper");

    // Fetch Deployed Factory
    FactoryContract = await ethers.getContractAt("PancakeFactory", Factory);
    console.log('Fetched Factory Contract: ', FactoryContract.address, '\nVerify Against: ', Factory, '\n');
    await sleep(3000);

    // Deploy Contracts
    DFA = await DFAContract.deploy({ nonce: getNonce() });
    console.log({ DFA: DFA.address })
    await sleep(5000);

    DFASwapper = await DFASwapperContract.deploy(DFA.address, Router, { nonce: getNonce() });
    console.log({ DFASwapper: DFASwapper.address })
    await sleep(5000);

    DFAStaking = await DFAStakingContract.deploy(DFA.address, DFA.address, { nonce: getNonce() });
    console.log({ DFAStaking: DFAStaking.address })
    await sleep(5000);

    BuyReceiver = await BuyReceiverContract.deploy(DFA.address, owner.address, DFAStaking.address, { nonce: getNonce() });
    console.log({ BuyReceiver: BuyReceiver.address })
    await sleep(5000);
    
    SellReceiver = await SellReceiverContract.deploy(DFA.address, owner.address, DFAStaking.address, Router, { nonce: getNonce() });
    console.log({ SellReceiver: SellReceiver.address })
    await sleep(5000);

    TransferReceiver = await TransferReceiverContract.deploy(DFA.address, owner.address, DFAStaking.address, { nonce: getNonce() });
    console.log({ TransferReceiver: TransferReceiver.address })
    await sleep(5000);

    RewardDistributor = await RewardDistributorContract.deploy(DFAStaking.address, pETH, pETHSwapper, { nonce: getNonce() });
    console.log({ RewardDistributor: RewardDistributor.address })
    await sleep(5000);
   
    DFAStakingSwapper = await DFAStakingSwapperContract.deploy(DFA.address, DFAStaking.address, Router, { nonce: getNonce() })
    console.log({ DFAStakingSwapper: DFAStakingSwapper.address })
    await sleep(5000);
   
    // Fee Exempt MAXI
    await DFA.setFeeExempt(DFAStaking.address, true, { nonce: getNonce() });
    await sleep(5000);

    console.log('Maxi Is Fee Exempt');

    // Set DFA Receivers
    await DFA.setBuyFeeRecipient(BuyReceiver.address, { nonce: getNonce() });
    await sleep(5000);

    await DFA.setSellFeeRecipient(SellReceiver.address, { nonce: getNonce() });
    await sleep(5000);

    await DFA.setTransferFeeRecipient(TransferReceiver.address, { nonce: getNonce() });
    await sleep(5000);

    console.log('Buy/Sell/Transfer Receivers Are Set In DFA Contract');

    await DFA.setSwapper(DFASwapper.address, { nonce: getNonce() });
    await sleep(5000);

    console.log('Swapper Is Set In DFA Contract');

    await DFAStaking.setTokenSwapper(DFAStakingSwapper.address, { nonce: getNonce() });
    console.log('Staking Swapper Set In DFA Staking Contract');
    await sleep(5000);

    await DFAStaking.setSwapper(DFASwapper.address, { nonce: getNonce() });
    await sleep(5000);

    console.log('Swapper Is Set In DFA Contract');

    // Create pair on router
    await FactoryContract.createPair(DFA.address, WETH, { nonce: getNonce() });
    await sleep(15000);

    // fetch pair address
    pair = await FactoryContract.getPair(DFA.address, WETH);

    console.log('Pair For DFA-BNB Is Created At Address: ', pair);

    // Add AMM
    await DFA.registerAutomatedMarketMaker(pair, { nonce: getNonce() });
    await sleep(5000);

    console.log('Pair Registered As Automated Market Maker');

    // Set DFA MAXI State
    await DFAStaking.setRewardDistributor(RewardDistributor.address, { nonce: getNonce() });
    await sleep(5000);

    console.log('Reward Distributor Set In MAXI');
    console.log('\nOnto Verification Process\n');

    await verify(DFA.address, []);
    await verify(DFASwapper.address, [DFA.address, Router]);
    await verify(DFAStaking.address, [DFA.address, DFASwapper.address]);
    await verify(RewardDistributor.address, [DFAStaking.address, pETH, pETHSwapper]);
    await verify(BuyReceiver.address, [DFA.address, owner.address, DFAStaking.address]);
    await verify(SellReceiver.address, [DFA.address, owner.address, DFAStaking.address, Router]);
    await verify(TransferReceiver.address, [DFA.address, owner.address, DFAStaking.address]);
    await verify(DFAStakingSwapper.address, [DFA.address, DFAStaking.address, Router]);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
    });