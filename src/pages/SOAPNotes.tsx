import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSOAPNotes, SOAPNote } from "@/hooks/useSOAPNotes";
import { useSOAPStats } from "@/hooks/useSOAPStats";
import { SOAPStatsCards } from "@/components/soap/SOAPStatsCards";
import { SOAPFilters } from "@/components/soap/SOAPFilters";
import { SOAPNotesTable } from "@/components/soap/SOAPNotesTable";
import { SOAPNoteDisplay } from "@/components/soap/SOAPNoteDisplay";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Plus, FileText } from "lucide-react";

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
  const stats = useSOAPStats(soapNotes);

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

  const handleExportNote = (note: SOAPNote) => {
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
  };

  const thisMonthCount = soapNotes.filter(note => {
    const serviceDate = new Date(note.date_of_service);
    const now = new Date();
    return serviceDate.getMonth() === now.getMonth() && serviceDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Hero Header */}
        <div className={cn(
          "flex-shrink-0 space-y-6 bg-gradient-to-br from-muted/30 via-background to-muted/20",
          isMobile ? "p-4" : "p-6"
        )}>
          <div className={cn("flex justify-between", isMobile ? "flex-col space-y-3" : "items-center")}>
            <div>
              <h1 className={cn("font-bold text-foreground", isMobile ? "text-2xl" : "text-3xl md:text-4xl")}>
                SOAP Notes Management
              </h1>
              <p className={cn("text-muted-foreground mt-2", isMobile ? "text-sm" : "text-lg")}>
                Medical documentation and patient assessments
              </p>
            </div>
            
            <div className={cn("flex space-x-2", isMobile ? "w-full" : "items-center")}>
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

          {/* Stats Cards */}
          <SOAPStatsCards
            totalNotes={stats.totalNotes}
            notesThisMonth={stats.notesThisMonth}
            avgCompletionTime={stats.avgCompletionTime}
            activeProviders={stats.activeProviders}
          />

          {/* Filters */}
          <SOAPFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalCount={soapNotes.length}
            thisMonthCount={thisMonthCount}
          />
        </div>

        {/* Content Area */}
        <div className={cn("flex-1 min-h-0 overflow-auto", isMobile ? "p-4" : "p-6")}>
          <SOAPNotesTable
            soapNotes={soapNotes}
            loading={loading}
            onViewNote={handleViewNote}
            onEditNote={handleEditNote}
            onExportNote={handleExportNote}
            getPatientName={getPatientName}
          />
        </div>
      </div>

      {/* View Note Dialog */}
      <Dialog open={isViewNoteOpen} onOpenChange={setIsViewNoteOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>SOAP Note Details</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <SOAPNoteDisplay
              note={selectedNote}
              patientName={getPatientName(selectedNote.patients)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
