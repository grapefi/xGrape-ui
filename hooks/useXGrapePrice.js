import { useEffect, useState } from "react";
import { useNetwork, useContractRead } from "wagmi";
import { getDefaultProvider } from "ethers";

// constants
import { XGRAPEORACLE } from "../constants";

export const useXGrapePrice = () => {
  const [price, setPrice] = useState();
  const { chain } = useNetwork();

  const xGrapeOracleContract = {
    addressOrName: XGRAPEORACLE[chain?.id]?.address,
    contractInterface: XGRAPEORACLE[chain?.id]?.abi,
  };

  const { data: xGrapePrice } = useContractRead({
    ...xGrapeOracleContract,
    functionName: "xGrapePrice",
  });

  useEffect(() => {
    async function retrievePrice() {
      const formattedxGrapePrice = Number(xGrapePrice) / Math.pow(10, 18);
      setPrice(formattedxGrapePrice.toFixed(3));
    }
    if (xGrapePrice) {
      retrievePrice();
    }
  }, [xGrapePrice]);

  return price;
};

export default useXGrapePrice;
