import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CloudProvider, Credentials } from '@/types';
import { Eye, EyeOff, Key, Lock } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface CredentialsInputProps {
  provider: CloudProvider;
  credentials: Credentials;
  onCredentialsChange: (credentials: Credentials) => void;
  onBack: () => void;
  onNext: () => void;
}

const CredentialsInput: React.FC<CredentialsInputProps> = ({
  provider,
  credentials,
  onCredentialsChange,
  onBack,
  onNext
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const handleCheckInstances = async () => {
    setIsValidating(true);
    try {
      await validateCredentials(provider, credentials);
      const instances = await fetchInstances(provider, credentials);
      setIsValidating(false);
      onNext();
    } catch (error) {
      console.error('Error validating credentials:', error);
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

        <div className="space-y-2">
          <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
            {labels.optional}
          </label>
          <Input
            id="accountId"
            value={credentials.accountId || ''}
            onChange={(e) => onCredentialsChange({ ...credentials, accountId: e.target.value })}
            placeholder={`Enter your ${labels.optional}`}
          />
        </div>

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
