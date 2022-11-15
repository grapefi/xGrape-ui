import { useContext, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useNetwork,
} from "wagmi";
import CountUp from "react-countup";
import { ExternalLink } from "react-feather";
import { BigNumber, constants, utils } from "ethers";
// Context
import NotificationContext from "../context/NotificationContext";
// Constants
import {
  GRAPE,
  GRAPE_MIM,
  GRAPE_MIM_LP_VAULT,
  PRICEORACLE,
  MIM,
  XGRAPE,
  ZAPPER,
  defaultChainId,
} from "../constants";
// Components
import LoadingSpinner from "./utils/LoadingSpinner";
import Card from "./utils/Card";
import XGrapeSeller from "./XGrapeSeller";
// Hooks
import { useEffect } from "react";
import useGrapePrice from "../hooks/useGrapePrice";
import useCalculatePrice from "../hooks/useCalculatePrice";
import useGetPricePerFullShare from "../hooks/useGetPricePerFullShare";
import useGrapeMIMPrice from "../hooks/useGrapeMIMPrice";
import useXGrapePrice from "../hooks/useXGrapePrice";
import useMimPrice from "../hooks/useMIMPrice";

export function XGrapeMinter() {
  const { popNotification } = useContext(NotificationContext);
  const { isConnected, address } = useAccount();
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });

  const [depositAmount, setDepositAmount] = useState("");
  const [allowanceAmount, setAllowanceAmount] = useState("0");
  const [hasSufficientAllowance, setHasSufficientAllowance] = useState(true);
  const [asset, setAsset] = useState("MIM");
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedToken, setSelectedToken] = useState(GRAPE);

  const [zapWithAvaxConfig, setZapWithAvaxConfig] = useState(null);
  const [zapConfig, setZapConfig] = useState(null);

  const [balances, setBalances] = useState([]);
  const [allowances, setAllowances] = useState([]);

  const [approvalInProgress, setApprovalInProgress] = useState(false);
  const [mintInProgress, setMintInProgress] = useState(false);

  const depositAmountWei = useMemo(() => {
    return utils.parseEther(depositAmount?.toString() || "0");
  }, [depositAmount]);

  const xGrapeToMagikLP = useCalculatePrice();
  const magikLpToGrapeMIM = useGetPricePerFullShare();
  const grapeMIMPrice = useGrapeMIMPrice();
  const xGrapePrice = useXGrapePrice();
  const mimPrice = useMimPrice();

  const [zappableAssets] = useState([
    "Grape-MIM LP SW",
    "Grape-MIM LP Magik (SW)",
    "AVAX",
    "MIM",
  ]);

  const grapePrice = useGrapePrice();

  useEffect(() => {
    if (grapePrice && grapePrice > 1.01 && !zappableAssets.includes("GRAPE")) {
      zappableAssets.push("GRAPE");
    }
  }, [grapePrice]);

  const handleDepositAmountChanged = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setDepositAmount(e.target.value);
  };

  const maxDeposit = () => {
    setDepositAmount(walletBalance?.toString());
  };

  const {
    config: zapWithAvaxConfigData,
    refetch: refetchZapWithAvaxConfigData,
  } = usePrepareContractWrite({
    addressOrName: ZAPPER[chain?.id]?.address,
    contractInterface: ZAPPER[chain?.id]?.abi,
    functionName: "zapWithAvax",
    args: "0",
    overrides: {
      from: address,
      value: depositAmountWei,
    },
  });

  const {
    isLoading: zapWithAvaxIsLoading,
    isError: zapWithAvaxIsError,
    write: zapWithAvax,
  } = useContractWrite({
    ...zapWithAvaxConfig,
    onSettled() {
      setDepositAmount("");
    },
    onError(error) {
      setMintInProgress(false);
      popNotification({
        type: "error",
        title: "Error Minting",
        description: (
          <div className="flex items-center">
            <span className="mt-1">{`${error?.toString()}`}</span>
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ),
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`,
      });
    },
    onSuccess(data) {
      setMintInProgress(true);
      popNotification({
        type: "success",
        title: "Mint Submitted",
        description: (
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span>
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ),
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`,
      });
      data.wait().then(async (tx) => {
        setMintInProgress(false);
        const refetchedBalances = await refetchBalances();
        setBalances(refetchedBalances?.data);
        updateAssetData(asset);
        popNotification({
          type: "success",
          title: "Mint Complete",
          description: (
            <div className="flex items-center">
              <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span>
              <ExternalLink className="ml-1 h-5 w-5" />
            </div>
          ),
          link: `${chain?.blockExplorers?.default?.url}/tx/${tx.transactionHash}`,
        });
      });
    },
  });

  const { config: zapConfigData, refetch: refetchZapConfigData } =
    usePrepareContractWrite({
      addressOrName: ZAPPER[chain?.id]?.address,
      contractInterface: ZAPPER[chain?.id]?.abi,
      functionName: "zap",
      args: [selectedToken[chain?.id]?.address, depositAmountWei, "0"],
    });

  const {
    isLoading: zapIsLoading,
    isError: zapIsError,
    write: zap,
  } = useContractWrite({
    ...zapConfig,
    onSettled() {
      setDepositAmount("");
    },
    onError(error) {
      setMintInProgress(false);
      popNotification({
        type: "error",
        title: "Error Minting",
        description: (
          <div className="flex items-center">
            <span className="mt-1">{`${error?.toString()}`}</span>
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ),
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`,
      });
    },
    onSuccess(data) {
      setMintInProgress(true);
      popNotification({
        type: "success",
        title: "Mint Submitted",
        description: (
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span>
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ),
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`,
      });
      data.wait().then(async (tx) => {
        setMintInProgress(false);
        const refetchedBalances = await refetchBalances();
        setBalances(refetchedBalances?.data);
        updateAssetData(asset);
        popNotification({
          type: "success",
          title: "Mint Complete",
          description: (
            <div className="flex items-center">
              <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span>
              <ExternalLink className="ml-1 h-5 w-5" />
            </div>
          ),
          link: `${chain?.blockExplorers?.default?.url}/tx/${tx.transactionHash}`,
        });
      });
    },
  });

  const refetchZapWithAvaxConfig = async () => {
    const config = await refetchZapWithAvaxConfigData();
    setZapWithAvaxConfig(config?.data);
  };

  const refetchZapConfig = async () => {
    const config = await refetchZapConfigData();
    setZapConfig(config?.data);
  };

  useEffect(() => {
    refetchZapWithAvaxConfig();
    refetchZapConfig();
  }, [address, depositAmountWei, chain?.id]);

  const fetchAndSetAllowances = async () => {
    const refetchedAllowances = await refetchAllowances();
    setAllowances(refetchedAllowances?.data);
  };

  const { config: approveConfig } = usePrepareContractWrite({
    addressOrName: selectedToken[chain?.id]?.address,
    contractInterface: selectedToken[chain?.id]?.abi,
    functionName: "approve",
    args: [ZAPPER[chain?.id]?.address, constants.MaxUint256],
  });

  const { isLoading: approvalIsLoading, write: approve } = useContractWrite({
    ...approveConfig,
    onSuccess(data) {
      setApprovalInProgress(true);
      popNotification({
        type: "success",
        title: "Approval Submitted",
        description: (
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span>
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ),
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`,
      });
      data.wait().then(async (tx) => {
        setApprovalInProgress(false);
        popNotification({
          type: "success",
          title: "Approval Complete",
          description: (
            <div className="flex items-center">
              <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span>
              <ExternalLink className="ml-1 h-5 w-5" />
            </div>
          ),
          link: `${chain?.blockExplorers?.default?.url}/tx/${tx.transactionHash}`,
        });
        refetchZapWithAvaxConfig();
        refetchZapConfig();
        await fetchAndSetAllowances();
        setHasSufficientAllowance(true);
      });
    },
    onError(e) {
      popNotification({
        type: "error",
        title: "Approval Error",
        description: typeof e === "object" ? JSON.stringify(e) : e.toString(),
      });
    },
  });

  const { data: xGrapeBalance } = useContractRead({
    addressOrName: XGRAPE[chain?.id]?.address,
    contractInterface: XGRAPE[chain?.id]?.abi,
    functionName: "balanceOf",
    args: address,
    watch: isConnected,
    enabled: isConnected,
  });

  const walletBalanceXgrape = useMemo(() => {
    if (!xGrapeBalance) return "0";
    return utils.formatEther(xGrapeBalance?.toString());
  }, [xGrapeBalance]);

  // get the avax balance
  const { data: avaxBalance } = useBalance({
    addressOrName: address,
  });

  // get the balances for the assets we can mint XGRAPE with
  const {
    data: balancesData,
    isLoading: balancesAreLoading,
    refetch: refetchBalances,
    isRefetching: balancesRefetching,
    isFetched: balancesFetched,
  } = useContractReads({
    contracts: [
      {
        addressOrName: GRAPE[chain?.id]?.address,
        contractInterface: GRAPE[chain?.id]?.abi,
        functionName: "balanceOf",
        args: [address],
        watch: true,
      },
      {
        addressOrName: GRAPE_MIM[chain?.id]?.address,
        contractInterface: GRAPE_MIM[chain?.id]?.abi,
        functionName: "balanceOf",
        args: [address],
        watch: true,
      },
      {
        addressOrName: GRAPE_MIM_LP_VAULT[chain?.id]?.address,
        contractInterface: GRAPE_MIM_LP_VAULT[chain?.id]?.abi,
        functionName: "balanceOf",
        args: [address],
        watch: true,
      },
      {
        addressOrName: MIM[chain?.id]?.address,
        contractInterface: MIM[chain?.id]?.abi,
        functionName: "balanceOf",
        args: [address],
        watch: true,
      },
      {
        addressOrName: XGRAPE[chain?.id]?.address,
        contractInterface: XGRAPE[chain?.id]?.abi,
        functionName: "balanceOf",
        args: [address],
        watch: true,
      },
    ],
  });

  useEffect(() => {
    setBalances(balancesData);
  }, [balancesData]);

  // get the allowances for the assets we can mint XGRAPE with
  // get the balances for the assets we can mint XGRAPE with
  const {
    data: allowanceData,
    status: allowanceStatus,
    isLoading: allowancesAreLoading,
    isFetched: allowancesFetched,
    refetch: refetchAllowances,
  } = useContractReads({
    contracts: [
      {
        addressOrName: GRAPE[chain?.id]?.address,
        contractInterface: GRAPE[chain?.id]?.abi,
        functionName: "allowance",
        args: [address, ZAPPER[chain?.id]?.address],
        watch: true,
      },
      {
        addressOrName: GRAPE_MIM[chain?.id]?.address,
        contractInterface: GRAPE_MIM[chain?.id]?.abi,
        functionName: "allowance",
        args: [address, ZAPPER[chain?.id]?.address],
        watch: true,
      },
      {
        addressOrName: GRAPE_MIM_LP_VAULT[chain?.id]?.address,
        contractInterface: GRAPE_MIM_LP_VAULT[chain?.id]?.abi,
        functionName: "allowance",
        args: [address, ZAPPER[chain?.id]?.address],
        watch: true,
      },
      {
        addressOrName: MIM[chain?.id]?.address,
        contractInterface: MIM[chain?.id]?.abi,
        functionName: "allowance",
        args: [address, ZAPPER[chain?.id]?.address],
        watch: true,
      },
    ],
  });

  useEffect(() => {
    setAllowances(allowanceData);
  }, [allowanceData]);

  const updateAssetData = (asset) => {
    if (allowanceStatus !== "success" || !balances || !allowances) return;
    switch (asset) {
      case "Grape":
        setWalletBalance(utils.formatEther(balances[0] || "0"));
        setAllowanceAmount(allowances[0] || "0");
        checkSufficientAllowance(allowances[0] || "0");
        setSelectedToken(GRAPE);
        break;
      case "Grape-MIM LP SW":
        setWalletBalance(utils.formatEther(balances[1] || "0"));
        setAllowanceAmount(allowances[1] || "0");
        checkSufficientAllowance(allowances[1] || "0");
        setSelectedToken(GRAPE_MIM);
        break;
      case "Grape-MIM LP Magik (SW)":
        setWalletBalance(utils.formatEther(balances[2] || "0"));
        setAllowanceAmount(allowances[2] || "0");
        checkSufficientAllowance(allowances[2] || "0");
        setSelectedToken(GRAPE_MIM_LP_VAULT);
        break;
      case "AVAX":
        setWalletBalance(utils.formatEther(avaxBalance?.value || "0"));
        setAllowanceAmount("0");
        setHasSufficientAllowance(true);
        setSelectedToken({ abi: null, address: null });
        break;
      default:
        setWalletBalance(utils.formatEther(balances[3] || "0"));
        setAllowanceAmount(allowances[3] || "0");
        checkSufficientAllowance(allowances[3] || "0");
        setSelectedToken(MIM);
    }
  };

  useEffect(() => {
    if (!balancesRefetching) {
      updateAssetData(asset);
    }
  }, [balancesRefetching]);

  useEffect(() => {
    if (!allowancesFetched || !balancesFetched) return;
    updateAssetData(asset);
  }, [allowancesFetched, balancesFetched, balances, allowances]);

  // set the chain if connected, default if not
  useEffect(() => {
    if (isConnected && connectedChain) {
      setChain(connectedChain);
    } else {
      setChain({ id: defaultChainId });
    }
  }, [isConnected, connectedChain]);

  useEffect(() => {
    if (isConnected && connectedChain) {
      fetchAndSetAllowances();
    }
  }, [asset]);

  const checkSufficientAllowance = (allowanceAmount) => {
    if (asset === "AVAX") return setHasSufficientAllowance(true);
    if (isNaN(parseInt(depositAmount))) return;
    const bnAllowanceAmount = BigNumber.from(allowanceAmount);
    const bnDepositAmount = BigNumber.from(
      utils.parseEther(depositAmount) || "0"
    );
    setHasSufficientAllowance(bnAllowanceAmount.gte(bnDepositAmount));
  };

  // set the wallet balance value to the balance of the active asset
  useMemo(() => {
    setDepositAmount("");
    if (balancesAreLoading || allowancesAreLoading)
      return setWalletBalance("0");
    updateAssetData(asset);
  }, [asset]);

  useEffect(() => {
    checkSufficientAllowance(allowanceAmount);
  }, [depositAmount]);

  const get30xGrapePrice = () => {
    const priceOf30xGrape = Math.ceil(30 * mimPrice * xGrapePrice);
    let price = 0;
    if (asset === "Grape-MIM LP SW") {
      price = Math.ceil(priceOf30xGrape / grapeMIMPrice);
    } else if (asset === "Grape-MIM LP Magik (SW)") {
      price = Math.ceil(priceOf30xGrape / magikLpToGrapeMIM);
    } else if (asset === "AVAX") {
      price = Math.ceil(priceOf30xGrape / 16.2);
    } else if (asset === "MIM") {
      price = Math.ceil(priceOf30xGrape);
    }
    return price + (price * 0.05);
  };
  return (
    <Card
      title="XGrape Minter"
      subtitle="Mint xGrape for holding or use as collateral in Vinium only. If you want LP for the Grape Soda Press use the LP Zapper below."
    >
      <div className="flex justify-center mt-5">
        <div className="tabs tabs-boxed mx-2 flex justify-center sm:mx-0">
          {zappableAssets.map((a, i) => (
            <a
              key={i}
              className={`tab ${asset === a ? "tab-active" : ""}`}
              onClick={() => setAsset(a)}
            >
              {a}
            </a>
          ))}
        </div>
      </div>
      <div className="grid grid-flow-row md:grid-cols-2 gap-2">
        <div className="stat">
          <div className="stat-title">{asset} Wallet balance</div>
          <div className="stat-value">
            <CountUp end={walletBalance} decimals={2} separator="," />
          </div>
          {/* <div className="stat-desc">$300.40</div> */}
        </div>
        <div className="stat">
          <div className="stat-title">XGrape balance</div>
          <div className="stat-value">
            <CountUp end={walletBalanceXgrape} decimals={2} separator="," />
            <span style={{ fontSize: "1.4rem", marginLeft: "10px" }}>
              <CountUp
                end={
                  walletBalanceXgrape *
                  (xGrapeToMagikLP * magikLpToGrapeMIM * grapeMIMPrice)
                }
                decimals={2}
                separator=","
                prefix="~$"
              />
            </span>
          </div>
          {/* <div className="stat-desc">$300.40</div> */}
        </div>
      </div>
      {/* <div className="grid grid-flow-col sm:grid-cols-1 gap-2 mx-6">
        30 xGrape = ~{get30xGrapePrice()} {asset}. Consider adding a bit more
        for slippage and zap fees.
      </div> */}
      <div className="grid grid-flow-col sm:grid-cols-2 gap-2 mx-6 pb-4">
        <div className="relative rounded-md shadow-sm">
          <input
            type="text"
            name="deposit"
            id="deposit"
            value={depositAmount}
            onChange={handleDepositAmountChanged}
            className="input focus:ring-brand-2 focus:border-brand-2 border-2 block w-full pl-7 pr-20 sm:text-sm text-right text-slate-500 border-gray-300 rounded-md"
            placeholder="0"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              onClick={() => maxDeposit()}
              className="text-primary mr-5 p-1 text-sm"
            >
              Max
            </button>
          </div>
        </div>
        {hasSufficientAllowance ? (
          <button
            className={`btn-app w-full ${
              asset === "AVAX"
                ? zapWithAvaxIsError
                  ? "btn-disabled"
                  : ""
                : zapIsError
                ? "btn-disabled"
                : depositAmount === ""
                ? "btn-disabled"
                : ""
            }`}
            onClick={() => (asset === "AVAX" ? zapWithAvax?.() : zap?.())}
          >
            {zapIsLoading || zapWithAvaxIsLoading || mintInProgress ? (
              <LoadingSpinner text="Minting XGrape" />
            ) : (
              `Mint XGrape`
            )}
          </button>
        ) : (
          <button className="btn-app w-full" onClick={() => approve?.()}>
            {approvalIsLoading || approvalInProgress ? (
              <LoadingSpinner text="Approving" />
            ) : (
              `Approve`
            )}
          </button>
        )}
      </div>
      {/* <XGrapeSeller /> */}
      <div className="flex justify-center pb-4 pt-5">
       
        <div className="flex pl-4">
          <a
            rel="noreferrer"
            target="_blank"
            href="https://stats.grapefinance.app/"
            className="btn-app"
          >
            View xGrape Chart
          </a>
        </div>
      </div>
    </Card>
  );
}

export default XGrapeMinter;
