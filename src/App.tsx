import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AIProvider } from "@/contexts/AIContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationHandler } from "@/components/NotificationHandler";
import Index from "./pages/Index";
import Contacts from "./pages/Contacts";
import Conversations from "./pages/Conversations";
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
        <NotificationProvider>
          <AIProvider>
            <LanguageProvider>
              <TooltipProvider>
                <NotificationHandler />
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                    <Route path="/patients" element={<Patients />} />
                    <Route path="/patients/:patientId" element={<PatientProfile />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/soap-notes" element={<SOAPNotes />} />
                    <Route path="/soap-notes/new" element={<NewSOAPNote />} />
                    <Route path="/soap-notes/view/:id" element={<ViewSOAPNote />} />
                    <Route path="/soap-notes/edit/:id" element={<EditSOAPNote />} />
                    
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/conversations" element={<Conversations />} />
                    <Route path="/team-chat" element={<TeamChat />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/opportunities" element={<Opportunities />} />
                    <Route path="/forms" element={<Forms />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/emails" element={<Emails />} />
                    <Route path="/estimates" element={<Estimates />} />
                    <Route path="/payment-orders" element={<PaymentOrders />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/media-library" element={<MediaLibrary />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/public/pip-form" element={<PublicPIPForm />} />
                    <Route path="/public/lop-form" element={<PublicLOPForm />} />
                    <Route path="/public/cash-form" element={<PublicCashForm />} />
                    <Route path="/public/new-form" element={<PublicNewForm />} />
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </LanguageProvider>
            </AIProvider>
          </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
