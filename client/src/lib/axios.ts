import axios from 'axios';
import env from '@/config/env';

const API = axios.create({
  baseURL: env.apiUrl || 'http://localhost:5000',
  withCredentials: true, // send cookies (e.g., JWT token in httpOnly cookie)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
