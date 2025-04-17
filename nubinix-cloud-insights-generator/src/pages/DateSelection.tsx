
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import Stepper from "@/components/Stepper";
import { useReport } from "@/context/ReportContext";

const fadeInVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
];

const years = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" }
];

const DateSelection = () => {
  const navigate = useNavigate();
  const { provider, reportType, setBillingPeriod } = useReport();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const steps = ["Cloud Provider", "Report Type", "Credentials", "Date Selection", "Generate"];

  // Redirect if needed
  if (!provider) {
    navigate("/");
    return null;
  }

  if (!reportType || reportType !== "billing") {
    navigate("/report-type");
    return null;
  }

  const handleBack = () => {
    navigate("/credentials");
  };

  const handleGenerate = () => {
    if (year && month) {
      setBillingPeriod({ year, month });
      navigate("/generate-report");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Stepper steps={steps} currentStep={3} />
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-2xl">Select Billing Period</CardTitle>
              <CardDescription>
                Choose the year and month for your billing report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Year
                    </label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((yearOption) => (
                          <SelectItem key={yearOption.value} value={yearOption.value}>
                            {yearOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Month
                    </label>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((monthOption) => (
                          <SelectItem key={monthOption.value} value={monthOption.value}>
                            {monthOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p>
                        Your billing report will include all charges for {month && year ? `${months.find(m => m.value === month)?.label} ${year}` : "the selected period"}.
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
                disabled={!year || !month}
                className="bg-gradient-to-r from-nubinix-blue to-nubinix-purple hover:from-nubinix-purple hover:to-nubinix-pink"
              >
                Generate Report
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default DateSelection;
