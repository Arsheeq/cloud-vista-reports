import React from 'react';
import { Button } from '@/components/ui/button';
import { CloudProvider } from '@/types';

interface CloudSelectionProps {
  provider: CloudProvider | null;
  onProviderChange: (provider: CloudProvider) => void;
  onNext: () => void;
}

const CloudSelection: React.FC<CloudSelectionProps> = ({
  provider,
  onProviderChange,
  onNext
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Select Cloud Provider</h2>
        <p className="text-gray-600">Choose your cloud provider to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className={`border rounded-lg p-6 cursor-pointer hover:border-[#FF9900] transition-all ${
            provider === 'aws' ? 'border-[#FF9900] bg-[#FFF8E7]' : 'border-gray-200'
          }`}
          onClick={() => onProviderChange('aws')}
        >
          <div className="flex flex-col items-center">
            <img src="/aws-logo.png" alt="AWS" className="h-16 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Amazon Web Services</h3>
            <p className="text-sm text-gray-500 text-center">EC2, RDS, and other AWS services</p>
          </div>
        </div>

        <div 
          className={`border rounded-lg p-6 cursor-pointer hover:border-[#008AD7] transition-all ${
            provider === 'azure' ? 'border-[#008AD7] bg-[#F0F8FF]' : 'border-gray-200'
          }`}
          onClick={() => onProviderChange('azure')}
        >
          <div className="flex flex-col items-center">
            <img src="/azure-logo.png" alt="Azure" className="h-16 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Microsoft Azure</h3>
            <p className="text-sm text-gray-500 text-center">Virtual Machines, SQL Databases, and more</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={onNext}
          disabled={!provider}
          className="bg-blue-400 hover:bg-blue-500 text-white rounded px-6"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default CloudSelection;