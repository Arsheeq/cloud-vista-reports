import React from 'react';
import { Button } from '@/components/ui/button';
import { ReportFrequency } from '@/types';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarDays, Calendar, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ReportTypeSelectionProps {
  frequency: ReportFrequency | null;
  onFrequencyChange: (frequency: ReportFrequency) => void;
  onBack: () => void;
  onNext: () => void;
}

const ReportTypeSelection: React.FC<ReportTypeSelectionProps> = ({
  frequency,
  onFrequencyChange,
  onBack,
  onNext
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nubinix-blue/10 mb-4">
          <FileText size={32} className="text-nubinix-blue" />
        </div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
          Choose Report Frequency
        </h2>
        <p className="text-gray-500">
          Select how often you want your report to be generated.
        </p>
      </div>

      <RadioGroup 
        value={frequency || undefined} 
        onValueChange={(value: ReportFrequency) => onFrequencyChange(value)}
        className="space-y-4 mb-8"
      >
        <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="daily" id="daily" />
          <Label htmlFor="daily" className="flex-1 cursor-pointer flex items-center">
            <div className="flex items-center">
              <div className="mr-3 bg-blue-100 p-2 rounded-full">
                <CalendarDays size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Daily Report</div>
                <div className="text-sm text-gray-500">Get a new report every day</div>
              </div>
            </div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="weekly" id="weekly" />
          <Label htmlFor="weekly" className="flex-1 cursor-pointer flex items-center">
            <div className="flex items-center">
              <div className="mr-3 bg-purple-100 p-2 rounded-full">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="font-medium">Weekly Report</div>
                <div className="text-sm text-gray-500">Get a comprehensive weekly summary</div>
              </div>
            </div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value="monthly" id="monthly" />
          <Label htmlFor="monthly" className="flex-1 cursor-pointer flex items-center">
            <div className="flex items-center">
              <div className="mr-3 bg-green-100 p-2 rounded-full">
                <FileText size={20} className="text-green-600" />
              </div>
              <div>
                <div className="font-medium">Monthly Report</div>
                <div className="text-sm text-gray-500">Get a detailed monthly analysis</div>
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>

      <div className="flex space-x-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!frequency}
          className="flex-1 bg-nubinix-purple hover:bg-nubinix-purple/90"
        >
          Generate Report
        </Button>
      </div>
    </div>
  );
};

export default ReportTypeSelection;
