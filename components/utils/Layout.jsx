import NextHead from "next/head";
// components
import MenuTop from "./MenuTop";

export default function layout({ children }) {
  // @ts-ignore
  const pageName = { pageName: children?.type?.name };

  return (
    <div style={{background: '#000'}}>
      <NextHead>
        <title>Grape Finance - {pageName.pageName}</title>
      </NextHead>
      <div className="h-full min-h-screen relative flex flex-col font-tommy">
        <div className="h-full grow flex flex-col">
          <MenuTop />
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
