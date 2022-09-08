import { useContext, useMemo, useState } from 'react';
import { 
  useAccount, 
  useContractRead,
  useContractWrite, 
  usePrepareContractWrite,
  useNetwork,
} from 'wagmi';
import { ExternalLink } from 'react-feather';
import { BigNumber, utils } from 'ethers';
// Context
import NotificationContext from "../context/NotificationContext";
// Constants
import { XGRAPE, defaultChainId } from '../constants';
// Components
import LoadingSpinner from './utils/LoadingSpinner';
// Hooks
import { useEffect } from 'react';

export function XGrapeSeller () {
  const { popNotification } = useContext(NotificationContext);
  const { isConnected, address } = useAccount();
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });

  const [sellAmount, setSellAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [sellInProgress, setSellInProgress] = useState(false);

  const handleSellAmountChanged = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setSellAmount(e.target.value);
  }

  const maxSell = () => {
    setSellAmount(walletBalance?.toString());
  }

  const { config: sellConfig } = usePrepareContractWrite({
    addressOrName: XGRAPE[chain?.id]?.address,
    contractInterface: [
      'function sell(uint256 tokenAmount, address recipient) external returns (uint256)'
    ],    
    functionName: 'sell',
    args: [
      utils.parseEther(sellAmount?.toString() || '0'),
      address
    ]
  });

  const {
    isLoading: sellIsLoading,
    isError: sellIsError,
    write: sell,
  } = useContractWrite({
    ...sellConfig,
    onSettled() {
      setSellAmount('');
    },
    onError(error) {
      setMintInProgress(false);
      popNotification({
        type: 'error',
        title: 'Error Minting',
        description: 
          <div className="flex items-center">
            <span className="mt-1">{`${error?.toString()}`}</span> 
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
    },
    onSuccess(data) {
      setSellInProgress(true);
      popNotification({
        type: 'success',
        title: 'Sell Submitted',
        description: 
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
      data.wait().then(tx => {
        setSellInProgress(false);
        popNotification({
          type: 'success',
          title: 'Sell Complete',
          description: 
            <div className="flex items-center">
              <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
              <ExternalLink className="ml-1 h-5 w-5" />
            </div>
          ,
          link: `${chain?.blockExplorers?.default?.url}/tx/${tx.transactionHash}`
        });
      })
    }
  });

  const { data: xGrapeBalance } = useContractRead({
    addressOrName: XGRAPE[chain?.id]?.address,
    contractInterface: XGRAPE[chain?.id]?.abi,
    functionName: 'balanceOf',
    args: address,
    watch: isConnected,
    enabled: isConnected
  });

  const sellIsDisabled = useMemo(() => {
    if (!walletBalance || !sellAmount) return true;

    if (
      BigNumber.from(utils.parseEther(walletBalance)).lt(
      BigNumber.from(utils.parseEther(sellAmount))
    )) return true;

    return false;
  }, [sellAmount, walletBalance]);

  useEffect(() => {
    setWalletBalance(utils.formatEther(xGrapeBalance || '0'))
  }, [xGrapeBalance]);

  const walletBalanceXgrape = useMemo(() => { 
    if (!xGrapeBalance) return '0';
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

  return (
    <div className="grid grid-flow-col sm:grid-cols-2 gap-2 mx-6 pb-4">
      <div className="relative rounded-md shadow-sm">
        <input 
          type="text" 
          name="sell" 
          id="sell" 
          value={sellAmount}
          onChange={handleSellAmountChanged}
          className="input focus:ring-brand-2 focus:border-brand-2 border-2 block w-full pl-7 pr-20 sm:text-sm text-right text-slate-500 border-gray-300 rounded-md"
          placeholder="0"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button onClick={() => maxSell()} className="text-primary mr-5 p-1 text-sm">
            Max
          </button>
        </div>
      </div>
      <button 
        className={`btn-app w-full ${sellIsDisabled ? 'btn-disabled' : ''}`}
        onClick={() => sell?.()}
      >
        { sellIsLoading || sellInProgress
          ? <LoadingSpinner text="Selling XGrape"/>
          : `Sell XGrape`
        }
      </button>
    </div>
  )
}

export default XGrapeSeller;