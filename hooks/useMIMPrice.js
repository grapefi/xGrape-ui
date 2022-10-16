import { useEffect, useState } from "react";
import { useNetwork, useContractRead } from "wagmi";
import { getDefaultProvider } from "ethers";

// constants
import { PRICEORACLE } from "../constants";

export const useMIMPrice = () => {
  const { chain } = useNetwork();
  const provider = getDefaultProvider();
  const [wineMIMLPPrice, setWineMIMLPPrice] = useState();

  const priceOracleContract = {
    addressOrName: PRICEORACLE[chain?.id]?.address,
    contractInterface: PRICEORACLE[chain?.id]?.abi,
  };

  const { data: MIMPrice } = useContractRead({
    ...priceOracleContract,
    functionName: "latestMimPriceFormatted",
  });

  useEffect(() => {
    async function retrievePrice() {
      const price = Number(MIMPrice) / Math.pow(10, 18);
      setWineMIMLPPrice(price.toFixed(3));
    }
    if (chain && provider && MIMPrice) {
      retrievePrice();
    }
  }, [chain, provider, MIMPrice]);

  return wineMIMLPPrice;
};

export default useMIMPrice;
