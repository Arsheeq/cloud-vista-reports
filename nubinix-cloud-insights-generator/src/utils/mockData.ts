
import { Instance, RDSInstance } from "@/types";

export const mockAwsInstances: Instance[] = [
  {
    id: "i-0123456789abcdef0",
    name: "Production Web Server",
    type: "t3.medium",
    region: "us-west-2",
    state: "running",
    selected: false
  },
  {
    id: "i-0123456789abcdef1",
    name: "Development Server",
    type: "t2.micro",
    region: "us-east-1",
    state: "running",
    selected: false
  },
  {
    id: "i-0123456789abcdef2",
    name: "Staging Environment",
    type: "t3.large",
    region: "eu-west-1",
    state: "stopped",
    selected: false
  },
  {
    id: "i-0123456789abcdef3",
    name: "Database Backup Server",
    type: "m5.large",
    region: "ap-southeast-1",
    state: "running",
    selected: false
  }
];

export const mockAwsRdsInstances: RDSInstance[] = [
  {
    id: "db-0123456789abcdef0",
    name: "Production Database",
    engine: "PostgreSQL",
    region: "us-west-2",
    state: "available",
    selected: false
  },
  {
    id: "db-0123456789abcdef1",
    name: "Development Database",
    engine: "MySQL",
    region: "us-east-1",
    state: "available",
    selected: false
  },
  {
    id: "db-0123456789abcdef2",
    name: "Reporting Database",
    engine: "Aurora",
    region: "eu-west-1",
    state: "stopped",
    selected: false
  }
];

export const mockAzureInstances: Instance[] = [
  {
    id: "vm-0123456789abcdef0",
    name: "Azure Production Server",
    type: "Standard_D2s_v3",
    region: "westus2",
    state: "running",
    selected: false
  },
  {
    id: "vm-0123456789abcdef1",
    name: "Azure Development VM",
    type: "Standard_B2s",
    region: "eastus",
    state: "running",
    selected: false
  },
  {
    id: "vm-0123456789abcdef2",
    name: "Azure Test Environment",
    type: "Standard_D4s_v3",
    region: "northeurope",
    state: "stopped",
    selected: false
  }
];

export const mockAzureRdsInstances: RDSInstance[] = [
  {
    id: "sqldb-0123456789abcdef0",
    name: "Azure SQL Production",
    engine: "SQL Server",
    region: "westus2",
    state: "available",
    selected: false
  },
  {
    id: "sqldb-0123456789abcdef1",
    name: "Azure SQL Development",
    engine: "SQL Server",
    region: "eastus",
    state: "available",
    selected: false
  }
];

export const getMockInstances = (provider: "aws" | "azure") => {
  return provider === "aws" ? mockAwsInstances : mockAzureInstances;
};

export const getMockRdsInstances = (provider: "aws" | "azure") => {
  return provider === "aws" ? mockAwsRdsInstances : mockAzureRdsInstances;
};
