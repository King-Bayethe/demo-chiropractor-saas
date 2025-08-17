import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePatients, Patient } from '@/hooks/usePatients';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
      <Label>Patient</Label>
      <div className="flex gap-2">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 justify-start">
              {selectedPatient 
                ? `${selectedPatient.first_name || ''} ${selectedPatient.last_name || ''}`.trim() || selectedPatient.email
                : "Select Patient..."
              }
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select Patient</DialogTitle>
              <DialogDescription>
                Choose an existing patient or sync with GHL to get the latest records.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleSync}
                  disabled={syncing}
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading patients...</div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-accent"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="font-medium">
                        {`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unnamed Patient'}
                      </div>
                      <div className="text-sm text-muted-foreground">
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
                  className="w-full"
                  onClick={() => {
                    onCreateNew();
                    setDialogOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
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