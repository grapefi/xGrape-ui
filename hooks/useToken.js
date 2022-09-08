import { useEffect, useState } from 'react';
import { 
  useAccount, 
  useContractRead, 
  useDeprecatedContractWrite,
  useNetwork 
} from 'wagmi';
// constants
import { defaultChainId, STAKING, TOKEN } from '../constants';

export const useToken = () => {
  const { address, isConnected } = useAccount();
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });

  useEffect(() => {
    if (isConnected && connectedChain) {
      setChain(connectedChain);
    } else {
      setChain({ id: defaultChainId });
    }
  }, [isConnected, connectedChain]);

  const tokenContract = {
    addressOrName: TOKEN[chain?.id]?.address,
    contractInterface: TOKEN[chain?.id]?.abi,
  }
  
  // Approval
  const { 
    writeAsync: approve 
  } = useDeprecatedContractWrite({
    ...tokenContract,
    functionName: 'approve',
  });

  // Balance
  const balance = useContractRead({
    ...tokenContract,
    functionName: 'balanceOf',
    args: [address],
    watch: true,
    cacheOnBlock: true,
    enabled: isConnected,
  });

  // Buy
  const { 
    writeAsync: buy 
  } = useDeprecatedContractWrite({
    ...tokenContract,
    functionName: 'buyFor',
  });

  // Sell
  const { 
    writeAsync: sell 
  } = useDeprecatedContractWrite({
    ...tokenContract,
    functionName: 'sell',
  });

  // Staking allowance
  const stakingAllowance = useContractRead({
    ...tokenContract,
    functionName: 'allowance',
    args: [address, STAKING[chain?.id]?.address],
    watch: true,
    cacheOnBlock: true,
    enabled: isConnected,
  });

  // Staking allowance
  const tokenAllowance = useContractRead({
    ...tokenContract,
    functionName: 'allowance',
    args: [address, TOKEN[chain?.id]?.address],
    watch: true,
    cacheOnBlock: true,
    enabled: isConnected,
  });

  console.log({ tokenContract })

  // Total Supply
  const totalSupply = useContractRead({
    ...tokenContract,
    functionName: 'totalSupply',
    watch: true,
    cacheOnBlock: true,
    enabled: isConnected,
  });

  console.log({ totalSupply })

  return {
    approve,
    balance,
    buy,
    sell,
    stakingAllowance,
    tokenAllowance,
    totalSupply,
  }
}

export default useToken;