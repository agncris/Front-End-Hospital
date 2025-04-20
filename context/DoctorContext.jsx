import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import DOMPurify from 'dompurify';
import CryptoJS from 'crypto-js';
import PropTypes from 'prop-types';

// Crear el contexto
const DoctorContext = createContext();

// Proveedor del contexto
export const DoctorProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { jwtToken, isTokenValid } = useAuth();
  const apiKey = import.meta.env.VITE_API_KEY;
  const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;

  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input);
  };

  const encryptSensitiveData = (data) => {
    if (!encryptionKey) {
      throw new Error('Falta la clave de encriptación');
    }
    return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
  };

  const decryptSensitiveData = (encryptedData) => {
    if (!encryptionKey) {
      throw new Error('Falta la clave de encriptación');
    }
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Error al desencriptar datos:', error);
      return null;
    }
  };

  const fetchDoctors = useCallback(async () => {
    if (!isTokenValid()) {
      setError('Token no válido o expirado');
      setLoading(false);
      return;
    }

    if (!apiKey) {
      setError('Falta la clave API');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3001/doctors", {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'x-api-key': apiKey,
        },
      });
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      const data = await response.json();
      
      const decryptedDoctors = data.map(doctor => {
        try {
          return {
            ...doctor,
            nombre: sanitizeInput(doctor.nombre),
            especialidad: sanitizeInput(doctor.especialidad),
            descripcion: sanitizeInput(doctor.descripcion),
            contacto: decryptSensitiveData(doctor.contacto),
            disponibilidad: Object.fromEntries(
              Object.entries(doctor.disponibilidad).map(([key, value]) => [key, sanitizeInput(value)])
            ),
            consultas: doctor.consultas.map(consulta => ({
              dia: sanitizeInput(consulta.dia),
              horas: consulta.horas,
            })),
            imagen: sanitizeInput(doctor.imagen),
            pacientes: doctor.pacientes ? decryptSensitiveData(doctor.pacientes) : [],
          };
        } catch (error) {
          console.error('Error al procesar doctor:', error);
          return null;
        }
      }).filter(Boolean);

      setDoctors(decryptedDoctors);
    } catch (error) {
      console.error("Error al obtener doctores:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [jwtToken, isTokenValid, apiKey, encryptionKey]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return (
    <DoctorContext.Provider value={{ 
      doctors, 
      loading, 
      error, 
      fetchDoctors,
      encryptSensitiveData,
      decryptSensitiveData 
    }}>
      {children}
    </DoctorContext.Provider>
  );
};

DoctorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook para usar el contexto fácilmente
export const useDoctors = () => useContext(DoctorContext);
