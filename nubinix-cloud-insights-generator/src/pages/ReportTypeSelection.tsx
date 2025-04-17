
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import Stepper from "@/components/Stepper";
import { useReport } from "@/context/ReportContext";
import { ChartBar, Receipt } from "lucide-react";

const fadeInVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const cardVariants = {
  hover: { 
    scale: 1.03,
    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

const ReportTypeSelection = () => {
  const navigate = useNavigate();
  const { provider, setReportType } = useReport();
  const [selectedType, setSelectedType] = useState(null);

  const steps = ["Cloud Provider", "Report Type", "Credentials", "Details", "Generate"];

  // Redirect if no provider selected
  if (!provider) {
    navigate("/");
    return null;
  }

  const handleBack = () => {
    navigate("/");
  };

  const handleNext = () => {
    if (selectedType) {
      setReportType(selectedType);
      navigate("/credentials");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Stepper steps={steps} currentStep={1} />
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-2xl">Select Report Type</CardTitle>
              <CardDescription>
                Choose what type of report you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div 
                  onClick={() => setSelectedType("utilization")}
                  whileHover="hover"
                  whileTap="tap"
                  variants={cardVariants}
                  className={`p-6 border rounded-xl cursor-pointer transition-all ${
                    selectedType === "utilization" 
                      ? "border-nubinix-blue bg-blue-50 shadow-md" 
                      : "border-gray-200 hover:border-nubinix-blue hover:bg-blue-50/30"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-3">
                      <ChartBar size={32} />
                    </div>
                    <h3 className="text-lg font-medium">Utilization Report</h3>
                    <p className="text-sm text-gray-500 mt-1 text-center">
                      Resource usage across your cloud instances
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  onClick={() => setSelectedType("billing")}
                  whileHover="hover"
                  whileTap="tap"
                  variants={cardVariants}
                  className={`p-6 border rounded-xl cursor-pointer transition-all ${
                    selectedType === "billing" 
                      ? "border-nubinix-pink bg-pink-50 shadow-md" 
                      : "border-gray-200 hover:border-nubinix-pink hover:bg-pink-50/30"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-400 rounded-lg flex items-center justify-center text-white mb-3">
                      <Receipt size={32} />
                    </div>
                    <h3 className="text-lg font-medium">Monthly Bill</h3>
                    <p className="text-sm text-gray-500 mt-1 text-center">
                      Cost breakdown by service and resource
                    </p>
                  </div>
                </motion.div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!selectedType}
                className="bg-gradient-to-r from-nubinix-blue to-nubinix-purple hover:from-nubinix-purple hover:to-nubinix-pink"
              >
                Next
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ReportTypeSelection;
