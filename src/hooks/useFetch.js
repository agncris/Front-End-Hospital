import { useState, useCallback } from 'react';

const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCallTime, setLastCallTime] = useState(0);
  const minCallInterval = 1000; // 1 second minimum between calls

  const fetchData = useCallback(async (url, options = {}) => {
    const now = Date.now();
    if (now - lastCallTime < minCallInterval) {
      throw new Error('Please wait before making another request');
    }
    setLastCallTime(now);

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cargar los datos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lastCallTime]);

  return { fetchData, loading, error };
};

export default useFetch;