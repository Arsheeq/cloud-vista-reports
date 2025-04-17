
import axios from 'axios';
import { CloudProvider, Credentials, Instance, RDSInstance } from '@/types';

const API_URL = `${window.location.protocol}//${window.location.hostname}:8000`;

export const validateCredentials = async (provider: CloudProvider, credentials: Credentials) => {
  try {
    const response = await axios.post(`${API_URL}/validate-credentials`, credentials);
    return response.data;
  } catch (error: any) {
    console.error('Validation error:', error);
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to validate credentials');
    }
    throw new Error('Network error during validation');
  }
};

export const fetchInstances = async (provider: CloudProvider, credentials: Credentials) => {
  try {
    const response = await axios.post(`${API_URL}/instances`, credentials);
    return {
      ec2Instances: response.data.ec2Instances.map((instance: any) => ({
        ...instance,
        selected: false
      })),
      rdsInstances: response.data.rdsInstances.map((instance: any) => ({
        ...instance,
        selected: false
      }))
    };
  } catch (error: any) {
    console.error('Error fetching instances:', error);
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to fetch instances');
    }
    throw new Error('Network error while fetching instances');
  }
};

export const generateReport = async (
  provider: CloudProvider,
  credentials: Credentials,
  selectedInstances: (Instance | RDSInstance)[],
  frequency: ReportFrequency
) => {
  try {
    if (!selectedInstances.length) {
      throw new Error('No instances selected');
    }
    
    console.log('Generating report:', {
      provider,
      instanceCount: selectedInstances.length,
      frequency
    });

    const response = await axios.post(`${API_URL}/generate-report`, {
      provider,
      credentials,
      selected_instances: selectedInstances.map(instance => ({
        id: instance.id,
        name: instance.name,
        type: instance.type,
        state: instance.state,
        region: instance.region
      })),
      frequency
    }, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    if (response.status !== 200) {
      console.error('Report generation failed:', response.status);
      throw new Error('Failed to generate report');
    }

    const filename = `cloud-report-${frequency}-${new Date().toISOString().split('T')[0]}.pdf`;
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    // Create and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: any) {
    console.error('Report generation error:', error);
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to generate report');
    }
    throw new Error('Network error during report generation');
  }
};
