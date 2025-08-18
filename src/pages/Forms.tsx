import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { ChiropracticSOAPQuestionnaire } from "@/components/ChiropracticSOAPQuestionnaire";
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
  Stethoscope
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const renderFormData = (formData: any, formType: string) => {
    const sections = [];

    // Personal Information
    if (formData.firstName || formData.lastName) {
      sections.push(
        <div key="personal" className="space-y-3">
          <h4 className="font-semibold text-primary">Personal Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {formData.firstName && (
              <div>
                <span className="font-medium">First Name:</span> {formData.firstName}
              </div>
            )}
            {formData.lastName && (
              <div>
                <span className="font-medium">Last Name:</span> {formData.lastName}
              </div>
            )}
            {formData.email && (
              <div>
                <span className="font-medium">Email:</span> {formData.email}
              </div>
            )}
            {formData.cellPhone && (
              <div>
                <span className="font-medium">Phone:</span> {formData.cellPhone}
              </div>
            )}
            {formData.dob && (
              <div>
                <span className="font-medium">Date of Birth:</span> {formData.dob}
              </div>
            )}
            {formData.address && (
              <div className="col-span-2">
                <span className="font-medium">Address:</span> {formData.address}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Accident Information
    if (formData.accidentDate || formData.accidentDescription) {
      sections.push(
        <div key="accident" className="space-y-3">
          <h4 className="font-semibold text-primary">Accident Information</h4>
          <div className="space-y-2 text-sm">
            {formData.accidentDate && (
              <div>
                <span className="font-medium">Date of Accident:</span> {formData.accidentDate}
              </div>
            )}
            {formData.accidentTime && (
              <div>
                <span className="font-medium">Time of Accident:</span> {formData.accidentTime}
              </div>
            )}
            {formData.accidentType && (
              <div>
                <span className="font-medium">Type of Accident:</span> {formData.accidentType}
              </div>
            )}
            {formData.accidentDescription && (
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-1 p-2 bg-muted rounded">{formData.accidentDescription}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Insurance Information (for PIP forms)
    if (formType === 'pip' && (formData.insuranceCo || formData.attorneyName)) {
      sections.push(
        <div key="insurance" className="space-y-3">
          <h4 className="font-semibold text-primary">Insurance & Legal</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {formData.insuranceCo && (
              <div>
                <span className="font-medium">Insurance Company:</span> {formData.insuranceCo}
              </div>
            )}
            {formData.policyNumber && (
              <div>
                <span className="font-medium">Policy Number:</span> {formData.policyNumber}
              </div>
            )}
            {formData.attorneyName && (
              <div>
                <span className="font-medium">Attorney:</span> {formData.attorneyName}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Symptoms (for forms that have them)
    if (formData.symptoms && typeof formData.symptoms === 'object') {
      const activeSymptoms = Object.entries(formData.symptoms)
        .filter(([_, active]) => active)
        .map(([symptom, _]) => symptom);

      if (activeSymptoms.length > 0) {
        sections.push(
          <div key="symptoms" className="space-y-3">
            <h4 className="font-semibold text-primary">Symptoms</h4>
            <div className="flex flex-wrap gap-2">
              {activeSymptoms.map((symptom) => (
                <Badge key={symptom} variant="outline" className="text-xs">
                  {symptom.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              ))}
            </div>
          </div>
        );
      }
    }

    return sections;
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
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Form Submissions</h1>
              <p className="text-muted-foreground">View and manage patient form submissions</p>
            </div>
            <Button 
              onClick={() => setShowSOAPQuestionnaire(true)}
              className="bg-medical-teal hover:bg-medical-teal/80"
            >
              <Plus className="w-4 h-4 mr-2" />
              New SOAP Questionnaire
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Submissions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.pip}</div>
                <div className="text-sm text-muted-foreground">PIP Forms</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.lop}</div>
                <div className="text-sm text-muted-foreground">LOP Forms</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.cash}</div>
                <div className="text-sm text-muted-foreground">Cash Forms</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-medical-teal">{stats.soap}</div>
                <div className="text-sm text-muted-foreground">SOAP Forms</div>
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
              <div className="flex gap-4">
                <div className="flex-1">
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
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
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`p-2 rounded-lg ${formDisplay.color}`}>
                                    <FormIcon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{formDisplay.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      {submission.patient_name && (
                                        <span className="flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          {submission.patient_name}
                                        </span>
                                      )}
                                      {submission.patient_email && (
                                        <span className="flex items-center gap-1">
                                          <Mail className="w-3 h-3" />
                                          {submission.patient_email}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(submission.submitted_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(submission.status)}
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <FormIcon className="w-5 h-5" />
                              {formDisplay.name} - Submission Details
                            </DialogTitle>
                            <DialogDescription>
                              Submitted on {new Date(submission.submitted_at).toLocaleString()}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {submission.patient_name && (
                                  <span className="flex items-center gap-1 text-sm">
                                    <User className="w-4 h-4" />
                                    {submission.patient_name}
                                  </span>
                                )}
                                {submission.patient_email && (
                                  <span className="flex items-center gap-1 text-sm">
                                    <Mail className="w-4 h-4" />
                                    {submission.patient_email}
                                  </span>
                                )}
                                {submission.patient_phone && (
                                  <span className="flex items-center gap-1 text-sm">
                                    <Phone className="w-4 h-4" />
                                    {submission.patient_phone}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Select 
                                  value={submission.status} 
                                  onValueChange={(value) => updateSubmissionStatus(submission.id, value)}
                                >
                                  <SelectTrigger className="w-32">
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

                            <ScrollArea className="h-96">
                              <div className="space-y-6">
                                {renderFormData(submission.form_data, submission.form_type)}
                              </div>
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