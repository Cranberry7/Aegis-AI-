import axios from 'axios';

export const axiosBackendInstance = axios.create({
  baseURL: import.meta.env.VITE_AGENT_BACKEND_BASE_URL,
  withCredentials: true,
});

export const axiosCoreInstance = axios.create({
  baseURL: import.meta.env.VITE_AGENT_CORE_BASE_URL,
  withCredentials: true,
});
