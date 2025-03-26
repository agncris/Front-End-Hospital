import { Doctor, User } from '../types/interfaces';

const API_URL = 'http://localhost:3001';

export const api = {
  // Doctors
  getDoctors: async (token: string): Promise<Doctor[]> => {
    const response = await fetch(`${API_URL}/doctors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Error fetching doctors');
    return response.json();
  },

  addDoctor: async (token: string, doctor: Omit<Doctor, 'id'>): Promise<Doctor> => {
    const response = await fetch(`${API_URL}/doctors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doctor),
    });
    if (!response.ok) throw new Error('Error adding doctor');
    return response.json();
  },

  // Authentication
  login: async (credentials: { email: string; password: string }): Promise<{ token: string; user: User }> => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Invalid credentials');
    return response.json();
  },
};
