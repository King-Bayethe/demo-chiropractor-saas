import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SOAPNote } from "@/hooks/useSOAPNotes";
import { Calendar, User, Eye, Edit, FileText, MoreHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface SOAPNotesTableProps {
  soapNotes: SOAPNote[];
  loading: boolean;
  onViewNote: (note: SOAPNote) => void;
  onEditNote: (note: SOAPNote) => void;
  onExportNote: (note: SOAPNote) => void;
  getPatientName: (patient: any) => string;
}

export function SOAPNotesTable({
  soapNotes,
  loading,
  onViewNote,
  onEditNote,
  onExportNote,
  getPatientName,
}: SOAPNotesTableProps) {
  const isMobile = useIsMobile();

  return (
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
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No SOAP Notes Found</h3>
                <p className="text-muted-foreground text-center">
                  No notes match your search criteria.
                </p>
              </div>
            ) : (
              soapNotes.map((note) => {
                const patientName = getPatientName(note.patients);
                const dateOfService = new Date(note.date_of_service);
                
                return (
                  <Card key={note.id} className="border border-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
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
                              <DropdownMenuItem onClick={() => onViewNote(note)}>
                                <Eye className="w-3 h-3 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEditNote(note)}>
                                <Edit className="w-3 h-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onExportNote(note)}>
                                <FileText className="w-3 h-3 mr-2" />
                                Export
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
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
                    <td colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center">
                        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No SOAP Notes Found</h3>
                        <p className="text-muted-foreground">
                          No notes match your search criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  soapNotes.map((note) => {
                    const patientName = getPatientName(note.patients);
                    const dateOfService = new Date(note.date_of_service);
                    
                    return (
                      <tr key={note.id} className="hover:bg-muted/20 transition-colors group">
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
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
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
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                            {note.chief_complaint || 'No chief complaint recorded'}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => onViewNote(note)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => onEditNote(note)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => onExportNote(note)}>
                              <FileText className="w-4 h-4" />
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
  );
}
