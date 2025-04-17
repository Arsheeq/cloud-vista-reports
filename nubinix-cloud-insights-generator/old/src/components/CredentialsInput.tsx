import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CloudProvider, Credentials, InstanceData } from '@/types'; // Added InstanceData type
import { Eye, EyeOff, Key, Lock } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { validateCredentials, fetchInstances } from '@/services/api';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select'
import { Globe } from 'lucide-react';


interface CredentialsInputProps {
  provider: CloudProvider;
  credentials: Credentials;
  onCredentialsChange: (credentials: Credentials) => void;
  onBack: () => void;
  onNext: () => void;
  onInstancesUpdate: (instances: InstanceData) => void; // Added onInstancesUpdate prop
}

const CredentialsInput: React.FC<CredentialsInputProps> = ({
  provider,
  credentials,
  onCredentialsChange,
  onBack,
  onNext,
  onInstancesUpdate, // Using onInstancesUpdate prop
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');

  const handleCheckInstances = async () => {
    setIsValidating(true);
    setError('');
    try {
      console.log('Starting validation with credentials');
      await validateCredentials(provider, credentials);
      console.log('Credentials validated, fetching instances');
      const instances = await fetchInstances(provider, credentials);
      console.log('Instances fetched:', instances);
      onInstancesUpdate(instances); // Passing instances to parent component
      if (!instances.ec2Instances || instances.ec2Instances.length === 0) {
        setError('No instances found in any region. Please check your credentials and region.');
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
      onNext();
    } catch (error: any) {
      console.error('Error in handleCheckInstances:', error);
      setError(error.message || 'An error occurred while fetching instances');
      setIsValidating(false);
    }
  };

  const isFormValid = credentials.accessKeyId && credentials.secretAccessKey;

  const getProviderLabel = () => {
    if (provider === 'aws') {
      return {
        title: 'AWS Credentials',
        key: 'Access Key ID',
        secret: 'Secret Access Key',
        optional: 'Account ID (Optional)'
      };
    } else {
      return {
        title: 'Azure Credentials',
        key: 'Application ID',
        secret: 'Secret Key',
        optional: 'Directory ID (Optional)'
      };
    }
  };

  const labels = getProviderLabel();

  const AWS_REGIONS = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'me-central-1', label: 'Middle East (Central)' }, // Added me-central-1
    // Add other regions as needed
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nubinix-blue/10 mb-4">
          <Key size={32} className="text-nubinix-blue" />
        </div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
          {labels.title}
        </h2>
        <p className="text-gray-500">
          Enter your credentials to connect to your {provider === 'aws' ? 'AWS' : 'Azure'} account.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="accessKeyId" className="block text-sm font-medium text-gray-700">
            {labels.key}
          </label>
          <Input
            id="accessKeyId"
            value={credentials.accessKeyId}
            onChange={(e) => onCredentialsChange({ ...credentials, accessKeyId: e.target.value })}
            placeholder={`Enter your ${labels.key}`}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="secretAccessKey" className="block text-sm font-medium text-gray-700">
            {labels.secret}
          </label>
          <div className="relative">
            <Input
              id="secretAccessKey"
              type={showSecret ? "text" : "password"}
              value={credentials.secretAccessKey}
              onChange={(e) => onCredentialsChange({ ...credentials, secretAccessKey: e.target.value })}
              placeholder={`Enter your ${labels.secret}`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>



        {provider === 'aws' && (
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-4 h-4 text-gray-500" />
            <Select
              value={credentials.region || 'us-east-1'}
              onValueChange={(value) => onCredentialsChange({ ...credentials, region: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {AWS_REGIONS.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={isValidating}
          >
            Back
          </Button>
          <Button
            onClick={handleCheckInstances}
            disabled={!isFormValid || isValidating}
            className="flex-1 bg-nubinix-purple hover:bg-nubinix-purple/90"
          >
            {isValidating ? (
              <>
                <LoadingSpinner size="small" color="border-white" />
                <span className="ml-2">Validating...</span>
              </>
            ) : (
              'Check Instances'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CredentialsInput;