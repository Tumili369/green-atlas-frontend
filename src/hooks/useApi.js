import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;

export function useApi(endpoint, params = {}) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios.get(`${BASE}${endpoint}`, { params })
      .then(r => { if (!cancelled) { setData(r.data); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [endpoint, JSON.stringify(params)]);

  return { data, loading, error };
}

export const api = {
  get:    (url, cfg)  => axios.get(`${BASE}${url}`, cfg),
  post:   (url, body, cfg) => axios.post(`${BASE}${url}`, body, cfg),
  put:    (url, body, cfg) => axios.put(`${BASE}${url}`, body, cfg),
  delete: (url, cfg)  => axios.delete(`${BASE}${url}`, cfg),
};
