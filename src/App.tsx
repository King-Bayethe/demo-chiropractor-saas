import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Contacts from "./pages/Contacts";
import Conversations from "./pages/Conversations";
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
import PublicPIPForm from "./pages/PublicPIPForm";
import PublicLOPForm from "./pages/PublicLOPForm";
import PublicCashForm from "./pages/PublicCashForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="crm-ui-theme">
      <AuthProvider>
        <NotificationProvider>
          <LanguageProvider>
          <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:patientId" element={<PatientProfile />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/soap-notes" element={<SOAPNotes />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/conversations" element={<Conversations />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
