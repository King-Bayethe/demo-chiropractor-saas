import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSOAPNotes, SOAPNote } from "@/hooks/useSOAPNotes";
import { usePatients } from "@/hooks/usePatients";
import { ComprehensiveSOAPForm, SOAPFormData } from "@/components/soap/ComprehensiveSOAPForm";
import { SOAPNoteDisplay } from "@/components/soap/SOAPNoteDisplay";
import { PatientSelector } from "@/components/PatientSelector";
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Calendar,
  User,
  Clock,
  X,
  Edit,
  Eye
} from "lucide-react";

// Helper function to safely get patient name
const getPatientName = (patient: any): string => {
  if (!patient) return 'Unknown Patient';
  
  const firstName = patient.first_name || patient.firstNameLowerCase || '';
  const lastName = patient.last_name || patient.lastNameLowerCase || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  return fullName || patient.name || patient.email || 'Unknown Patient';
};

export default function SOAPNotes() {
  const [isCreateSOAPOpen, setIsCreateSOAPOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SOAPNote | null>(null);
  const [isViewNoteOpen, setIsViewNoteOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  const { toast } = useToast();
  const { soapNotes, loading, error, fetchSOAPNotes, createSOAPNote, updateSOAPNote, deleteSOAPNote } = useSOAPNotes();
  const { patients } = usePatients();

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        fetchSOAPNotes({ search: searchTerm });
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      fetchSOAPNotes();
    }
  }, [searchTerm]);

  const handleCreateSOAPNote = async (data: SOAPFormData) => {
    try {
      if (!selectedPatient) {
        toast({
          title: "Error",
          description: "Please select a patient first.",
          variant: "destructive",
        });
        return;
      }

      const result = await createSOAPNote({
        patient_id: selectedPatient.id,
        provider_name: data.providerName,
        date_of_service: data.dateCreated,
        chief_complaint: data.chiefComplaint,
        is_draft: data.isQuickNote,
        subjective_data: data.subjective,
        objective_data: data.objective,
        assessment_data: data.assessment,
        plan_data: data.plan,
        vital_signs: data.objective.vitalSigns
      });

      if (result) {
        setIsCreateSOAPOpen(false);
        setSelectedPatient(null);
        toast({
          title: "SOAP Note Created",
          description: `SOAP note for ${getPatientName(selectedPatient)} has been created successfully.`,
        });
      }
    } catch (error) {
      console.error('Failed to create SOAP note:', error);
      toast({
        title: "Error",
        description: "Failed to create SOAP note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewNote = (note: SOAPNote) => {
    setSelectedNote(note);
    setIsViewNoteOpen(true);
  };

  const handleEditNote = (note: SOAPNote) => {
    setSelectedNote(note);
    // Find the patient for this note
    const patient = patients.find(p => p.id === note.patient_id);
    if (patient) {
      setSelectedPatient(patient);
      setIsEditNoteOpen(true);
    }
  };

  const handleUpdateSOAPNote = async (data: SOAPFormData) => {
    try {
      if (!selectedNote) {
        toast({
          title: "Error",
          description: "No note selected for editing.",
          variant: "destructive",
        });
        return;
      }

      const result = await updateSOAPNote(selectedNote.id, {
        provider_name: data.providerName,
        date_of_service: data.dateCreated,
        chief_complaint: data.chiefComplaint,
        is_draft: data.isQuickNote,
        subjective_data: data.subjective,
        objective_data: data.objective,
        assessment_data: data.assessment,
        plan_data: data.plan,
        vital_signs: data.objective.vitalSigns
      });

      if (result) {
        setIsEditNoteOpen(false);
        setSelectedNote(null);
        setSelectedPatient(null);
        toast({
          title: "SOAP Note Updated",
          description: "SOAP note has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Failed to update SOAP note:', error);
      toast({
        title: "Error",
        description: "Failed to update SOAP note. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="flex-shrink-0 p-6 space-y-6 bg-background border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">SOAP Notes</h1>
                <p className="text-muted-foreground">Medical documentation and patient assessments</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (soapNotes.length === 0) {
                      toast({
                        title: "No Data",
                        description: "No SOAP notes available to export.",
                      });
                      return;
                    }
                    
                    // Export all notes as a summary
                    toast({
                      title: "Bulk Export",
                      description: "Bulk export feature coming soon!",
                    });
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" onClick={() => setIsCreateSOAPOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New SOAP Note
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="border border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search by patient name, provider, or chief complaint..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Total Notes: {soapNotes.length}</Badge>
                    <Badge variant="outline" className="bg-medical-blue/10 text-medical-blue">
                      This Month: {soapNotes.filter(note => 
                        new Date(note.date_of_service).getMonth() === new Date().getMonth()
                      ).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
              
              {/* SOAP Notes List */}
              <Card className="border border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>All SOAP Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border/50 bg-muted/30">
                        <tr>
                          <th className="text-left p-4 font-medium text-sm">Date</th>
                          <th className="text-left p-4 font-medium text-sm">Patient</th>
                          <th className="text-left p-4 font-medium text-sm">Provider</th>
                          <th className="text-left p-4 font-medium text-sm">Chief Complaint</th>
                          <th className="text-left p-4 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {loading ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground">
                              Loading SOAP notes...
                            </td>
                          </tr>
                        ) : soapNotes.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground">
                              {error ? `Error: ${error}` : 'No SOAP notes found'}
                            </td>
                          </tr>
                        ) : (
                          soapNotes.map((note) => {
                            const patientName = getPatientName(note.patients) || 'Unknown Patient';
                            const dateOfService = new Date(note.date_of_service);
                            
                            return (
                              <tr key={note.id} className="hover:bg-muted/20 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium text-sm">
                                        {dateOfService.toLocaleDateString()}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {dateOfService.toLocaleTimeString('en-US', { 
                                          hour: 'numeric', 
                                          minute: '2-digit' 
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-medical-blue/10 text-medical-blue text-xs">
                                        {patientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-sm">{patientName}</p>
                                      <p className="text-xs text-muted-foreground">ID: {note.patient_id.slice(-8)}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{note.provider_name}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <p className="text-sm max-w-xs truncate" title={note.chief_complaint}>
                                    {note.chief_complaint || 'No chief complaint recorded'}
                                  </p>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleViewNote(note)}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleEditNote(note)}
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      Edit
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => {
                                        const patientName = getPatientName(note.patients);
                                        import('../services/pdfExport').then(({ exportSOAPNoteToPDF }) => {
                                          exportSOAPNoteToPDF(note, patientName);
                                          toast({
                                            title: "PDF Export",
                                            description: "PDF exported successfully!",
                                          });
                                        }).catch((error) => {
                                          console.error('PDF export error:', error);
                                          toast({
                                            title: "Export Error",
                                            description: "Failed to export PDF. Please try again.",
                                            variant: "destructive",
                                          });
                                        });
                                      }}
                                    >
                                      <FileText className="w-4 h-4 mr-1" />
                                      Export
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Patient Selection */}
          {isCreateSOAPOpen && (
            <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
              <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Select Patient</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PatientSelector
                      selectedPatient={selectedPatient}
                      onPatientSelect={setSelectedPatient}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsCreateSOAPOpen(false);
                          setSelectedPatient(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          if (selectedPatient) {
                            // Patient selected, now open the form
                            setIsCreateSOAPOpen(false);
                            setTimeout(() => setIsCreateSOAPOpen(true), 100);
                          }
                        }}
                        disabled={!selectedPatient}
                      >
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Comprehensive SOAP Form - Create */}
          {selectedPatient && !isEditNoteOpen && (
            <ComprehensiveSOAPForm
              isOpen={isCreateSOAPOpen}
              onClose={() => {
                setIsCreateSOAPOpen(false);
                setSelectedPatient(null);
              }}
              patient={selectedPatient}
              onSave={handleCreateSOAPNote}
            />
          )}

          {/* Comprehensive SOAP Form - Edit */}
          {selectedPatient && selectedNote && (
            <ComprehensiveSOAPForm
              isOpen={isEditNoteOpen}
              onClose={() => {
                setIsEditNoteOpen(false);
                setSelectedNote(null);
                setSelectedPatient(null);
              }}
              patient={selectedPatient}
              initialData={{
                patientId: selectedNote.patient_id,
                patientName: getPatientName(selectedNote.patients),
                providerId: selectedNote.provider_id,
                providerName: selectedNote.provider_name,
                dateCreated: new Date(selectedNote.date_of_service),
                chiefComplaint: selectedNote.chief_complaint || "",
                isQuickNote: selectedNote.is_draft,
                subjective: selectedNote.subjective_data as any,
                objective: selectedNote.objective_data as any,
                assessment: selectedNote.assessment_data as any,
                plan: selectedNote.plan_data as any
              }}
              onSave={handleUpdateSOAPNote}
            />
          )}

          {/* View SOAP Note Modal */}
          <Dialog open={isViewNoteOpen} onOpenChange={setIsViewNoteOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  SOAP Note - {getPatientName(selectedNote?.patients)}
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {selectedNote ? new Date(selectedNote.date_of_service).toLocaleDateString() : ''}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => setIsViewNoteOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              {selectedNote && (
                <div className="space-y-6">
                  <SOAPNoteDisplay 
                    note={selectedNote} 
                    patientName={getPatientName(selectedNote?.patients)}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setIsViewNoteOpen(false);
                        if (selectedNote) {
                          handleEditNote(selectedNote);
                        }
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Note
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const patientName = getPatientName(selectedNote?.patients);
                        if (selectedNote) {
                          import('../services/pdfExport').then(({ exportSOAPNoteToPDF }) => {
                            exportSOAPNoteToPDF(selectedNote, patientName);
                            toast({
                              title: "PDF Export",
                              description: "PDF exported successfully!",
                            });
                          }).catch((error) => {
                            console.error('PDF export error:', error);
                            toast({
                              title: "Export Error",
                              description: "Failed to export PDF. Please try again.",
                              variant: "destructive",
                            });
                          });
                        }
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </AuthGuard>
  );
}