
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

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('cloudSelection');
  const [provider, setProvider] = useState<CloudProvider | null>(null);
  const [credentials, setCredentials] = useState<Credentials>({
    accessKeyId: '',
    secretAccessKey: '',
    accountId: '',
  });
  const [instances, setInstances] = useState<Instance[]>([]);
  const [rdsInstances, setRdsInstances] = useState<RDSInstance[]>([]);
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
    setInstances([]);
    setRdsInstances([]);
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
