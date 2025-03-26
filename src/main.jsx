import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/main.css';
import { AuthProvider } from './context/AuthContext';
import { DoctorProvider } from './context/DoctorContext';
import { AppointmentProvider } from './context/AppointmentContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import ErrorBoundary from './ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <DoctorProvider>
          <AppointmentProvider>
            <App />
          </AppointmentProvider>
        </DoctorProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker
serviceWorkerRegistration.register();
