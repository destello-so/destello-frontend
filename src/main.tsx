
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.scss'
import Router from './router'

createRoot(document.getElementById('root')!).render(
  <>
    <Router />
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          color: '#374151',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  </>,
)
