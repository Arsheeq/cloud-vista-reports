
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import Stepper from "@/components/Stepper";
import { useReport } from "@/context/ReportContext";
import { getMockInstances, getMockRdsInstances } from "@/utils/mockData";
import { fetchRealInstances } from "@/utils/awsUtils";

const fadeInVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const getSteps = (reportType) => {
  if (reportType === "utilization") {
    return ["Cloud Provider", "Report Type", "Credentials", "Instances", "Generate"];
  } else {
    return ["Cloud Provider", "Report Type", "Credentials", "Date Selection", "Generate"];
  }
};

const EnterCredentials = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { provider, reportType, setCredentials, setInstances, setRdsInstances } = useReport();
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = getSteps(reportType);
  
  // Redirect if no provider or report type selected
  useEffect(() => {
    if (!provider) {
      navigate("/");
      return;
    }
    
    if (!reportType) {
      navigate("/report-type");
    }
  }, [provider, reportType, navigate]);

  const handleBack = () => {
    navigate("/report-type");
  };

  const handleNext = async () => {
    // Validate inputs
    if (!accessKeyId || !secretAccessKey || !accountName) {
      setError("Account Name, Access Key ID and Secret Access Key are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Store credentials
      const credentials = {
        accessKeyId,
        secretAccessKey
      };
      
      setCredentials(credentials);
      
      if (provider) {
        try {
          // Validate credentials
          const response = await fetch('http://localhost:8000/validate-credentials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accessKeyId,
              secretAccessKey,
              region: 'me-central-1'
            }),
          });

          if (!response.ok) {
            throw new Error('Invalid credentials');
          }

          // Fetch instances
          const instancesResponse = await fetch('http://localhost:8000/instances', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accessKeyId,
              secretAccessKey
            }),
          });

          if (!instancesResponse.ok) {
            throw new Error('Failed to fetch instances');
          }

          const data = await instancesResponse.json();
          setInstances(data.ec2Instances || []);
          setRdsInstances(data.rdsInstances || []);

          toast({
            title: "Connected successfully",
            description: "Your cloud credentials have been validated.",
          });
        
          // Navigate based on report type
          if (reportType === "utilization") {
            navigate("/instances");
          } else {
            navigate("/date-selection");
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } else {
        throw new Error("No cloud provider selected");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Stepper steps={steps} currentStep={2} />
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-2xl">Enter Cloud Credentials</CardTitle>
              <CardDescription>
                {provider === "aws" 
                  ? "Enter your AWS credentials to access your cloud resources" 
                  : "Enter your Azure credentials to access your cloud resources"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Account Name</label>
                  <Input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Enter account name"
                    className="focus-visible:ring-nubinix-blue"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {provider === "aws" ? "AWS Access Key ID" : "Azure Client ID"}
                  </label>
                  <Input
                    value={accessKeyId}
                    onChange={(e) => setAccessKeyId(e.target.value)}
                    placeholder={provider === "aws" ? "AKIAIOSFODNN7EXAMPLE" : "Azure Client ID"}
                    className="focus-visible:ring-nubinix-blue"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {provider === "aws" ? "AWS Secret Access Key" : "Azure Client Secret"}
                  </label>
                  <Input
                    type="password"
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    placeholder="●●●●●●●●●●●●●●●●●●●●"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={isLoading}
                className="bg-gradient-to-r from-nubinix-blue to-nubinix-purple hover:from-nubinix-purple hover:to-nubinix-pink"
              >
                {isLoading ? "Connecting..." : "Next"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default EnterCredentials;
