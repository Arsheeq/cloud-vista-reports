
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StepIndicator from '@/components/StepIndicator';
import CloudSelection from '@/components/CloudSelection';
import CredentialsInput from '@/components/CredentialsInput';
import InstanceOverview from '@/components/InstanceOverview';
import ReportTypeSelection from '@/components/ReportTypeSelection';
import ReportGeneration from '@/components/ReportGeneration';
import { 
  CloudProvider, 
  Credentials, 
  Instance, 
  RDSInstance, 
  ReportFrequency, 
  Step 
} from '@/types';

const steps = [
  { id: 'cloudSelection' as Step, label: 'Cloud' },
  { id: 'credentialsInput' as Step, label: 'Credentials' },
  { id: 'instanceOverview' as Step, label: 'Instances' },
  { id: 'reportTypeSelection' as Step, label: 'Report Type' },
  { id: 'reportGeneration' as Step, label: 'Generate' },
];

// Sample mock data for demo
const mockInstances: Instance[] = [
  { id: 'i-123456789abc', name: 'Web Server 1', region: 'us-east-1', state: 'running', type: 't2.micro', selected: false },
  { id: 'i-234567890abc', name: 'App Server 1', region: 'us-east-1', state: 'stopped', type: 't3.small', selected: false },
  { id: 'i-345678901abc', name: 'DB Server 1', region: 'us-west-2', state: 'running', type: 'm5.large', selected: false },
  { id: 'i-456789012abc', name: 'Worker Node 1', region: 'eu-west-1', state: 'running', type: 'c5.xlarge', selected: false },
  { id: 'i-567890123abc', name: 'Cache Server 1', region: 'ap-south-1', state: 'terminated', type: 'r5.large', selected: false },
];

const mockRdsInstances: RDSInstance[] = [
  { id: 'db-123456789abc', name: 'Production DB', region: 'us-east-1', state: 'running', type: 'db.t3.micro', engine: 'mysql', size: '20GB', selected: false },
  { id: 'db-234567890abc', name: 'Staging DB', region: 'us-east-1', state: 'stopped', type: 'db.t3.small', engine: 'postgres', size: '50GB', selected: false },
  { id: 'db-345678901abc', name: 'Development DB', region: 'us-west-2', state: 'running', type: 'db.m5.large', engine: 'aurora', size: '100GB', selected: false },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('cloudSelection');
  const [provider, setProvider] = useState<CloudProvider | null>(null);
  const [credentials, setCredentials] = useState<Credentials>({
    accessKeyId: '',
    secretAccessKey: '',
    accountId: '',
  });
  const [instances, setInstances] = useState<Instance[]>(mockInstances);
  const [rdsInstances, setRdsInstances] = useState<RDSInstance[]>(mockRdsInstances);
  const [frequency, setFrequency] = useState<ReportFrequency | null>(null);

  const handleProviderChange = (newProvider: CloudProvider) => {
    setProvider(newProvider);
  };

  const handleCredentialsChange = (newCredentials: Credentials) => {
    setCredentials(newCredentials);
  };

  const handleInstanceSelectionChange = (newInstances: Instance[], newRdsInstances: RDSInstance[]) => {
    setInstances(newInstances);
    setRdsInstances(newRdsInstances);
  };

  const handleFrequencyChange = (newFrequency: ReportFrequency) => {
    setFrequency(newFrequency);
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const resetWizard = () => {
    setCurrentStep('cloudSelection');
    setProvider(null);
    setCredentials({
      accessKeyId: '',
      secretAccessKey: '',
      accountId: '',
    });
    setInstances(mockInstances.map(instance => ({ ...instance, selected: false })));
    setRdsInstances(mockRdsInstances.map(instance => ({ ...instance, selected: false })));
    setFrequency(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'cloudSelection':
        return (
          <CloudSelection
            selectedProvider={provider}
            onProviderChange={handleProviderChange}
            onNext={() => goToStep('credentialsInput')}
          />
        );
      case 'credentialsInput':
        return (
          <CredentialsInput
            provider={provider!}
            credentials={credentials}
            onCredentialsChange={handleCredentialsChange}
            onBack={() => goToStep('cloudSelection')}
            onNext={() => goToStep('instanceOverview')}
          />
        );
      case 'instanceOverview':
        return (
          <InstanceOverview
            provider={provider!}
            instances={instances}
            rdsInstances={rdsInstances}
            onInstanceSelectionChange={handleInstanceSelectionChange}
            onBack={() => goToStep('credentialsInput')}
            onNext={() => goToStep('reportTypeSelection')}
          />
        );
      case 'reportTypeSelection':
        return (
          <ReportTypeSelection
            frequency={frequency}
            onFrequencyChange={handleFrequencyChange}
            onBack={() => goToStep('instanceOverview')}
            onNext={() => goToStep('reportGeneration')}
          />
        );
      case 'reportGeneration':
        return (
          <ReportGeneration
            provider={provider!}
            frequency={frequency!}
            onBack={() => goToStep('reportTypeSelection')}
            onReset={resetWizard}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <StepIndicator currentStep={currentStep} steps={steps} />
          {renderStepContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
