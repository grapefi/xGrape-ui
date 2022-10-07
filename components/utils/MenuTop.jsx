import Image from "next/image";
// Components
import Connect from "./Connect";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function MenuTop() {
  const matches = useMediaQuery("(min-width:500px)");

  return (
    <div
      className="sticky top-0"
      style={{
        zIndex: 2,
        background:
          "linear-gradient(144deg, rgb(0, 0, 0) 10%, rgba(120, 19, 120, 0.9) 50%, rgba(50, 50, 50, 0.8))",
        boxShadow: "50px 4px 26px -18px rgba(0,0,0,0.99) !important",
      }}
    >
      <div className="navbar">
        <div className="flex-1">
          <a href="https://grapefinance.app">
            <Image
              src={matches ? "/img/logo-horizontal.png" : "/img/logo-icon.png"}
              alt="Logo"
              width={matches ? 310 : 50}
              height={45}
              priority
            />
          </a>
        </div>
        <div className="flex-none mr-5">
          <a
            rel="noreferrer"
            target="_blank"
            href="https://grape-finance.gitbook.io/grape-finance-docs/unique-features/xgrape-grapevine"
            className="btn-app w-full"
          >
            Docs
          </a>
        </div>
        <div className="flex-none mr-5 ">
          <a
            rel="noreferrer"
            target="_blank"
            href="https://app.bogged.finance/avax/swap?tokenIn=0x130966628846BFd36ff31a822705796e8cb8C18D&tokenOut=0x5541D83EFaD1f281571B343977648B75d95cdAC2"
            className="btn-app w-full hide-on-mobile"
          >
            Buy Grape
          </a>
        </div>
        <div className="flex-none">
          <Connect />
        </div>
      </div>
    </div>
  );
}
