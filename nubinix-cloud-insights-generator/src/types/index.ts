
export interface CloudCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

export interface Instance {
  id: string;
  name: string;
  type: string;
  region: string;
  state: "running" | "stopped" | "terminated" | "pending";
  selected: boolean;
}

export interface RDSInstance {
  id: string;
  name: string;
  engine: string;
  region: string;
  state: "available" | "stopped" | "creating" | "deleting";
  selected: boolean;
}

export type CloudProvider = "aws" | "azure";
export type ReportFrequency = "daily" | "weekly" | "monthly";
export type ReportType = "utilization" | "billing";

export interface BillingPeriod {
  year: string;
  month: string;
}

export interface ReportConfig {
  provider: CloudProvider;
  reportType: ReportType | null;
  credentials: CloudCredentials;
  instances: Instance[];
  rdsInstances: RDSInstance[];
  frequency: ReportFrequency;
  billingPeriod: BillingPeriod | null;
}
