
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CloudProvider } from '@/types';
import { Cloud } from 'lucide-react';

interface CloudSelectionProps {
  selectedProvider: CloudProvider | null;
  onProviderChange: (provider: CloudProvider) => void;
  onNext: () => void;
}

const CloudSelection: React.FC<CloudSelectionProps> = ({
  selectedProvider,
  onProviderChange,
  onNext
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nubinix-blue/10 mb-4">
          <Cloud size={32} className="text-nubinix-blue" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Select Your Cloud Provider</h2>
        <p className="text-gray-500">Choose the cloud platform you want to manage.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="cloud-provider" className="block text-sm font-medium text-gray-700">
            Cloud Provider
          </label>
          <Select 
            value={selectedProvider || undefined} 
            onValueChange={(value: CloudProvider) => onProviderChange(value)}
          >
            <SelectTrigger id="cloud-provider" className="w-full">
              <SelectValue placeholder="Select a cloud provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
              <SelectItem value="azure">Microsoft Azure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={onNext} 
          disabled={!selectedProvider}
          className="w-full bg-nubinix-purple hover:bg-nubinix-purple/90"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default CloudSelection;
