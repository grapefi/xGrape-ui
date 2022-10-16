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
  MIM,
  XGRAPE,
  UNZAPPER,
  defaultChainId,
  GRAPE_MIM_SW_MAGIK,
} from "../constants";
// Components
import LoadingSpinner from "./utils/LoadingSpinner";
import Card from "./utils/Card";
// Hooks
import { useEffect } from "react";
import useXGrapePrice from "../hooks/useXGrapePrice";
import useCalculatePrice from "../hooks/useCalculatePrice";
import useGrapeMIMPrice from "../hooks/useGrapeMIMPrice";
import useMimPrice from "../hooks/useMIMPrice";
import useGrapePrice from "../hooks/useGrapePrice";

export function XGrapeSeller() {
  const { popNotification } = useContext(NotificationContext);
  const { isConnected, address } = useAccount();
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });

  const [depositAmount, setDepositAmount] = useState("");
  const [hasSufficientAllowance, setHasSufficientAllowance] = useState(false);

  const [asset, setAsset] = useState("MIM"); // selected token in UI
  const [unzapConfig, setUnzapConfig] = useState(null);

  const [approvalInProgress, setApprovalInProgress] = useState(false);
  const [sellInProgress, setSellInProgress] = useState(false);

  const [amountBack, setAmountBack] = useState(0);

  const depositAmountWei = useMemo(() => {
    return utils.parseEther(depositAmount?.toString() || "0");
  }, [depositAmount]);

  const xGrapePrice = useXGrapePrice();
  const xGrapeToMagikLP = useCalculatePrice();
  const grapeMIMPrice = useGrapeMIMPrice();
  const mimPrice = useMimPrice();
  const grapePrice = useGrapePrice();

  const [unzappableAssets] = useState([
    "Grape-MIM LP SW",
    "Grape-MIM LP Magik",
    "Grape",
    "MIM",
  ]);

  const calculateAmountBack = (xGrapeAmount) => {
    let mimValue = xGrapeAmount * xGrapePrice * mimPrice;

    if (asset === "Grape-MIM LP SW") {
      return (mimValue / grapeMIMPrice) * 0.99;
    } else if (asset === "Grape-MIM LP Magik") {
      return (xGrapeAmount * xGrapeToMagikLP) * 0.99;
    } else if (asset === "Grape") {
      return (xGrapeAmount / grapePrice) * 0.99;
    } else if (asset === "MIM") {
      return (mimValue) * 0.99;
    }
  };

  const handleDepositAmountChanged = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setDepositAmount(e.target.value);

    const amountBack = calculateAmountBack(e.target.value);
    setAmountBack(amountBack);
  };

  const maxDeposit = () => {
    const value = utils.formatEther(xGrapeBalance || "0")
    setDepositAmount(value);
    const amountBack = calculateAmountBack(value);
    setAmountBack(amountBack);
  };

  const getSelectedAssetAddress = () => {
    if (asset === "Grape-MIM LP SW") {
      return GRAPE_MIM[chain?.id]?.address;
    } else if (asset === "Grape-MIM LP Magik") {
      return GRAPE_MIM_LP_VAULT[chain?.id]?.address;
    } else if (asset === "Grape") {
      return GRAPE[chain?.id]?.address;
    } else if (asset === "MIM") {
      return MIM[chain?.id]?.address;
    }
  };

  const { config: unzapConfigData, refetch: refetchUnzapConfigData } =
    usePrepareContractWrite({
      addressOrName: UNZAPPER[chain?.id]?.address,
      contractInterface: UNZAPPER[chain?.id]?.abi,
      functionName: "unzap",
      args: [depositAmountWei, getSelectedAssetAddress(), "0"],
    });

  const {
    isLoading: zapIsLoading,
    isError: zapIsError,
    write: unzap,
  } = useContractWrite({
    ...unzapConfig,
    onSettled() {
      setDepositAmount("");
    },
    onError(error) {
      setSellInProgress(false);
      popNotification({
        type: "error",
        title: "Error Selling",
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
      setSellInProgress(true);
      popNotification({
        type: "success",
        title: "Sell Submitted",
        description: (
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span>
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ),
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`,
      });
      data.wait().then(async (tx) => {
        setSellInProgress(false);
        popNotification({
          type: "success",
          title: "Sell Complete",
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

  const refetchZapConfig = async () => {
    const config = await refetchUnzapConfigData();
    setUnzapConfig(config?.data);
  };

  useEffect(() => {
    refetchZapConfig();
  }, [address, depositAmountWei, chain?.id]);

  const { config: approveConfig } = usePrepareContractWrite({
    addressOrName: XGRAPE[chain?.id]?.address,
    contractInterface: XGRAPE[chain?.id]?.abi,
    functionName: "approve",
    args: [UNZAPPER[chain?.id]?.address, constants.MaxUint256],
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
        refetchZapConfig();
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

  const { data: allowance } = useContractRead({
    addressOrName: XGRAPE[chain?.id]?.address,
    contractInterface: XGRAPE[chain?.id]?.abi,
    functionName: "allowance",
    args: [address, UNZAPPER[chain?.id]?.address],
    watch: true,
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

  // set the chain if connected, default if not
  useEffect(() => {
    if (isConnected && connectedChain) {
      setChain(connectedChain);
    } else {
      setChain({ id: defaultChainId });
    }
  }, [isConnected, connectedChain]);

  const checkSufficientAllowance = (allowanceAmount) => {
    const bnAllowanceAmount = BigNumber.from(allowanceAmount);
    if (depositAmount) {
      const bnDepositAmount = BigNumber.from(
        utils.parseEther(depositAmount) || "0"
      );
      setHasSufficientAllowance(bnAllowanceAmount.gte(bnDepositAmount));
    } else {
      setHasSufficientAllowance(bnAllowanceAmount > 0);
    }
  };

  // set the wallet balance value to the balance of the active asset
  useMemo(() => {
    setDepositAmount("");
  }, [asset]);

  useEffect(() => {
    console.log("Allowance = " + allowance);
    if (allowance) {
      checkSufficientAllowance(allowance);
    }
  }, [allowance]);

  return (
    <Card
      title="XGrape Seller"
      subtitle="Select the asset you want to receive, and sell your xGrape."
    >
      <div className="flex justify-center mt-5">
        <div className="tabs tabs-boxed mx-2 flex justify-center sm:mx-0">
          {unzappableAssets.map((a, i) => (
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
          <div className="stat-title">XGrape balance</div>
          <div className="stat-value">
            <CountUp end={walletBalanceXgrape} decimals={2} separator="," />
            <span style={{ fontSize: "1.4rem", marginLeft: "10px" }}>
              <CountUp
                end={walletBalanceXgrape * xGrapePrice}
                decimals={2}
                separator=","
                prefix="~$"
              />
            </span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">{asset}</div>
          <div className="stat-value">
            ~<CountUp end={amountBack} decimals={2} separator="," />
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
              zapIsError
                ? "btn-disabled"
                : depositAmount === ""
                ? "btn-disabled"
                : ""
            }`}
            onClick={() => unzap?.()}
          >
            {zapIsLoading || sellInProgress ? (
              <LoadingSpinner text="Selling XGrape" />
            ) : (
              `Sell XGrape for ${asset}`
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
    </Card>
  );
}

export default XGrapeSeller;
