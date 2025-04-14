
import axios from 'axios';
import { CloudProvider, Credentials, Instance, RDSInstance } from '@/types';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';

export const validateCredentials = async (provider: CloudProvider, credentials: Credentials) => {
  const response = await axios.post(`${API_URL}/validate-credentials`, credentials);
  return response.data;
};

export const fetchInstances = async (provider: CloudProvider, credentials: Credentials) => {
  const response = await axios.post(`${API_URL}/instances/${provider}`, credentials);
  return response.data;
};

export const generateReport = async (
  provider: CloudProvider,
  credentials: Credentials,
  selectedInstances: (Instance | RDSInstance)[]
) => {
  const response = await axios.post(`${API_URL}/generate-report`, {
    provider,
    credentials,
    selected_instances: selectedInstances
  });
  return response.data;
};
