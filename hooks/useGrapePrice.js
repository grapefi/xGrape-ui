import { useEffect, useState } from "react";
import { useNetwork, useContractRead } from "wagmi";
import { getDefaultProvider } from "ethers";

// constants
import { GRAPE, GRAPEMIM, MIM } from "../constants";

export const useGrapePrice = () => {
  const [grapePrice, setGrapePrice] = useState();
  const { chain } = useNetwork();
  
  const GrapeMIMContract = {
    addressOrName: GRAPEMIM[chain?.id]?.address,
    contractInterface: GRAPEMIM[chain?.id]?.abi,
  };

  const grapeContract = {
    addressOrName: GRAPE[chain?.id]?.address,
    contractInterface: GRAPE[chain?.id]?.abi,
  };

  const mimContract = {
    addressOrName: MIM[chain?.id]?.address,
    contractInterface: MIM[chain?.id]?.abi,
  };

  const { data: grapeBalanceInGrapeMIM } = useContractRead({
    ...grapeContract,
    functionName: "balanceOf",
    args: [GrapeMIMContract.addressOrName],
  });

  const { data: mimBalanceInGrapeMIM } = useContractRead({
    ...mimContract,
    functionName: "balanceOf",
    args: [GrapeMIMContract.addressOrName],
  });

  useEffect(() => {
    async function retrievePrice() {
      setGrapePrice((+mimBalanceInGrapeMIM / +grapeBalanceInGrapeMIM).toFixed(3));
    }
    if (grapeBalanceInGrapeMIM && mimBalanceInGrapeMIM) {
      retrievePrice();
    }
  }, [grapeBalanceInGrapeMIM, mimBalanceInGrapeMIM]);

  return grapePrice;
};

export default useGrapePrice;
