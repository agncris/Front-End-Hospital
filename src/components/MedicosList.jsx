import React, { useState, useEffect, useCallback } from 'react';
import DoctorCard from './DoctorCard';
import ServiceList from './ServiceList';

const MedicosList = () => {
  const [medicos, setMedicos] = useState([]);
  const [services, setServices] = useState([]);
  const [filtroExperiencia, setFiltroExperiencia] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulated API call with artificial delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const medicosData = [
        {
          nombre: "Dr. Benjamín Soto",
          especialidad: "Pediatra",
          descripcion: "Graduado en la universidad de La Salud, especialista en niños.",
          experiencia: 6,
          contacto: {
            telefono: "+56 9 1234 5678",
            email: "benjamin.soto@hospital.cl"
          },
          disponibilidad: {
            lunes: "09:00 - 13:00",
            martes: "14:00 - 18:00",
            viernes: "09:00 - 13:00"
          },
          consultas: [
            { dia: "Lunes", horas: 5 },
            { dia: "Miércoles", horas: 4 },
            { dia: "Viernes", horas: 8 }
          ],
          imagen: "https://www.sonicseo.com/wp-content/uploads/2020/07/surgeon-768x768.jpg"
        },
        {
          nombre: "Dr. Fermín Fernández",
          especialidad: "Psiquiatra",
          descripcion: "Especialista en hacerle olvidar sus problemas.",
          experiencia: 2,
          contacto: {
            telefono: "+56 9 8765 4321",
            email: "fermin.fernandez@hospital.cl"
          },
          disponibilidad: {
            martes: "09:00 - 12:00",
            jueves: "14:00 - 18:00"
          },
          consultas: [
            { dia: "Lunes", horas: 7 },
            { dia: "Miércoles", horas: 2 },
            { dia: "Viernes", horas: 6 }
          ],
          imagen: "https://pngimg.com/uploads/doctor/doctor_PNG16041.png"
        },
        {
          nombre: "Dr. Zenior",
          especialidad: "Oftalmólogo",
          descripcion: "Especialista en problemas de visión.",
          experiencia: 50,
          contacto: {
            telefono: "+56 9 5555 5555",
            email: "zenior.vision@hospital.cl"
          },
          disponibilidad: {
            lunes: "10:00 - 14:00",
            jueves: "08:00 - 12:00",
            viernes: "12:00 - 16:00"
          },
          consultas: [
            { dia: "Lunes", horas: 9 },
            { dia: "Miércoles", horas: 2 },
            { dia: "Viernes", horas: 2 }
          ],
          imagen: "https://www.stockvault.net/data/2015/09/01/177580/preview16.jpg"
        }
      ];
      const servicesData = [
        { id: 1, name: "Pediatría" },
        { id: 2, name: "Psiquiatría" },
        { id: 3, name: "Oftalmología" }
      ];
      
      setMedicos(medicosData);
      setServices(servicesData);
    } catch (err) {
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []); // Only run on mount

  const handleRefresh = () => {
    fetchData();
  };

  const handleFiltroExperienciaChange = (e) => {
    setFiltroExperiencia(e.target.value);
  };

  const handleFiltroEspecialidadChange = (e) => {
    setFiltroEspecialidad(e.target.value);
  };

  const filteredMedicos = medicos.filter((medico) => {
    return (
      (filtroExperiencia === '' || medico.experiencia >= parseInt(filtroExperiencia)) &&
      (filtroEspecialidad === '' || medico.especialidad === filtroEspecialidad)
    );
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button 
          className="btn btn-primary" 
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Actualizar lista'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <label htmlFor="filtroExperiencia" className="form-label">Años de experiencia</label>
          <select id="filtroExperiencia" className="form-select" value={filtroExperiencia} onChange={handleFiltroExperienciaChange}>
            <option value="">Todos...</option>
            <option value="5">Más de 5 años</option>
            <option value="10">Más de 10 años</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label htmlFor="filtroEspecialidad" className="form-label">Especialidad</label>
          <select id="filtroEspecialidad" className="form-select" value={filtroEspecialidad} onChange={handleFiltroEspecialidadChange}>
            <option value="">Todos...</option>
            <option value="Pediatra">Pediatra</option>
            <option value="Psiquiatra">Psiquiatra</option>
            <option value="Oftalmólogo">Oftalmólogo</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row">
            {filteredMedicos.map((medico) => (
              <div key={medico.email} className="col-12 col-md-6 col-lg-4 mb-4">
                <DoctorCard doctor={medico} />
              </div>
            ))}
          </div>
          <ServiceList services={services} />
        </>
      )}
    </div>
  );
};

export default MedicosList;