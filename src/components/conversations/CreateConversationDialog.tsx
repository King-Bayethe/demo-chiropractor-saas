import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePatients } from '@/hooks/usePatients';
import { useGHLConversations } from '@/hooks/useGHLConversations';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CreateConversationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { patients } = usePatients();
  const { createConversation } = useGHLConversations();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive"
      });
      return;
    }

    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient?.ghl_contact_id) {
      toast({
        title: "Error", 
        description: "Patient must have a GHL contact ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await createConversation(patient.ghl_contact_id);
      if (success) {
        toast({
          title: "Success",
          description: "Conversation created successfully"
        });
        setIsOpen(false);
        setSelectedPatient('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Patient</label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a patient..." />
              </SelectTrigger>
              <SelectContent>
                {patients
                  .filter(p => p.ghl_contact_id)
                  .map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Conversation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};