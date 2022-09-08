import { useContext } from 'react';
// Components
import { X } from 'react-feather';
// Context
import NotificationContext from '../../context/NotificationContext';

const Notification = () => {
  const { dismissNotification, showNotification, notification } = useContext(NotificationContext);

  const notificationIcon = () => {
    switch (notification?.type) {
      case 'error': return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      default: return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  }

  const goToLink = () => {
    if (!notification.link) return;
    window.open(
      notification.link,
      '_blank' // open in a new window.
    );
  }

  const trimDescription = (desc) => {
    if (typeof desc !== 'string') return desc;
    if (desc.length < 100) return desc;
    return desc.slice(0, 100) + '...'
  }

  return (
    <div className={`z-10 toast toast-top toast-end ${showNotification ? '' : 'invisible'}`}>
      <div className={`border-2 rounded-md p-5 bg-slate-50 ${notification?.type === 'error' ? 'border-error' : 'border-success'} flex items-start shadow-xl max-w-sm break-words`}>
        <div className="flex items-top">
          <div className="ml-2 mr-6 cursor-pointer break-words" onClick={() => goToLink()}>
            <span className="font-semibold">
              <div className="flex items-center"> 
                <span className="mr-2">{ notificationIcon() }</span>
                <span>{notification?.title}</span>
              </div>
            </span>
            <span className="block mt-2">{trimDescription(notification?.description)}</span>
          </div>
        </div>
        <div className="cursor-pointer flex items-center" onClick={() => dismissNotification()}>
          <X className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default Notification;