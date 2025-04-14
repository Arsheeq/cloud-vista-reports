
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
    <div className="neo-blur rounded-xl p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nubinix-blue/10 mb-4 animate-float">
          <Cloud size={32} className="text-nubinix-blue" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gradient">Select Your Cloud Provider</h2>
        <p className="text-gray-400">Choose the cloud platform you want to manage.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="cloud-provider" className="block text-sm font-medium text-gray-300">
            Cloud Provider
          </label>
          <Select 
            value={selectedProvider || undefined} 
            onValueChange={(value: CloudProvider) => onProviderChange(value)}
          >
            <SelectTrigger id="cloud-provider" className="w-full glass-morphism bg-transparent">
              <SelectValue placeholder="Select a cloud provider" />
            </SelectTrigger>
            <SelectContent className="neo-blur border-white/10">
              <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
              <SelectItem value="azure">Microsoft Azure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={onNext} 
          disabled={!selectedProvider}
          className="w-full bg-gradient-to-r from-nubinix-blue to-nubinix-purple hover:from-nubinix-blue/90 hover:to-nubinix-purple/90 transition-all duration-300 glow"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default CloudSelection;
