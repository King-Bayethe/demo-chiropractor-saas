import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/hooks/usePatients";
import { Phone, Mail, Calendar, MessageSquare, Eye, Trash2, Plus, Upload, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton";
import { getPatientType, getCaseTypeDisplayName, getCaseTypeVariant } from "@/utils/patientMapping";

interface PatientsTableProps {
  patients: Patient[];
  loading: boolean;
  onPatientSelect: (patient: Patient) => void;
  onMessagePatient: (patient: Patient) => void;
  onBookAppointment: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  searchTerm: string;
  selectedType: string;
  selectedStatus: string;
  onAddPatient: () => void;
}

export function PatientsTable({
  patients,
  loading,
  onPatientSelect,
  onMessagePatient,
  onBookAppointment,
  onDeletePatient,
  searchTerm,
  selectedType,
  selectedStatus,
  onAddPatient,
}: PatientsTableProps) {
  const isMobile = useIsMobile();

  const getLastAppointment = (patient: Patient) => {
    if (patient.updated_at) {
      const date = new Date(patient.updated_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${diffDays > 13 ? 's' : ''} ago`;
      return `${Math.ceil(diffDays / 30)} month${diffDays > 60 ? 's' : ''} ago`;
    }
    return 'No recent appointments';
  };

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className={cn(isMobile ? "p-4" : "")}>
        <CardTitle className={cn(isMobile ? "text-lg" : "")}>
          All Patients ({patients.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isMobile ? (
          // Mobile Card View
          <div className="space-y-3 p-4">
            {loading ? (
              <ShimmerSkeleton count={5} />
            ) : patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="relative mb-6">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Users className="h-16 w-16 text-primary" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <Plus className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold mb-2">
                  {searchTerm || selectedType !== "all" || selectedStatus !== "all" ? "No Matches Found" : "No Patients Yet"}
                </h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {searchTerm || selectedType !== "all" || selectedStatus !== "all" 
                    ? "Try adjusting your filters to find what you're looking for."
                    : "Start building your patient database by adding your first patient record."
                  }
                </p>
                
                {!searchTerm && selectedType === "all" && selectedStatus === "all" && (
                  <div className="flex gap-3">
                    <Button onClick={onAddPatient}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Patient
                    </Button>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Patients
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              patients.map((patient: Patient) => {
                const patientType = getPatientType(patient);
                const caseTypeDisplay = getCaseTypeDisplayName(patientType);
                const caseTypeVariant = getCaseTypeVariant(patientType);
                const displayPhone = patient.phone || patient.cell_phone || patient.home_phone || patient.work_phone;
                
                return (
                  <Card 
                    key={patient.id} 
                    className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer animate-fade-in"
                    onClick={() => onPatientSelect(patient)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-14 w-14 ring-2 ring-offset-2 ring-transparent group-hover:ring-primary/30 transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-lg">
                            {`${patient.first_name?.[0]?.toUpperCase() || ''}${patient.last_name?.[0]?.toUpperCase() || ''}` || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {[patient.first_name, patient.last_name].filter(Boolean).join(' ') || "Unknown Patient"}
                          </h3>
                          <Badge variant={caseTypeVariant as any} className="mt-1">
                            {caseTypeDisplay}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        {displayPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{displayPhone}</span>
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{patient.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Last visit: {getLastAppointment(patient)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => onMessagePatient(patient)}>
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => onBookAppointment(patient)}>
                          <Calendar className="w-3 h-3 mr-1" />
                          Book
                        </Button>
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
                  <th className="text-left p-4 font-medium text-sm">Patient</th>
                  <th className="text-left p-4 font-medium text-sm">Contact</th>
                  <th className="text-left p-4 font-medium text-sm">Type</th>
                  <th className="text-left p-4 font-medium text-sm">Last Visit</th>
                  <th className="text-left p-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8">
                      <ShimmerSkeleton count={3} />
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center">
                        <Users className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          {searchTerm || selectedType !== "all" || selectedStatus !== "all" ? "No Matches Found" : "No Patients Yet"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {searchTerm || selectedType !== "all" || selectedStatus !== "all" 
                            ? "Try adjusting your filters."
                            : "Add your first patient to get started."}
                        </p>
                        {!searchTerm && selectedType === "all" && selectedStatus === "all" && (
                          <Button onClick={onAddPatient}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Patient
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => {
                    const patientType = getPatientType(patient);
                    const caseTypeDisplay = getCaseTypeDisplayName(patientType);
                    const caseTypeVariant = getCaseTypeVariant(patientType);
                    const displayPhone = patient.phone || patient.cell_phone || patient.home_phone || patient.work_phone;

                    return (
                      <tr 
                        key={patient.id} 
                        className="hover:bg-muted/20 transition-colors cursor-pointer group"
                        onClick={() => onPatientSelect(patient)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                                {`${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}` || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors">
                                {[patient.first_name, patient.last_name].filter(Boolean).join(' ') || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">ID: {patient.id.slice(-8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1 text-sm">
                            {displayPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <span>{displayPhone}</span>
                              </div>
                            )}
                            {patient.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <span className="truncate max-w-[200px]">{patient.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={caseTypeVariant as any}>
                            {caseTypeDisplay}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{getLastAppointment(patient)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="ghost" onClick={() => onPatientSelect(patient)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => onMessagePatient(patient)}>
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => onBookAppointment(patient)}>
                              <Calendar className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => onDeletePatient(patient.id)}
                            >
                              <Trash2 className="w-4 h-4" />
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
