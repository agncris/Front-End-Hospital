import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import CryptoJS from "crypto-js";
import { sanitizeString } from '../utils/sanitize';

const AuthContext = createContext(null);

// Mock users database
const MOCK_USERS = {
  'admin@hospital.cl': {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    permissions: ['manage_doctors', 'manage_patients', 'view_reports']
  },
  'doctor@hospital.cl': {
    username: 'doctor',
    password: 'doctor123',
    role: 'doctor',
    permissions: ['view_patients', 'manage_appointments']
  },
  'staff@hospital.cl': {
    username: 'staff',
    password: 'staff123',
    role: 'staff',
    permissions: ['view_appointments', 'manage_basic_info']
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jwtToken, setJwtToken] = useState(() => {
    const token = localStorage.getItem('jwtToken');
    return token || null;
  });
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState(() => {
    const storedPreferences = localStorage.getItem('userPreferences');
    return storedPreferences ? JSON.parse(storedPreferences) : {};
  });

  const apiKey = import.meta.env.VITE_API_KEY || 'YOUR_API_KEY_HERE';
  const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY || 'your-fallback-encryption-key';

  const sanitizeInput = useCallback((input) => {
    return sanitizeString(input);
  }, []);

  const sanitizeUserData = useCallback((userData) => {
    return {
      ...userData,
      nombre: sanitizeString(userData.nombre),
      email: sanitizeString(userData.email),
      rol: sanitizeString(userData.rol)
    };
  }, []);

  const encryptData = useCallback((data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
  }, [encryptionKey]);

  const decryptData = useCallback((encryptedData) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }, [encryptionKey]);

  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  const isTokenValid = useCallback(() => {
    if (!jwtToken) return false;
    try {
      const decodedToken = decodeToken(jwtToken);
      return decodedToken.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }, [jwtToken]);

  const login = useCallback(async (credentials) => {
    try {
      const sanitizedCredentials = {
        email: sanitizeInput(credentials.email),
        password: sanitizeInput(credentials.password),
      };

      const user = MOCK_USERS[sanitizedCredentials.email];
      
      if (!user || user.password !== sanitizedCredentials.password) {
        throw new Error('Credenciales inválidas');
      }

      const userData = {
        username: user.username,
        email: sanitizedCredentials.email,
        role: user.role,
        permissions: user.permissions
      };

      setJwtToken(btoa(JSON.stringify({ ...userData, exp: Date.now() + 3600000 })));
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
      setError(null);

      return userData;
    } catch (error) {
      setError(error.message);
      console.error('Error de login:', error);
      throw error;
    }
  }, [sanitizeInput]);

  const logout = useCallback(() => {
    setJwtToken(null);
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('jwtToken');
  }, []);

  useEffect(() => {
    if (jwtToken) {
      if (!isTokenValid()) {
        logout();
      } else {
        setIsAuthenticated(true);
        try {
          setUser(decodeToken(jwtToken));
        } catch (error) {
          logout();
        }
      }
    }
  }, [jwtToken, isTokenValid, logout]);

  // Add function to check permissions
  const hasPermission = useCallback((permission) => {
    return user?.permissions?.includes(permission) || false;
  }, [user]);

  const updatePreferences = useCallback((newPreferences) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
  }, [preferences]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      jwtToken,
      user,
      hasPermission,
      isTokenValid,
      error,
      preferences,
      updatePreferences // Expose the function to update preferences
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
