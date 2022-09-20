import { useEffect, useState } from "react";
import { useNetwork, useContractRead } from "wagmi";

// constants
import { XGRAPEORACLE } from "../constants";

export const useCalculatePrice = () => {
  const [price, setPrice] = useState();
  const { chain } = useNetwork();
  
  const xGrapeOracleContract = {
    addressOrName: XGRAPEORACLE[chain?.id]?.address,
    contractInterface: XGRAPEORACLE[chain?.id]?.abi,
  };

  const { data: calculatedPrice } = useContractRead({
    ...xGrapeOracleContract,
    functionName: "calculatePrice",
  });


  useEffect(() => {
    async function retrievePrice() {
      setPrice((calculatedPrice / 1e18).toFixed(3));
    }
    if (calculatedPrice) {
      retrievePrice();
    }
  }, [calculatedPrice]);

  return price;
};

export default useCalculatePrice;
