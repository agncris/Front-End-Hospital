import { createContext, useContext, useState } from 'react';
import jwtDecode from 'jwt-decode';
import DOMPurify from 'dompurify';
import CryptoJS from 'crypto-js';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jwtToken, setJwtToken] = useState(null);
  const apiKey = import.meta.env.VITE_API_KEY;
  const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;

  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input);
  };

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(data, encryptionKey).toString();
  };

  const decryptData = (encryptedData) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const login = async (credentials) => {
    try {
      if (!apiKey || !encryptionKey) {
        throw new Error('Faltan las claves de configuración');
      }

      const sanitizedCredentials = {
        username: sanitizeInput(credentials.username),
        password: sanitizeInput(credentials.password),
      };
      const encryptedCredentials = {
        username: encryptData(sanitizedCredentials.username),
        password: encryptData(sanitizedCredentials.password),
      };
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(encryptedCredentials),
      });
      const data = await response.json();
      if (response.ok) {
        setJwtToken(data.token);
        setIsAuthenticated(true);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setJwtToken(null);
  };

  const isTokenValid = () => {
    if (!jwtToken) return false;
    try {
      const decodedToken = jwtDecode(jwtToken);
      return decodedToken.exp * 1000 > Date.now();
    } catch (error) {
      console.error('Error al validar el token:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, jwtToken, isTokenValid }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
