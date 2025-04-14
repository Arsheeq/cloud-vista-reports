
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CloudProvider, Instance, RDSInstance } from '@/types';
import { Database, Server } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface InstanceOverviewProps {
  provider: CloudProvider;
  instances: Instance[];
  rdsInstances: RDSInstance[];
  onInstanceSelectionChange: (instances: Instance[], rdsInstances: RDSInstance[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const InstanceOverview: React.FC<InstanceOverviewProps> = ({
  provider,
  instances,
  rdsInstances,
  onInstanceSelectionChange,
  onBack,
  onNext
}) => {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('ec2');
  const [localInstances, setLocalInstances] = useState<Instance[]>(instances);
  const [localRdsInstances, setLocalRdsInstances] = useState<RDSInstance[]>(rdsInstances);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleEc2SelectAll = (checked: boolean) => {
    const updatedInstances = localInstances.map(instance => ({
      ...instance,
      selected: checked
    }));
    setLocalInstances(updatedInstances);
    onInstanceSelectionChange(updatedInstances, localRdsInstances);
  };

  const handleRdsSelectAll = (checked: boolean) => {
    const updatedRdsInstances = localRdsInstances.map(instance => ({
      ...instance,
      selected: checked
    }));
    setLocalRdsInstances(updatedRdsInstances);
    onInstanceSelectionChange(localInstances, updatedRdsInstances);
  };

  const handleEc2SelectOne = (id: string, checked: boolean) => {
    const updatedInstances = localInstances.map(instance => 
      instance.id === id ? { ...instance, selected: checked } : instance
    );
    setLocalInstances(updatedInstances);
    onInstanceSelectionChange(updatedInstances, localRdsInstances);
  };

  const handleRdsSelectOne = (id: string, checked: boolean) => {
    const updatedRdsInstances = localRdsInstances.map(instance => 
      instance.id === id ? { ...instance, selected: checked } : instance
    );
    setLocalRdsInstances(updatedRdsInstances);
    onInstanceSelectionChange(localInstances, updatedRdsInstances);
  };

  const allEc2Selected = localInstances.length > 0 && localInstances.every(instance => instance.selected);
  const allRdsSelected = localRdsInstances.length > 0 && localRdsInstances.every(instance => instance.selected);
  const anySelected = localInstances.some(instance => instance.selected) || localRdsInstances.some(instance => instance.selected);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 mx-auto w-full max-w-4xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nubinix-blue/10 mb-4">
          <Server size={32} className="text-nubinix-blue" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Cloud Resources</h2>
        <p className="text-gray-500">
          Select the resources you want to include in your report.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-500">Fetching your resources...</p>
        </div>
      ) : (
        <Tabs defaultValue="ec2" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ec2" className="flex items-center gap-2">
              <Server size={16} />
              <span>{provider === 'aws' ? 'EC2 Instances' : 'Virtual Machines'}</span>
            </TabsTrigger>
            <TabsTrigger value="rds" className="flex items-center gap-2">
              <Database size={16} />
              <span>{provider === 'aws' ? 'RDS Instances' : 'Database Servers'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ec2" className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 border-b">
                <div className="col-span-1 flex items-center">
                  <Checkbox 
                    id="selectAllEc2" 
                    checked={allEc2Selected} 
                    onCheckedChange={(checked) => handleEc2SelectAll(!!checked)}
                  />
                </div>
                <div className="col-span-4 font-medium">Instance ID</div>
                <div className="col-span-3 font-medium">Region</div>
                <div className="col-span-2 font-medium">Type</div>
                <div className="col-span-2 font-medium">State</div>
              </div>

              {localInstances.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No instances found for this account.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {localInstances.map((instance) => (
                    <div key={instance.id} className="grid grid-cols-12 gap-2 p-3 border-b hover:bg-gray-50">
                      <div className="col-span-1 flex items-center">
                        <Checkbox 
                          id={`ec2-${instance.id}`} 
                          checked={instance.selected} 
                          onCheckedChange={(checked) => handleEc2SelectOne(instance.id, !!checked)}
                        />
                      </div>
                      <div className="col-span-4 truncate">{instance.id}</div>
                      <div className="col-span-3">{instance.region}</div>
                      <div className="col-span-2">{instance.type}</div>
                      <div className="col-span-2 flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${getStateColor(instance.state)} mr-2`}></span>
                        <span className="capitalize">{instance.state}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rds" className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 border-b">
                <div className="col-span-1 flex items-center">
                  <Checkbox 
                    id="selectAllRds" 
                    checked={allRdsSelected} 
                    onCheckedChange={(checked) => handleRdsSelectAll(!!checked)}
                  />
                </div>
                <div className="col-span-3 font-medium">Instance ID</div>
                <div className="col-span-2 font-medium">Region</div>
                <div className="col-span-2 font-medium">Engine</div>
                <div className="col-span-2 font-medium">Size</div>
                <div className="col-span-2 font-medium">State</div>
              </div>

              {localRdsInstances.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No database instances found for this account.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {localRdsInstances.map((instance) => (
                    <div key={instance.id} className="grid grid-cols-12 gap-2 p-3 border-b hover:bg-gray-50">
                      <div className="col-span-1 flex items-center">
                        <Checkbox 
                          id={`rds-${instance.id}`} 
                          checked={instance.selected} 
                          onCheckedChange={(checked) => handleRdsSelectOne(instance.id, !!checked)}
                        />
                      </div>
                      <div className="col-span-3 truncate">{instance.id}</div>
                      <div className="col-span-2">{instance.region}</div>
                      <div className="col-span-2">{instance.engine}</div>
                      <div className="col-span-2">{instance.size}</div>
                      <div className="col-span-2 flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${getStateColor(instance.state)} mr-2`}></span>
                        <span className="capitalize">{instance.state}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <div className="flex space-x-4 mt-8">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
          disabled={loading}
        >
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={loading || !anySelected}
          className="flex-1 bg-nubinix-purple hover:bg-nubinix-purple/90"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default InstanceOverview;
