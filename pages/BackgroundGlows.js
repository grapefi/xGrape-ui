import React from "react";
import heroImg from "../public/img/grape-glass-bg.png";
import background1 from "../public/img/background1.png";
import background2 from "../public/img/background2.png";
import Image from "next/image";

function BackgroundGlows() {
  return (
    <>
      <span
        style={{
          opacity: 0.5,
          position: "fixed",
          top: "20%",
          right: "0",
          zIndex: 1
        }}
      >
        <Image src={heroImg} alt={"GRAPE Logo"} />
      </span>

      <span className="back-logo3">
        <Image alt="background" src={background1} />
      </span>
      <span className="back-glow-2">
        <Image alt="background" src={background2} />
      </span>
    </>
  );
}

export default BackgroundGlows;
