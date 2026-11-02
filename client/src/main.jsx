import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1F2A30', color: '#F5F2EB', fontSize: '14px', borderRadius: '8px' },
            success: { iconTheme: { primary: '#3E7B5A', secondary: '#FFFFFF' } },
            error:   { iconTheme: { primary: '#A63A2B', secondary: '#FFFFFF' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
