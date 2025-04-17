import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, UNSAFE_NavigationContext } from "react-router-dom";
import { ReportProvider } from "@/context/ReportContext";

import SelectProvider from "./pages/SelectProvider";
import ReportTypeSelection from "./pages/ReportTypeSelection";
import EnterCredentials from "./pages/EnterCredentials";
import SelectInstances from "./pages/SelectInstances";
import DateSelection from "./pages/DateSelection";
import ReportType from "./pages/ReportType";
import GenerateReport from "./pages/GenerateReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ReportProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SelectProvider />} />
            <Route path="/report-type" element={<ReportTypeSelection />} />
            <Route path="/credentials" element={<EnterCredentials />} />
            <Route path="/instances" element={<SelectInstances />} />
            <Route path="/date-selection" element={<DateSelection />} />
            <Route path="/report-details" element={<ReportType />} />
            <Route path="/generate-report" element={<GenerateReport />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ReportProvider>
  </QueryClientProvider>
);

export default App;