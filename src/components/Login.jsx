import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, error } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(credentials);
      console.log('Login successful:', userData);

      if (userData && userData.role) {
        switch (userData.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'doctor':
            navigate('/doctor/dashboard');
            break;
          case 'staff':
            navigate('/staff/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      console.error('Error during login:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Login</h2>
      {error && <p className="text-danger text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="col-md-6 mx-auto">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
};

export default Login;
