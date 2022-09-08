import Head from 'next/head';
// Components
import Notification from '../components/utils/Notification.jsx';
import XGrapeMinter from '../components/XGrapeMinter.jsx';
import XGrapeGrapeLpZap from '../components/XGrapeGrapeLpZap.jsx';
// Context
import NotificationContext from '../context/NotificationContext';
// Hooks
import useNotification from '../hooks/useNotification';

export default function Home() {
  const notification = useNotification();
  const notificationState = {
    ...notification
  }

  return (
    <div>
      <Head>
        <title>Grape Finance</title>
        <meta name="description" content="Grape Finance MIM pegged algo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <NotificationContext.Provider value={notificationState}>
          <Notification />

          <div className="grid grid-cols-6 gap-4 mt-10">
            <div className="md:col-start-2 md:col-span-4 col-span-6">
              <XGrapeMinter />
            </div>
            <div className="md:col-start-2 md:col-span-4 col-span-6">
              <XGrapeGrapeLpZap />
            </div>
          </div>
        </NotificationContext.Provider>
      </main>

    </div>
  )
}
