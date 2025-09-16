import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
// AuthGuard removed for public portfolio
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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
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
  Eye,
  MoreHorizontal
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Helper function to safely get patient name
const getPatientName = (patient: any): string => {
  if (!patient) return 'Unknown Patient';
  
  const firstName = patient.first_name || patient.firstNameLowerCase || '';
  const lastName = patient.last_name || patient.lastNameLowerCase || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  return fullName || patient.name || patient.email || 'Unknown Patient';
};

export default function SOAPNotes() {
  const navigate = useNavigate();
  const [selectedNote, setSelectedNote] = useState<SOAPNote | null>(null);
  const [isViewNoteOpen, setIsViewNoteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();
  
  const { toast } = useToast();
  const { soapNotes, loading, error, fetchSOAPNotes } = useSOAPNotes();
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


  const handleViewNote = (note: SOAPNote) => {
    setSelectedNote(note);
    setIsViewNoteOpen(true);
  };

  const handleEditNote = (note: SOAPNote) => {
    navigate(`/soap-notes/edit/${note.id}`);
  };


  return (
    <Layout>
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className={cn("flex-shrink-0 space-y-4 bg-background border-b border-border/50",
            isMobile ? "p-4" : "p-6 space-y-6"
          )}>
            <div className={cn("flex justify-between",
              isMobile ? "flex-col space-y-3" : "items-center"
            )}>
              <div>
                <h1 className={cn("font-bold text-foreground",
                  isMobile ? "text-xl" : "text-3xl"
                )}>
                  SOAP Notes
                </h1>
                <p className={cn("text-muted-foreground",
                  isMobile ? "text-sm" : ""
                )}>
                  Medical documentation and patient assessments
                </p>
              </div>
              
              <div className={cn("flex space-x-2",
                isMobile ? "w-full" : "items-center"
              )}>
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "sm"}
                  className={cn(isMobile ? "flex-1" : "")}
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
                  <FileText className={cn("mr-2", isMobile ? "w-3 h-3" : "w-4 h-4")} />
                  {isMobile ? "Export" : "Export"}
                </Button>
                <Button 
                  size={isMobile ? "sm" : "sm"} 
                  onClick={() => navigate('/soap-notes/new')}
                  className={cn(isMobile ? "flex-1" : "")}
                >
                  <Plus className={cn("mr-2", isMobile ? "w-3 h-3" : "w-4 h-4")} />
                  {isMobile ? "New Note" : "New SOAP Note"}
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="border border-border/50 shadow-sm">
              <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                <div className={cn("flex space-x-3",
                  isMobile ? "flex-col space-y-3 space-x-0" : "items-center space-x-4"
                )}>
                  <div className="relative flex-1">
                    <Search className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground",
                      isMobile ? "w-3 h-3" : "w-4 h-4"
                    )} />
                    <Input 
                      placeholder={isMobile ? "Search notes..." : "Search by patient name, provider, or chief complaint..."} 
                      className={cn(isMobile ? "pl-9 h-9 text-sm" : "pl-10")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {!isMobile && (
                    <>
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
                    </>
                  )}
                  
                  {isMobile && (
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        <Filter className="w-3 h-3 mr-2" />
                        Filters
                      </Button>
                      <div className="flex space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {soapNotes.length} Notes
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className={cn("flex-1 overflow-auto space-y-4",
              isMobile ? "px-4 py-4" : "px-6 py-6 space-y-6"
            )}>
              
              {/* SOAP Notes List */}
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className={cn(isMobile ? "p-3 pb-2" : "")}>
                  <CardTitle className={cn(isMobile ? "text-base" : "")}>
                    All SOAP Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isMobile ? (
                    // Mobile Card View
                    <div className="space-y-3 p-3">
                      {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="text-sm">Loading SOAP notes...</div>
                        </div>
                      ) : soapNotes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="text-sm">
                            {error ? `Error: ${error}` : 'No SOAP notes found'}
                          </div>
                        </div>
                      ) : (
                        soapNotes.map((note) => {
                          const patientName = getPatientName(note.patients) || 'Unknown Patient';
                          const dateOfService = new Date(note.date_of_service);
                          
                          return (
                            <Card key={note.id} className="border border-border/50">
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  {/* Patient and Date */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="bg-medical-blue/10 text-medical-blue text-xs">
                                          {patientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{patientName}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {dateOfService.toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                                        <DropdownMenuItem onClick={() => handleViewNote(note)}>
                                          <Eye className="w-3 h-3 mr-2" />
                                          View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleEditNote(note)}>
                                          <Edit className="w-3 h-3 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
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
                                        }}>
                                          <FileText className="w-3 h-3 mr-2" />
                                          Export
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  
                                  {/* Provider and Chief Complaint */}
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <User className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">{note.provider_name}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {note.chief_complaint || 'No chief complaint recorded'}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  ) : (
                    // Desktop Table View
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
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* View SOAP Note Modal */}
          <Dialog open={isViewNoteOpen} onOpenChange={setIsViewNoteOpen}>
            <DialogContent className={cn("max-h-[90vh] overflow-y-auto",
              isMobile ? "sm:max-w-[95vw] w-[95vw] h-[90vh]" : "sm:max-w-4xl"
            )}>
              <DialogHeader>
                <DialogTitle className={cn("flex justify-between",
                  isMobile ? "flex-col space-y-2 items-start" : "items-center"
                )}>
                  <span className={cn(isMobile ? "text-base" : "")}>
                    SOAP Note - {getPatientName(selectedNote?.patients)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={cn(isMobile ? "text-xs" : "")}>
                      {selectedNote ? new Date(selectedNote.date_of_service).toLocaleDateString() : ''}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsViewNoteOpen(false)}
                      className={cn(isMobile ? "h-8 w-8" : "")}
                    >
                      <X className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              {selectedNote && (
                <div className={cn("space-y-4", isMobile ? "space-y-3" : "space-y-6")}>
                  <SOAPNoteDisplay 
                    note={selectedNote} 
                    patientName={getPatientName(selectedNote?.patients)}
                  />
                  
                  <div className={cn("flex space-x-2 pt-4 border-t",
                    isMobile ? "flex-col space-y-2 space-x-0" : "justify-end"
                  )}>
                    <Button 
                      variant="outline"
                      size={isMobile ? "sm" : "default"}
                      className={cn(isMobile ? "w-full" : "")}
                      onClick={() => {
                        setIsViewNoteOpen(false);
                        if (selectedNote) {
                          handleEditNote(selectedNote);
                        }
                      }}
                    >
                      <Edit className={cn("mr-2", isMobile ? "w-3 h-3" : "w-4 h-4")} />
                      Edit Note
                    </Button>
                    <Button 
                      variant="outline"
                      size={isMobile ? "sm" : "default"}
                      className={cn(isMobile ? "w-full" : "")}
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
                      <FileText className={cn("mr-2", isMobile ? "w-3 h-3" : "w-4 h-4")} />
                      Export PDF
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
  );
}