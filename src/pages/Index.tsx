
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
  { id: 'i-123456789abc', region: 'us-east-1', state: 'running', type: 't2.micro', selected: false },
  { id: 'i-234567890abc', region: 'us-east-1', state: 'stopped', type: 't3.small', selected: false },
  { id: 'i-345678901abc', region: 'us-west-2', state: 'running', type: 'm5.large', selected: false },
  { id: 'i-456789012abc', region: 'eu-west-1', state: 'running', type: 'c5.xlarge', selected: false },
  { id: 'i-567890123abc', region: 'ap-south-1', state: 'terminated', type: 'r5.large', selected: false },
];

const mockRdsInstances: RDSInstance[] = [
  { id: 'db-123456789abc', region: 'us-east-1', state: 'running', type: 'db.t3.micro', engine: 'mysql', size: '20GB', selected: false },
  { id: 'db-234567890abc', region: 'us-east-1', state: 'stopped', type: 'db.t3.small', engine: 'postgres', size: '50GB', selected: false },
  { id: 'db-345678901abc', region: 'us-west-2', state: 'running', type: 'db.m5.large', engine: 'aurora', size: '100GB', selected: false },
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-background/90">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0xaDJ2MWgtMnYtMXptLTIgMWgxdjFoLTF2LTF6bS0zIDBoMXYxaC0xdi0xem0tMiAwaDF2MWgtMXYtMXptLTItMmgxdjFoLTF2LTF6bS0yIDBoMXYxaC0xdi0xem0xNi04aDJ2MWgtM3YtMWgxem0tMTAtOGgxdjFoLTF2LTF6bTQgMGgxdjFoLTF2LTF6bS00IDRoMXYxaC0xdi0xem0wIDZoMXYxaC0xdi0xem0tMi00aDF2MWgtMXYtMXptMi0xMGgxdjFoLTF2LTF6bS02IDloMXYxaC0xdi0xem04IDJoMXYxaC0xdi0xem0yIDJoMXYxaC0xdi0xem0tMi0yaDF2MWgtMXYtMXptLTItMmgxdjFoLTF2LTF6bS05IDJoMXYxaC0xdi0xem0xMCAwaDJ2MWgtMnYtMXptLTMtMmgxdjJoLTF2LTJ6bS0xLTZoMXYxaC0xdi0xem0tMiAwaDF2MWgtMXYtMXptLTEgOGgxdjFoLTF2LTF6bS0yLTExaDF2MmgtMXYtMnptLTEgM2gxdjJoLTF2LTJ6bTE2LThoMXYxaC0xdi0xem0tOCAwaDF2MWgtMXYtMXptMiAwaDF2MWgtMXYtMXptLTktMmgxdjFoLTF2LTF6bTEwIDBoMXYxaC0xdi0xem0yIDBoMXYxaC0xdi0xem0tMiA0aDF2MWgtMXYtMXptMCAxNmgxdjFoLTF2LTF6bTAgOGgxdjFoLTF2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 pointer-events-none"></div>
      <Header />
      <main className="flex-1 container py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <StepIndicator currentStep={currentStep} steps={steps} />
          <div className="glass-morphism p-6 mt-8 rounded-xl">
            {renderStepContent()}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
