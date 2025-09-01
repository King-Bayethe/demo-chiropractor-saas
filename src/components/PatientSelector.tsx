import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePatients, Patient } from '@/hooks/usePatients';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface PatientSelectorProps {
  selectedPatient?: Patient | null;
  onPatientSelect: (patient: Patient) => void;
  onCreateNew?: () => void;
  className?: string;
}

export const PatientSelector: React.FC<PatientSelectorProps> = ({
  selectedPatient,
  onPatientSelect,
  onCreateNew,
  className
}) => {
  const { patients, loading, syncWithGHL } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const isMobile = useIsMobile();

  const filteredPatients = patients.filter(patient => 
    `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncWithGHL();
      toast({
        title: "Sync Complete",
        description: "Patient records have been synced with GHL",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with GHL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setDialogOpen(false);
  };

  return (
    <div className={className}>
      <Label className={cn(isMobile ? "text-sm" : "")}>Patient</Label>
      <div className="flex gap-2">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className={cn("flex-1 justify-start",
              isMobile ? "text-sm h-10" : ""
            )}>
              {selectedPatient 
                ? `${selectedPatient.first_name || ''} ${selectedPatient.last_name || ''}`.trim() || selectedPatient.email
                : "Select Patient..."
              }
            </Button>
          </DialogTrigger>
          <DialogContent className={cn("max-w-2xl",
            isMobile ? "w-[95vw] max-h-[80vh]" : ""
          )}>
            <DialogHeader>
              <DialogTitle className={cn(isMobile ? "text-lg" : "")}>Select Patient</DialogTitle>
              <DialogDescription className={cn(isMobile ? "text-sm" : "")}>
                Choose an existing patient or sync with GHL to get the latest records.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className={cn("absolute left-3 top-3 text-muted-foreground",
                    isMobile ? "h-3 w-3" : "h-4 w-4"
                  )} />
                  <Input
                    placeholder={isMobile ? "Search patients..." : "Search patients by name, email, or phone..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(isMobile ? "pl-8 text-sm h-10" : "pl-10")}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleSync}
                  disabled={syncing}
                  size={isMobile ? "sm" : "default"}
                >
                  <RefreshCw className={cn(`${syncing ? 'animate-spin' : ''}`,
                    isMobile ? "h-3 w-3" : "h-4 w-4"
                  )} />
                </Button>
              </div>

              <div className={cn("overflow-y-auto space-y-2",
                isMobile ? "max-h-48" : "max-h-60"
              )}>
                {loading ? (
                  <div className={cn("text-center py-4 text-muted-foreground",
                    isMobile ? "text-sm" : ""
                  )}>Loading patients...</div>
                ) : filteredPatients.length === 0 ? (
                  <div className={cn("text-center py-4 text-muted-foreground",
                    isMobile ? "text-sm" : ""
                  )}>
                    {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={cn("border rounded-lg cursor-pointer hover:bg-accent",
                        isMobile ? "p-2" : "p-3"
                      )}
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className={cn("font-medium",
                        isMobile ? "text-sm" : ""
                      )}>
                        {`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unnamed Patient'}
                      </div>
                      <div className={cn("text-muted-foreground",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        {patient.email && <span>{patient.email}</span>}
                        {patient.email && patient.phone && <span> • </span>}
                        {patient.phone && <span>{patient.phone}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {onCreateNew && (
                <Button
                  variant="outline"
                  className={cn("w-full",
                    isMobile ? "text-sm h-10" : ""
                  )}
                  onClick={() => {
                    onCreateNew();
                    setDialogOpen(false);
                  }}
                >
                  <Plus className={cn("mr-2",
                    isMobile ? "h-3 w-3" : "h-4 w-4"
                  )} />
                  Create New Patient
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};