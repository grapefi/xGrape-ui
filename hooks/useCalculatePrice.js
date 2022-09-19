import { useEffect, useState } from "react";
import { useNetwork, useContractRead } from "wagmi";

// constants
import { XGRAPE } from "../constants";

export const useCalculatePrice = () => {
  const [price, setPrice] = useState();
  const { chain } = useNetwork();
  
  const XGrapeContract = {
    addressOrName: XGRAPE[chain?.id]?.address,
    contractInterface: XGRAPE[chain?.id]?.abi,
  };

  const { data: calculatedPrice } = useContractRead({
    ...XGrapeContract,
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
