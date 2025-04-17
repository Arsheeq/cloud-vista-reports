import React from 'react';
import { Button } from '@/components/ui/button';

interface ReportTypeSelectionProps {
  reportType: 'utilization' | 'billing' | null;
  onReportTypeChange: (type: 'utilization' | 'billing') => void;
  onBack: () => void;
  onNext: () => void;
}

const ReportTypeSelection: React.FC<ReportTypeSelectionProps> = ({
  reportType,
  onReportTypeChange,
  onBack,
  onNext,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Select Report Type</h2>
        <p className="text-gray-600">Choose what type of report you want to generate</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className={`border rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-all ${
            reportType === 'utilization' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          onClick={() => onReportTypeChange('utilization')}
        >
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">Utilization Report</h3>
            <p className="text-sm text-gray-500 text-center">Resource usage across your cloud instances</p>
          </div>
        </div>

        <div 
          className={`border rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-all ${
            reportType === 'billing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          onClick={() => onReportTypeChange('billing')}
        >
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">Monthly Bill</h3>
            <p className="text-sm text-gray-500 text-center">Cost breakdown by service and resource</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-6"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!reportType}
          className="bg-blue-400 hover:bg-blue-500 text-white rounded px-6"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ReportTypeSelection;