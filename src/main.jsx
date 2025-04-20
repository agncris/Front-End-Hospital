import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/main.css';
import { AuthProvider } from './context/AuthContext';
import { DoctorProvider } from './context/DoctorContext';
import { AppointmentProvider } from './context/AppointmentContext';
import ErrorBoundary from './ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <DoctorProvider>
            <AppointmentProvider>
              <App />
            </AppointmentProvider>
          </DoctorProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Registrar el service worker solo en producción
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker registrado:', registration.scope);
    } catch (error) {
      console.error('Error al registrar el Service Worker:', error);
    }
  });
}
