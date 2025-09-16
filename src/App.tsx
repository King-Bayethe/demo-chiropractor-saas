import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AIProvider } from "@/contexts/AIContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationHandler } from "@/components/NotificationHandler";
import { AuthGuard } from "@/components/AuthGuard";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Contacts from "./pages/Contacts";
import Conversations from "./pages/Conversations";
import DemoConversations from "./pages/DemoConversations";
import TeamChat from "./pages/TeamChat";
import Forms from "./pages/Forms";
import Documents from "./pages/Documents";
import Emails from "./pages/Emails";
import Estimates from "./pages/Estimates";
import PaymentOrders from "./pages/PaymentOrders";
import Transactions from "./pages/Transactions";
import MediaLibrary from "./pages/MediaLibrary";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import Invoices from "./pages/Invoices";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import Calendar from "./pages/Calendar";
import SOAPNotes from "./pages/SOAPNotes";
import Opportunities from "./pages/Opportunities";

import NewSOAPNote from "./pages/NewSOAPNote";
import ViewSOAPNote from "./pages/ViewSOAPNote";
import EditSOAPNote from "./pages/EditSOAPNote";
import PublicPIPForm from "./pages/PublicPIPForm";
import PublicLOPForm from "./pages/PublicLOPForm";
import PublicCashForm from "./pages/PublicCashForm";
import PublicNewForm from "./pages/PublicNewForm";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="healthcare-portfolio-theme">
        <AuthProvider>
          <NotificationProvider>
            <AIProvider>
              <LanguageProvider>
                <TooltipProvider>
                  <NotificationHandler />
                  <Toaster />
                  <Sonner />
                  <Routes>
                    {/* Public Landing Page */}
                    <Route path="/landing" element={<Landing />} />
                    
                    {/* Public Forms */}
                    <Route path="/public/pip-form" element={<PublicPIPForm />} />
                    <Route path="/public/lop-form" element={<PublicLOPForm />} />
                    <Route path="/public/cash-form" element={<PublicCashForm />} />
                    <Route path="/public/new-form" element={<PublicNewForm />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
                    <Route path="/patients" element={<AuthGuard><Patients /></AuthGuard>} />
                    <Route path="/patients/:patientId" element={<AuthGuard><PatientProfile /></AuthGuard>} />
                    <Route path="/calendar" element={<AuthGuard><Calendar /></AuthGuard>} />
                    <Route path="/soap-notes" element={<AuthGuard><SOAPNotes /></AuthGuard>} />
                    <Route path="/soap-notes/new" element={<AuthGuard><NewSOAPNote /></AuthGuard>} />
                    <Route path="/soap-notes/view/:id" element={<AuthGuard><ViewSOAPNote /></AuthGuard>} />
                    <Route path="/soap-notes/edit/:id" element={<AuthGuard><EditSOAPNote /></AuthGuard>} />
                    
                    <Route path="/invoices" element={<AuthGuard><Invoices /></AuthGuard>} />
                    <Route path="/conversations" element={<AuthGuard><Conversations /></AuthGuard>} />
                    <Route path="/demo-conversations" element={<AuthGuard><DemoConversations /></AuthGuard>} />
                    <Route path="/team-chat" element={<AuthGuard><TeamChat /></AuthGuard>} />
                    <Route path="/contacts" element={<AuthGuard><Contacts /></AuthGuard>} />
                    <Route path="/opportunities" element={<AuthGuard><Opportunities /></AuthGuard>} />
                    <Route path="/forms" element={<AuthGuard><Forms /></AuthGuard>} />
                    <Route path="/documents" element={<AuthGuard><Documents /></AuthGuard>} />
                    <Route path="/emails" element={<AuthGuard><Emails /></AuthGuard>} />
                    <Route path="/estimates" element={<AuthGuard><Estimates /></AuthGuard>} />
                    <Route path="/payment-orders" element={<AuthGuard><PaymentOrders /></AuthGuard>} />
                    <Route path="/transactions" element={<AuthGuard><Transactions /></AuthGuard>} />
                    <Route path="/media-library" element={<AuthGuard><MediaLibrary /></AuthGuard>} />
                    <Route path="/tasks" element={<AuthGuard><Tasks /></AuthGuard>} />
                    <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
                    
                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </LanguageProvider>
            </AIProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
