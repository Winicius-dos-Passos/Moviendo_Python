import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <main className="flex-1 ml-20">
        <Outlet />
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#F3F4F6',
            border: '1px solid #7B2CBF',
          },
          success: {
            iconTheme: {
              primary: '#7B2CBF',
              secondary: '#F3F4F6',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#F3F4F6',
            },
          },
        }}
      />
    </div>
  );
};

export default MainLayout;
