import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initAuth } from "@/lib/store";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Allergies from "./pages/Allergies";
import Medications from "./pages/Medications";
import { PrescriptionsPage, ReportsPage, ScansPage } from "./pages/FilesPage";
import Scan from "./pages/Scan";
import Summary from "./pages/Summary";
import QrPage from "./pages/QrPage";
import Emergency from "./pages/Emergency";
import EmergencyScanner from "./pages/EmergencyScanner";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => { initAuth(); }, []);
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/allergies" element={<Allergies />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/scans" element={<ScansPage />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/qr" element={<QrPage />} />
          <Route path="/emergency" element={<EmergencyScanner />} />
          <Route path="/emergency/:token" element={<Emergency />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
};

export default App;
