
import axios from 'axios';
import { CloudProvider, Credentials, Instance, RDSInstance } from '@/types';

const API_URL = window.location.protocol + '//' + window.location.hostname + ':8000';

export const validateCredentials = async (provider: CloudProvider, credentials: Credentials) => {
  try {
    const response = await axios.post(`${API_URL}/validate-credentials`, credentials);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to validate credentials');
    }
    throw error;
  }
};

export const fetchInstances = async (provider: CloudProvider, credentials: Credentials) => {
  try {
    console.log('Fetching instances with credentials:', { ...credentials, secretAccessKey: '***' });
    const response = await axios.post(`${API_URL}/instances`, credentials);
    console.log('Received instances:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching instances:', error);
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to fetch instances');
    }
    throw error;
  }
};

export const generateReport = async (
  provider: CloudProvider,
  credentials: Credentials,
  selectedInstances: (Instance | RDSInstance)[]
) => {
  try {
    const response = await axios.post(`${API_URL}/generate-report`, {
      provider,
      credentials,
      selected_instances: selectedInstances
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to generate report');
    }
    throw error;
  }
};
