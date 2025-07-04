import React from 'react'
import ReactDOM from 'react-dom/client'
import Router from './router'
import './index.scss'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          color: '#333',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  </React.StrictMode>,
)
