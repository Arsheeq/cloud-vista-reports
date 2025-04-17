
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Layout from "@/components/Layout";
import Stepper from "@/components/Stepper";
import { useReport } from "@/context/ReportContext";
import { ReportFrequency } from "@/types";

const steps = ["Cloud Provider", "Credentials", "Instances", "Report Type", "Generate"];

const reportFrequencyOptions = [
  { value: "daily", label: "Daily", description: "Provides metrics for the last 24 hours" },
  { value: "weekly", label: "Weekly", description: "Provides metrics for the last 7 days" },
  { value: "monthly", label: "Monthly", description: "Provides metrics for the last 30 days" }
];

const ReportType = () => {
  const navigate = useNavigate();
  const { frequency, setFrequency, selectedInstances, selectedRdsInstances } = useReport();

  const handleBack = () => {
    navigate("/instances");
  };

  const handleGenerate = () => {
    navigate("/generate-report");
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value as ReportFrequency);
  };

  if (selectedInstances.length === 0 && selectedRdsInstances.length === 0) {
    navigate("/instances");
    return null;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Stepper steps={steps} currentStep={3} />
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Select Report Type</CardTitle>
            <CardDescription>
              Choose the frequency for your cloud insights report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <RadioGroup
                value={frequency}
                onValueChange={handleFrequencyChange}
                className="space-y-4"
              >
                {reportFrequencyOptions.map(option => (
                  <div key={option.value} className="flex items-start space-x-3">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="grid gap-1.5">
                      <Label htmlFor={option.value} className="font-medium">
                        {option.label}
                      </Label>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p>
                      Your report will include data for {selectedInstances.length} instances and {selectedRdsInstances.length} databases.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button 
              onClick={handleGenerate}
              className="bg-gradient-to-r from-nubinix-blue to-nubinix-purple hover:from-nubinix-purple hover:to-nubinix-pink"
            >
              Generate Report
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportType;
