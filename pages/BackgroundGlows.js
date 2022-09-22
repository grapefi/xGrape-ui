import React from "react";
import heroImg from "../public/img/grape-glass-bg.png";
import background1 from "../public/img/backgroundblur.png";
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
          zIndex: 1,
        }}
      >
        <Image src={heroImg} alt={"GRAPE Logo"} />
      </span>

      <span className="background-blur">
        <Image
          alt="background"
          src={background1}
          layout="fill"
          className="fixed-image"
        />
      </span>
    </>
  );
}

export default BackgroundGlows;
