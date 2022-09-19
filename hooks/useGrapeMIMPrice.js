import { useEffect, useState } from "react";
import { useNetwork, useContractRead } from "wagmi";
import { getDefaultProvider } from "ethers";

// constants
import { MIM, GRAPE_MIM } from "../constants";

export const useGrapeMIMPrice = () => {
  const { chain } = useNetwork();
  const provider = getDefaultProvider();
  const [wineMIMLPPrice, setWineMIMLPPrice] = useState();

  const LPContract = {
    addressOrName: GRAPE_MIM[chain?.id]?.address,
    contractInterface: GRAPE_MIM[chain?.id]?.abi,
  };

  const mimContract = {
    addressOrName: MIM[chain?.id]?.address,
    contractInterface: MIM[chain?.id]?.abi,
  };

  const { data: grapeMIMSupply } = useContractRead({
    ...LPContract,
    functionName: "totalSupply",
  });

  const { data: mimBalance } = useContractRead({
    ...mimContract,
    functionName: "balanceOf",
    args: [LPContract.addressOrName],
  });

  useEffect(() => {
    async function retrievePrice() {
      const fixedLPSupply = Number(grapeMIMSupply) / Math.pow(10, 18);
      const fixedMIMBalance = Number(mimBalance) / Math.pow(10, 18);
      const fixedLPPrice = ((fixedMIMBalance * 2) / fixedLPSupply).toFixed(2)
      setWineMIMLPPrice(fixedLPPrice);
    }
    if (chain && provider && grapeMIMSupply && mimBalance) {
      retrievePrice();
    }
  }, [chain, provider, grapeMIMSupply, mimBalance]);

  return wineMIMLPPrice;
};

export default useGrapeMIMPrice;
