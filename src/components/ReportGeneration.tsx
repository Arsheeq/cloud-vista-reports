
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CloudProvider, ReportFrequency } from '@/types';
import { Check, Download, RefreshCw } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from "@/hooks/use-toast";

interface ReportGenerationProps {
  provider: CloudProvider;
  frequency: ReportFrequency;
  onBack: () => void;
  onReset: () => void;
}

const ReportGeneration: React.FC<ReportGenerationProps> = ({
  provider,
  frequency,
  onBack,
  onReset
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [isGenerated, setIsGenerated] = useState(false);
  const { toast } = useToast();

  // Simulate report generation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
      toast({
        title: "Report Generated Successfully",
        description: `Your ${frequency} report is now ready to download.`,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [frequency, toast]);

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your report will be downloaded shortly.",
    });
    
    // Simulate download delay
    setTimeout(() => {
      // In a real app, this would trigger a file download
      console.log("Downloading report...");
    }, 500);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
      {isGenerating ? (
        <div className="text-center py-8">
          <LoadingSpinner size="large" />
          <h2 className="text-2xl font-bold mt-6 mb-2">Generating Your Report</h2>
          <p className="text-gray-500 mb-8">
            Please wait while we analyze your {provider === 'aws' ? 'AWS' : 'Azure'} resources and generate your {frequency} report.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-nubinix-purple h-2 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-500">This may take a few moments...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Report Generated Successfully!</h2>
          <p className="text-gray-500 mb-8">
            Your {frequency} {provider === 'aws' ? 'AWS' : 'Azure'} cloud report is ready. You can download it now.
          </p>
          
          <Button 
            onClick={handleDownload}
            className="w-full mb-4 bg-nubinix-purple hover:bg-nubinix-purple/90"
          >
            <Download className="mr-2 h-4 w-4" /> Download Report
          </Button>
          
          <div className="flex space-x-4 mt-6">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              variant="outline"
              onClick={onReset}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Start New Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGeneration;
