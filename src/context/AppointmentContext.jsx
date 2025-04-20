import React, { createContext, useContext, useState, useEffect } from 'react';
import { addAppointment, getAppointments, deleteAppointment } from '../utils/indexedDB';

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const data = await getAppointments();
      setAppointments(data);
    };
    fetchAppointments();
  }, []);

  const addNewAppointment = async (appointment) => {
    const id = await addAppointment(appointment);
    setAppointments((prev) => [...prev, { ...appointment, id }]);
  };

  const removeAppointment = async (id) => {
    await deleteAppointment(id);
    setAppointments((prev) => prev.filter((appt) => appt.id !== id));
  };

  return (
    <AppointmentContext.Provider value={{ appointments, addNewAppointment, removeAppointment }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
