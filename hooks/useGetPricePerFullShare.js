import { useEffect, useState } from "react";
import { useNetwork, useContractRead } from "wagmi";

// constants
import { XGRAPEORACLE } from "../constants";

export const useGetPricePerFullShare = () => {
  const [price, setPrice] = useState();
  const { chain } = useNetwork();
  
  
  const xGrapeOracleContract = {
    addressOrName: XGRAPEORACLE[chain?.id]?.address,
    contractInterface: XGRAPEORACLE[chain?.id]?.abi,
  };

  const { data: pricePerFullShare } = useContractRead({
    ...xGrapeOracleContract,
    functionName: "getPricePerFullShare",
  });


  useEffect(() => {
    async function retrievePrice() {
      setPrice((pricePerFullShare / 1e18).toFixed(3))
    }
    if (pricePerFullShare) {
      retrievePrice();
    }
  }, [pricePerFullShare]);

  return price;
};

export default useGetPricePerFullShare;
