import { CloudCredentials, CloudProvider, Instance, RDSInstance } from "@/types";

export const fetchRealInstances = async (
  provider: CloudProvider,
  credentials: CloudCredentials
): Promise<{ instances: Instance[]; rdsInstances: RDSInstance[] }> => {
  try {
    const response = await fetch('/api/validate-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const instancesResponse = await fetch('/api/instances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!instancesResponse.ok) {
      throw new Error('Failed to fetch instances');
    }

    const data = await instancesResponse.json();
    return {
      instances: data.ec2Instances || [],
      rdsInstances: data.rdsInstances || []
    };
  } catch (error) {
    console.error('Error fetching instances:', error);
    throw error;
  }
};