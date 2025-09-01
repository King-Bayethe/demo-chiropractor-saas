import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { ChiropracticSOAPQuestionnaire } from "@/components/ChiropracticSOAPQuestionnaire";

import { FormSubmissionDetails } from "@/components/forms/FormSubmissionDetails";
import { exportFormToCSV, exportFormToPDF, exportMultipleFormsToCSV } from "@/utils/formExport";
import { toast } from "sonner";
import { 
  FileText, 
  Users, 
  ClipboardList, 
  Eye,
  Calendar,
  Mail,
  Phone,
  User,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Plus,
  Stethoscope,
  FileDown,
  Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface FormSubmission {
  id: string;
  form_type: string;
  form_data: any;
  submitted_at: string;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  status: string;
}

export default function Forms() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showSOAPQuestionnaire, setShowSOAPQuestionnaire] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        toast.error("Failed to fetch form submissions");
        return;
      }

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to fetch form submissions");
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('form_submissions')
        .update({ status: newStatus })
        .eq('id', submissionId);

      if (error) {
        throw error;
      }

      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === submissionId ? { ...sub, status: newStatus } : sub
        )
      );

      toast.success("Status updated successfully");
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Failed to update status");
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const typeMatch = filterType === "all" || submission.form_type === filterType;
    const statusMatch = filterStatus === "all" || submission.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getFormTypeDisplay = (type: string) => {
    switch (type) {
      case 'pip':
        return { name: 'PIP Patient Form', icon: ClipboardList, color: 'bg-blue-500/10 text-blue-700' };
      case 'lop':
        return { name: 'LOP Form', icon: FileText, color: 'bg-green-500/10 text-green-700' };
      case 'cash':
        return { name: 'Cash Patient Form', icon: Users, color: 'bg-purple-500/10 text-purple-700' };
      case 'soap_questionnaire':
        return { name: 'Chiropractic SOAP Questionnaire', icon: Stethoscope, color: 'bg-medical-teal/10 text-medical-teal' };
      case 'lead_intake':
        return { name: 'Lead Intake Form', icon: User, color: 'bg-orange-500/10 text-orange-700' };
      default:
        return { name: type, icon: FileText, color: 'bg-gray-500/10 text-gray-700' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700"><Eye className="w-3 h-3 mr-1" />Reviewed</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleExportForm = (submission: FormSubmission, format: 'csv' | 'pdf') => {
    try {
      if (format === 'csv') {
        exportFormToCSV(submission);
        toast.success("CSV exported successfully");
      } else if (format === 'pdf') {
        exportFormToPDF(submission);
        toast.success("PDF exported successfully");
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${format.toUpperCase()}`);
    }
  };

  const handleSOAPQuestionnaireSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_type: 'soap_questionnaire',
          form_data: data,
          patient_name: data.patientName,
          patient_email: data.patientEmail || null,
          patient_phone: data.patientPhone || null,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("SOAP Questionnaire submitted successfully");
      setShowSOAPQuestionnaire(false);
      fetchSubmissions(); // Refresh the list
    } catch (error) {
      console.error('Error submitting SOAP questionnaire:', error);
      toast.error("Failed to submit SOAP questionnaire");
    }
  };


  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    pip: submissions.filter(s => s.form_type === 'pip').length,
    lop: submissions.filter(s => s.form_type === 'lop').length,
    cash: submissions.filter(s => s.form_type === 'cash').length,
    soap: submissions.filter(s => s.form_type === 'soap_questionnaire').length,
    lead: submissions.filter(s => s.form_type === 'lead_intake').length,
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading form submissions...</p>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="container mx-auto p-3 md:p-6 space-y-4 md:space-y-6 max-w-full overflow-hidden">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-3xl font-bold text-foreground break-words">Form Submissions</h1>
              <p className="text-sm md:text-base text-muted-foreground">View and manage patient form submissions</p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-2 flex-shrink-0">
              <Button 
                variant="outline"
                onClick={() => exportMultipleFormsToCSV(filteredSubmissions)}
                disabled={filteredSubmissions.length === 0}
                className="w-full md:w-auto"
                size={isMobile ? "sm" : "default"}
              >
                <Package className="w-4 h-4 mr-2" />
                Export All CSV
              </Button>
              <Button 
                onClick={() => setShowSOAPQuestionnaire(true)}
                className="bg-accent hover:bg-accent/80 w-full md:w-auto"
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="w-4 h-4 mr-2" />
                New SOAP Questionnaire
              </Button>
            </div>
          </div>

          {/* Public Forms Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Public Forms
              </CardTitle>
              <CardDescription>
                Access public patient intake forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <Button 
                  variant="outline" 
                  className={cn(
                    "h-16 md:h-20 flex flex-col gap-2 md:gap-3 hover:scale-105 transition-transform duration-200 border-2 hover:border-primary/50",
                    "text-xs md:text-sm"
                  )}
                  onClick={() => window.open('/public/pip-form', '_blank')}
                >
                  <ClipboardList className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  <span className="font-medium">PIP Form</span>
                  <span className="text-xs text-muted-foreground hidden md:block">Personal Injury Protection</span>
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    "h-16 md:h-20 flex flex-col gap-2 md:gap-3 hover:scale-105 transition-transform duration-200 border-2 hover:border-success/50",
                    "text-xs md:text-sm"
                  )}
                  onClick={() => window.open('/public/lop-form', '_blank')}
                >
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-success" />
                  <span className="font-medium">LOP Form</span>
                  <span className="text-xs text-muted-foreground hidden md:block">Letter of Protection</span>
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    "h-16 md:h-20 flex flex-col gap-2 md:gap-3 hover:scale-105 transition-transform duration-200 border-2 hover:border-accent/50",
                    "text-xs md:text-sm md:col-span-2 lg:col-span-1"
                  )}
                  onClick={() => window.open('/public/cash-form', '_blank')}
                >
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-accent" />
                  <span className="font-medium">Cash Form</span>
                  <span className="text-xs text-muted-foreground hidden md:block">Cash Payment Intake</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-lg md:text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-lg md:text-2xl font-bold text-warning">{stats.pending}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-lg md:text-2xl font-bold text-primary">{stats.pip}</div>
                <div className="text-xs md:text-sm text-muted-foreground">PIP</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-lg md:text-2xl font-bold text-success">{stats.lop}</div>
                <div className="text-xs md:text-sm text-muted-foreground">LOP</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-lg md:text-2xl font-bold text-accent">{stats.cash}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Cash</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-lg md:text-2xl font-bold text-accent">{stats.soap}</div>
                <div className="text-xs md:text-sm text-muted-foreground">SOAP</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-lg md:text-2xl font-bold text-warning">{stats.lead}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Leads</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Form Type</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="pip">PIP Forms</SelectItem>
                      <SelectItem value="lop">LOP Forms</SelectItem>
                      <SelectItem value="cash">Cash Forms</SelectItem>
                      <SelectItem value="soap_questionnaire">SOAP Questionnaires</SelectItem>
                      <SelectItem value="lead_intake">Lead Intake Forms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions ({filteredSubmissions.length})</CardTitle>
              <CardDescription>
                Click on any submission to view details and update status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No form submissions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => {
                    const formDisplay = getFormTypeDisplay(submission.form_type);
                    const FormIcon = formDisplay.icon;

                    return (
                      <Dialog key={submission.id}>
                        <DialogTrigger asChild>
                          <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-3 md:p-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                                <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
                                  <div className={`p-2 rounded-lg ${formDisplay.color} flex-shrink-0`}>
                                    <FormIcon className="w-4 h-4 md:w-5 md:h-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-sm md:text-base break-words">{formDisplay.name}</h3>
                                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-xs md:text-sm text-muted-foreground">
                                      {submission.patient_name && (
                                        <span className="flex items-center gap-1 break-words">
                                          <User className="w-3 h-3 flex-shrink-0" />
                                          <span className="break-words">{submission.patient_name}</span>
                                        </span>
                                      )}
                                      {submission.patient_email && (
                                        <span className="flex items-center gap-1 break-all">
                                          <Mail className="w-3 h-3 flex-shrink-0" />
                                          <span className="break-all">{submission.patient_email}</span>
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 flex-shrink-0" />
                                        {new Date(submission.submitted_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {getStatusBadge(submission.status)}
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </DialogTrigger>
                        <DialogContent className={cn("max-h-[80vh]", isMobile ? "max-w-[95vw] mx-2" : "max-w-4xl")}>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-sm md:text-base">
                              <FormIcon className="w-4 h-4 md:w-5 md:h-5" />
                              <span className="break-words">{formDisplay.name} - Submission Details</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs md:text-sm">
                              Submitted on {new Date(submission.submitted_at).toLocaleString()}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 md:space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 min-w-0">
                                {submission.patient_name && (
                                  <span className="flex items-center gap-1 text-xs md:text-sm break-words">
                                    <User className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                    <span className="break-words">{submission.patient_name}</span>
                                  </span>
                                )}
                                {submission.patient_email && (
                                  <span className="flex items-center gap-1 text-xs md:text-sm break-all">
                                    <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                    <span className="break-all">{submission.patient_email}</span>
                                  </span>
                                )}
                                {submission.patient_phone && (
                                  <span className="flex items-center gap-1 text-xs md:text-sm break-all">
                                    <Phone className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                    <span className="break-all">{submission.patient_phone}</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Select 
                                  value={submission.status} 
                                  onValueChange={(value) => updateSubmissionStatus(submission.id, value)}
                                >
                                  <SelectTrigger className="w-full md:w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <ScrollArea className={cn(isMobile ? "h-64" : "h-96")}>
                              <FormSubmissionDetails
                                formData={submission.form_data}
                                formType={submission.form_type}
                                submissionDate={submission.submitted_at}
                                submissionId={submission.id}
                                patientName={submission.patient_name || undefined}
                                onExport={(format) => handleExportForm(submission, format)}
                              />
                            </ScrollArea>
                          </div>
                        </DialogContent>
                      </Dialog>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SOAP Questionnaire Modal */}
          <ChiropracticSOAPQuestionnaire
            isOpen={showSOAPQuestionnaire}
            onClose={() => setShowSOAPQuestionnaire(false)}
            onSave={handleSOAPQuestionnaireSubmit}
          />

        </div>
      </Layout>
    </AuthGuard>
  );
}