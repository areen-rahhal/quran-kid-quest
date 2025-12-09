import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Goals from "./pages/Goals";
import UnitPath from "./pages/UnitPath";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Onboarding from "./pages/Onboarding";
import LearnersProfiles from "./pages/LearnersProfiles";
import AddChildProfile from "./pages/AddChildProfile";
import Learner from "./pages/Learner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * Wrapper component to pass authenticated user from AuthContext to ProfileProvider
 * This is necessary because ProfileProvider needs the user from AuthContext
 */
const AppContent = () => {
  const { user } = useAuth();
  return (
    <ProfileProvider authenticatedUser={user}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/unit-path/:profileId/:goalId/:unitId" element={<UnitPath />} />
          <Route path="/learners-profiles" element={<LearnersProfiles />} />
          <Route path="/add-child-profile" element={<AddChildProfile />} />
          <Route path="/learner/:id" element={<Learner />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
