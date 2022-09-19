// Hooks
import useCalculatePrice from "../hooks/useCalculatePrice";
import useGetPricePerFullShare from "../hooks/useGetPricePerFullShare";
import useGrapeMIMPrice from "../hooks/useGrapeMIMPrice";
import { useState } from "react";

export function XGrapeRatios() {
  const xGrapeToMagikLP = useCalculatePrice();
  const magikLpToGrapeMIM = useGetPricePerFullShare();
  const grapeMIMPrice = useGrapeMIMPrice();

  const [seeMoreData, setSeeMoreData] = useState(false);

  return (
    <div className="" style={{ color: "white" }}>
      <div style={{ padding: "10px" }}>
        {grapeMIMPrice && (
          <div>
            1 xGrape = ${(xGrapeToMagikLP * magikLpToGrapeMIM * grapeMIMPrice).toFixed(3)}
            <button className="btn-app" style={{marginLeft: '20px', cursor: 'pointer', fontSize: '0.6rem'}} onClick={() => setSeeMoreData(!seeMoreData)}>
             More Details
            </button>
          </div>
        )}
        {seeMoreData && (
          <div style={{marginTop: '10px'}}>
            {xGrapeToMagikLP && (
              <div>1 xGrape = {xGrapeToMagikLP} Magik LP</div>
            )}
            {magikLpToGrapeMIM && (
              <div>1 Magik LP = {magikLpToGrapeMIM} Grape-MIM SW LP</div>
            )}
            {grapeMIMPrice && <div>1 Grape-MIM SW LP = ${grapeMIMPrice}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default XGrapeRatios;
