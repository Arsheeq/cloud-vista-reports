
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import Stepper from "@/components/Stepper";
import { useReport } from "@/context/ReportContext";
import { Badge } from "@/components/ui/badge";

const fadeInVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const SelectInstances = () => {
  const navigate = useNavigate();
  const { 
    provider, 
    reportType,
    instances, 
    rdsInstances, 
    toggleInstanceSelection, 
    toggleRdsInstanceSelection,
    selectAllInstances,
    selectAllRdsInstances,
    selectedInstances,
    selectedRdsInstances
  } = useReport();
  
  const [selectAllEC2, setSelectAllEC2] = useState(false);
  const [selectAllRDS, setSelectAllRDS] = useState(false);

  const steps = ["Cloud Provider", "Report Type", "Credentials", "Instances", "Generate"];

  // Redirect if needed
  if (!provider) {
    navigate("/");
    return null;
  }

  if (!reportType || reportType !== "utilization") {
    navigate("/report-type");
    return null;
  }

  const handleBack = () => {
    navigate("/credentials");
  };

  const handleNext = () => {
    if (selectedInstances.length > 0 || selectedRdsInstances.length > 0) {
      navigate("/generate-report");
    }
  };

  const handleSelectAllEC2 = () => {
    const newValue = !selectAllEC2;
    setSelectAllEC2(newValue);
    selectAllInstances(newValue);
  };

  const handleSelectAllRDS = () => {
    const newValue = !selectAllRDS;
    setSelectAllRDS(newValue);
    selectAllRdsInstances(newValue);
  };

  const getStateBadgeColor = (state: string) => {
    switch (state) {
      case "running":
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "stopped":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "terminated":
      case "deleting":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
      case "creating":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (instances.length === 0 && rdsInstances.length === 0) {
    navigate("/credentials");
    return null;
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <Stepper steps={steps} currentStep={3} />
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-2xl">Select Instances</CardTitle>
              <CardDescription>
                Choose the instances you want to include in your utilization report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ec2" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="ec2">
                    {provider === "aws" ? "EC2 Instances" : "Virtual Machines"}
                  </TabsTrigger>
                  <TabsTrigger value="rds">
                    {provider === "aws" ? "RDS Instances" : "Databases"}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="ec2">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox 
                              checked={selectAllEC2} 
                              onCheckedChange={handleSelectAllEC2}
                              aria-label="Select all instances"
                            />
                          </TableHead>
                          <TableHead>Instance ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead>State</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {instances.map((instance) => (
                          <TableRow key={instance.id}>
                            <TableCell>
                              <Checkbox 
                                checked={instance.selected} 
                                onCheckedChange={() => toggleInstanceSelection(instance.id)}
                                aria-label={`Select instance ${instance.id}`}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">{instance.id}</TableCell>
                            <TableCell>{instance.name}</TableCell>
                            <TableCell>{instance.type}</TableCell>
                            <TableCell>{instance.region}</TableCell>
                            <TableCell>
                              <Badge className={getStateBadgeColor(instance.state)} variant="outline">
                                {instance.state}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="rds">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox 
                              checked={selectAllRDS} 
                              onCheckedChange={handleSelectAllRDS} 
                              aria-label="Select all RDS instances"
                            />
                          </TableHead>
                          <TableHead>Instance ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Engine</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead>State</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rdsInstances.map((instance) => (
                          <TableRow key={instance.id}>
                            <TableCell>
                              <Checkbox 
                                checked={instance.selected} 
                                onCheckedChange={() => toggleRdsInstanceSelection(instance.id)}
                                aria-label={`Select RDS instance ${instance.id}`}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">{instance.id}</TableCell>
                            <TableCell>{instance.name}</TableCell>
                            <TableCell>{instance.engine}</TableCell>
                            <TableCell>{instance.region}</TableCell>
                            <TableCell>
                              <Badge className={getStateBadgeColor(instance.state)} variant="outline">
                                {instance.state}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-4 text-sm text-gray-500">
                Selected: {selectedInstances.length} instances, {selectedRdsInstances.length} databases
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={selectedInstances.length === 0 && selectedRdsInstances.length === 0}
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

export default SelectInstances;
