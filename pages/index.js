import Head from "next/head";
// Components
import Notification from "../components/utils/Notification.jsx";
import XGrapeMinter from "../components/XGrapeMinter.jsx";
import XGrapeGrapeLpZap from "../components/XGrapeGrapeLpZap.jsx";
import XGrapeRatios from "../components/XGrapeRatios.jsx";

// Context
import NotificationContext from "../context/NotificationContext";
// Hooks
import useNotification from "../hooks/useNotification";
import BackgroundGlows from "./BackgroundGlows";

export default function Home() {
  const notification = useNotification();
  const notificationState = {
    ...notification,
  };

  return (
    <div style={{ backgroundColor: "black" }}>
      <Head>
        <title>Grape Finance</title>
        <meta name="description" content="Grape Finance MIM pegged algo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <BackgroundGlows />
      <main>
        <NotificationContext.Provider value={notificationState}>
          <Notification />
          <div
            style={{ marginBottom: "30px" }}
            className="grid grid-cols-6 gap-4"
          >
            <div
              style={{
                zIndex: 1,
                borderRadius: "6px",
                backgroundColor: "rgba(230, 71, 230, 0.3) !important",
              }}
              className="md:col-start-2 md:col-span-4 col-span-6 mt-10"
            >
              <XGrapeRatios />
            </div>
            <div
              style={{
                zIndex: 1,
                borderRadius: "6px",
                backgroundColor: "rgba(230, 71, 230, 0.3) !important",
              }}
              className="md:col-start-2 md:col-span-4 col-span-6"
            >
              <XGrapeGrapeLpZap />
            </div>
            <div
              style={{
                zIndex: 1,
                borderRadius: "6px",
                backgroundColor: "rgba(250, 91, 250, 0.6) !important",
              }}
              className="md:col-start-2 md:col-span-4 col-span-6"
            >
              <XGrapeMinter />
            </div>
          </div>
        </NotificationContext.Provider>
      </main>
    </div>
  );
}
