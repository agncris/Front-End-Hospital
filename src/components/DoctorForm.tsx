import React from 'react';
import { useForm } from '../hooks/useForm';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { Doctor } from '../types/interfaces';

interface DoctorFormData {
  nombre: string;
  especialidad: string;
  descripcion: string;
  experiencia: number;
}

const DoctorForm: React.FC = () => {
  const { execute: addDoctor, loading, error } = useApi<Doctor>(api.addDoctor);
  
  const {
    values,
    errors,
    handleChange,
    handleSubmit
  } = useForm<DoctorFormData>({
    nombre: '',
    especialidad: '',
    descripcion: '',
    experiencia: 0
  });

  const onSubmit = async (data: DoctorFormData) => {
    try {
      await addDoctor(data);
      // Handle success
    } catch (err) {
      // Handle error
    }
  };

  // ...existing render code...
};

export default DoctorForm;
