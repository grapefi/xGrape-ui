import { useEffect, useState } from "react";
import { useNetwork, useContractRead } from "wagmi";

// constants
import { GRAPE_MIM_SW_MAGIK } from "../constants";

export const useGetPricePerFullShare = () => {
  const [price, setPrice] = useState();
  const { chain } = useNetwork();
  
  const GrapeMIMContract = {
    addressOrName: GRAPE_MIM_SW_MAGIK[chain?.id]?.address,
    contractInterface: GRAPE_MIM_SW_MAGIK[chain?.id]?.abi,
  };

  const { data: pricePerFullShare } = useContractRead({
    ...GrapeMIMContract,
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
