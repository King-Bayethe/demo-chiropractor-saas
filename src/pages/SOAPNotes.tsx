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
import { useGHLApi } from "@/hooks/useGHLApi";
import { ComprehensiveSOAPForm, SOAPFormData } from "@/components/soap/ComprehensiveSOAPForm";
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

// SOAP Note interface
interface SOAPNote {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  appointmentId?: string;
  dateCreated: Date;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  chiefComplaint?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
  };
}

// Helper function to safely get patient name
const getPatientName = (patient: any): string => {
  if (!patient) return 'Unknown Patient';
  
  const firstName = patient.firstNameLowerCase || '';
  const lastName = patient.lastNameLowerCase || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  return fullName || patient.name || 'Unknown Patient';
};

export default function SOAPNotes() {
  const [soapNotes, setSoapNotes] = useState<SOAPNote[]>([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateSOAPOpen, setIsCreateSOAPOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SOAPNote | null>(null);
  const [isViewNoteOpen, setIsViewNoteOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    providerId: "",
    providerName: "Dr. Silverman",
    appointmentId: "",
    chiefComplaint: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: ""
  });
  const { toast } = useToast();
  const ghlApi = useGHLApi();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load patients from GHL contacts
      const contactsData = await ghlApi.contacts.getAll();
      const patientContacts = (contactsData.contacts || []).filter((contact: any) => 
        contact.tags?.some((tag: string) => 
          tag.toLowerCase().includes('patient') || 
          tag.toLowerCase().includes('treatment')
        ) || !contact.tags?.length
      );
      setPatients(patientContacts);
      
      // Mock SOAP notes data - in production, this would be stored in Supabase
      const mockSOAPNotes: SOAPNote[] = [
        {
          id: "soap-1",
          patientId: patientContacts[0]?.id || "patient-1",
          patientName: getPatientName(patientContacts[0]) || "John Smith",
          providerId: "dr-silverman",
          providerName: "Dr. Silverman",
          dateCreated: new Date(2024, 0, 15),
          chiefComplaint: "Lower back pain for 2 weeks",
          subjective: "Patient reports acute lower back pain that started 2 weeks ago after lifting heavy boxes. Pain is sharp, radiating to left leg. Worse in the morning, improves with movement. Pain scale 7/10.",
          objective: "Patient appears uncomfortable when sitting. Posture shows slight forward lean. ROM: Flexion limited to 45°, extension 15°. Positive straight leg raise test on left. Muscle spasm palpated in L4-L5 region.",
          assessment: "Acute lumbar strain with possible disc involvement. Rule out disc herniation. Functional limitations present.",
          plan: "1. Chiropractic adjustments 3x/week for 2 weeks\n2. Ice therapy 15 min, 3x daily\n3. Avoid heavy lifting\n4. Home exercises - gentle stretching\n5. Re-evaluate in 1 week\n6. Consider MRI if no improvement",
          vitalSigns: {
            bloodPressure: "120/80",
            heartRate: "72",
            temperature: "98.6",
            weight: "180"
          }
        },
        {
          id: "soap-2",
          patientId: patientContacts[1]?.id || "patient-2",
          patientName: getPatientName(patientContacts[1]) || "Sarah Johnson",
          providerId: "dr-silverman",
          providerName: "Dr. Silverman",
          dateCreated: new Date(2024, 0, 12),
          chiefComplaint: "Neck pain and headaches",
          subjective: "Patient presents with chronic neck pain and tension headaches for 3 months. Works at computer all day. Pain worse at end of workday. Headaches occur 2-3 times per week.",
          objective: "Forward head posture noted. Cervical ROM: Limited in all planes. Tender points at C2-C3, C5-C6. Upper trap muscles tight bilaterally. No neurological deficits noted.",
          assessment: "Cervical dysfunction with myofascial pain syndrome. Postural syndrome related to prolonged computer use.",
          plan: "1. Cervical adjustments\n2. Soft tissue therapy\n3. Ergonomic evaluation\n4. Postural exercises\n5. Return in 3 days",
          vitalSigns: {
            bloodPressure: "118/76",
            heartRate: "68"
          }
        }
      ];
      setSoapNotes(mockSOAPNotes);
    } catch (error) {
      console.error('Failed to load SOAP notes data:', error);
      toast({
        title: "Error",
        description: "Failed to load SOAP notes data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedPatient = patients.find((p: any) => p.id === formData.patientId);
      
      const newSOAPNote: SOAPNote = {
        id: `soap-${Date.now()}`,
        patientId: formData.patientId,
        patientName: getPatientName(selectedPatient),
        providerId: formData.providerId || 'dr-silverman',
        providerName: formData.providerName,
        dateCreated: new Date(),
        chiefComplaint: formData.chiefComplaint,
        subjective: formData.subjective,
        objective: formData.objective,
        assessment: formData.assessment,
        plan: formData.plan,
        vitalSigns: {
          bloodPressure: formData.bloodPressure || undefined,
          heartRate: formData.heartRate || undefined,
          temperature: formData.temperature || undefined,
          weight: formData.weight || undefined
        }
      };

      setSoapNotes(prev => [newSOAPNote, ...prev]);
      setIsCreateSOAPOpen(false);
      
      toast({
        title: "SOAP Note Created",
        description: `SOAP note for ${newSOAPNote.patientName} has been created successfully.`,
      });
      
      // Reset form
      setFormData({
        patientId: "",
        providerId: "",
        providerName: "Dr. Silverman",
        appointmentId: "",
        chiefComplaint: "",
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        weight: ""
      });
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
                <Button variant="outline" size="sm">
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
                        note.dateCreated.getMonth() === new Date().getMonth()
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
                              No SOAP notes found
                            </td>
                          </tr>
                        ) : (
                          soapNotes.map((note) => (
                            <tr key={note.id} className="hover:bg-muted/20 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm">
                                      {note.dateCreated.toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {note.dateCreated.toLocaleTimeString('en-US', { 
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
                                      {note.patientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">{note.patientName}</p>
                                    <p className="text-xs text-muted-foreground">ID: {note.patientId.slice(-8)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{note.providerName}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="text-sm max-w-xs truncate" title={note.chiefComplaint}>
                                  {note.chiefComplaint || 'No chief complaint recorded'}
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
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <FileText className="w-4 h-4 mr-1" />
                                    Export
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Comprehensive SOAP Form */}
          <ComprehensiveSOAPForm
            isOpen={isCreateSOAPOpen}
            onClose={() => setIsCreateSOAPOpen(false)}
            patient={patients.find((p: any) => p.id === formData.patientId)}
            onSave={(data: SOAPFormData) => {
              const newSOAPNote: SOAPNote = {
                id: `soap-${Date.now()}`,
                patientId: data.patientId,
                patientName: data.patientName,
                providerId: data.providerId,
                providerName: data.providerName,
                dateCreated: data.dateCreated,
                chiefComplaint: data.chiefComplaint,
                subjective: `${data.subjective.painDescription} ${data.subjective.otherSymptoms}`.trim(),
                objective: `Vital Signs: BP: ${data.objective.vitalSigns.bloodPressure}, HR: ${data.objective.vitalSigns.heartRate}`,
                assessment: data.assessment.clinicalImpression,
                plan: data.plan.additionalInstructions,
                vitalSigns: {
                  bloodPressure: data.objective.vitalSigns.bloodPressure,
                  heartRate: data.objective.vitalSigns.heartRate,
                  temperature: data.objective.vitalSigns.temperature,
                  weight: data.objective.vitalSigns.weight
                }
              };
              setSoapNotes(prev => [newSOAPNote, ...prev]);
            }}
          />

          {/* View SOAP Note Modal */}
          <Dialog open={isViewNoteOpen} onOpenChange={setIsViewNoteOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  SOAP Note - {selectedNote?.patientName}
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {selectedNote?.dateCreated.toLocaleDateString()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsViewNoteOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              {selectedNote && (
                <div className="space-y-6">
                  {/* Header Info */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Patient</p>
                          <p className="font-medium">{selectedNote.patientName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Provider</p>
                          <p className="font-medium">{selectedNote.providerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {selectedNote.dateCreated.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {selectedNote.chiefComplaint && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">Chief Complaint</p>
                          <p className="font-medium">{selectedNote.chiefComplaint}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Vital Signs */}
                  {selectedNote.vitalSigns && Object.keys(selectedNote.vitalSigns).some(key => selectedNote.vitalSigns![key as keyof typeof selectedNote.vitalSigns]) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Vital Signs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                          {selectedNote.vitalSigns.bloodPressure && (
                            <div>
                              <p className="text-sm text-muted-foreground">Blood Pressure</p>
                              <p className="font-medium">{selectedNote.vitalSigns.bloodPressure}</p>
                            </div>
                          )}
                          {selectedNote.vitalSigns.heartRate && (
                            <div>
                              <p className="text-sm text-muted-foreground">Heart Rate</p>
                              <p className="font-medium">{selectedNote.vitalSigns.heartRate} bpm</p>
                            </div>
                          )}
                          {selectedNote.vitalSigns.temperature && (
                            <div>
                              <p className="text-sm text-muted-foreground">Temperature</p>
                              <p className="font-medium">{selectedNote.vitalSigns.temperature}°F</p>
                            </div>
                          )}
                          {selectedNote.vitalSigns.weight && (
                            <div>
                              <p className="text-sm text-muted-foreground">Weight</p>
                              <p className="font-medium">{selectedNote.vitalSigns.weight} lbs</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* SOAP Sections */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-medical-blue">Subjective</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{selectedNote.subjective}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-medical-teal">Objective</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{selectedNote.objective}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-yellow-600">Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{selectedNote.assessment}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-success">Plan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{selectedNote.plan}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Note
                    </Button>
                    <Button variant="outline">
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