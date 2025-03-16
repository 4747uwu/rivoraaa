import { Toaster } from 'react-hot-toast';

const NotificationToast = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        className: 'dark:bg-gray-800 dark:text-white',
        style: {
          background: 'var(--toast-bg)',
          color: 'var(--toast-color)',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: 'white',
          },
        },
      }}
    />
  );
};

export default NotificationToast;