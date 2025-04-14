
export type CloudProvider = 'aws' | 'azure';

export interface Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  accountId?: string;
}

export interface Instance {
  id: string;
  name: string;
  region: string;
  state: 'running' | 'stopped' | 'terminated' | 'pending';
  type: string;
  selected: boolean;
}

export interface RDSInstance extends Instance {
  engine: string;
  size: string;
}

export type ReportFrequency = 'daily' | 'weekly' | 'monthly';

export type Step = 
  | 'cloudSelection' 
  | 'credentialsInput' 
  | 'instanceOverview' 
  | 'reportTypeSelection' 
  | 'reportGeneration';
