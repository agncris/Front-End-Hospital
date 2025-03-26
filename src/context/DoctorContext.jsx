import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import CryptoJS from 'crypto-js';
import useFetch from '../hooks/useFetch';
import { sanitizeString } from '../utils/sanitize';

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const { jwtToken, isTokenValid } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const apiKey = import.meta.env.VITE_API_KEY || 'YOUR_API_KEY_HERE';
  const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY || 'your-fallback-encryption-key';

  const sanitizeInput = useCallback((input) => {
    return sanitizeString(input);
  }, []);

  const encryptSensitiveData = useCallback((data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
  }, [encryptionKey]);

  const decryptSensitiveData = useCallback((encryptedData) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }, [encryptionKey]);

  const { data, loading, error, fetchData } = useFetch("http://localhost:3001/doctors", {
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'x-api-key': apiKey,
    },
  });

  useEffect(() => {
    if (isTokenValid()) {
      fetchData();
    }
  }, [isTokenValid, fetchData]);

  useEffect(() => {
    if (data) {
      const decryptedDoctors = data.map(doctor => ({
        ...doctor,
        nombre: doctor.nombre,
        especialidad: doctor.especialidad,
        descripcion: doctor.descripcion,
        contacto: decryptSensitiveData(doctor.contacto),
        disponibilidad: doctor.disponibilidad,
        consultas: doctor.consultas,
        imagen: doctor.imagen,
        pacientes: doctor.pacientes ? decryptSensitiveData(doctor.pacientes) : [],
      }));
      setDoctors(decryptedDoctors);
    }
  }, [data, decryptSensitiveData]);

  return (
    <DoctorContext.Provider value={{ doctors, loading, error }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctors = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctors debe usarse dentro de DoctorProvider');
  }
  return context;
};
