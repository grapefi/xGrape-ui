import { useEffect, useState } from "react";
import { useNetwork, useContractRead } from "wagmi";
import { getDefaultProvider } from "ethers";

// constants
import { PRICEORACLE } from "../constants";

export const useGrapeMIMPrice = () => {
  const { chain } = useNetwork();
  const provider = getDefaultProvider();
  const [wineMIMLPPrice, setWineMIMLPPrice] = useState();

  const priceOracleContract = {
    addressOrName: PRICEORACLE[chain?.id]?.address,
    contractInterface: PRICEORACLE[chain?.id]?.abi,
  };

  const { data: grapeMIMLPPrice } = useContractRead({
    ...priceOracleContract,
    functionName: "grapeSwLPVal",
  });

  useEffect(() => {
    async function retrievePrice() {
      const price = Number(grapeMIMLPPrice) / Math.pow(10, 18);
      setWineMIMLPPrice(price.toFixed(3));
    }
    if (chain && provider && grapeMIMLPPrice) {
      retrievePrice();
    }
  }, [chain, provider, grapeMIMLPPrice]);

  return wineMIMLPPrice;
};

export default useGrapeMIMPrice;
