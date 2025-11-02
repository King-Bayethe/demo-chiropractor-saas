import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Zap,
  FileText,
  Calendar,
  StickyNote,
  ExternalLink
} from 'lucide-react';

interface QuickActionsDropdownProps {
  onSendMessage: (message: string) => void;
}

const formOptions = [
  {
    id: 'new-patient',
    name: 'New Patient Intake',
    description: 'General new patient registration form',
    url: '/public-new-form'
  },
  {
    id: 'insurance',
    name: 'Insurance Verification',
    description: 'Insurance information and verification form',
    url: '/public-pip-form'
  },
  {
    id: 'financial',
    name: 'Financial Agreement',
    description: 'Payment plan and financial agreement form', 
    url: '/public-lop-form'
  },
  {
    id: 'cash',
    name: 'Self-Pay Registration',
    description: 'Self-pay patient registration form', 
    url: '/public-cash-form'
  }
];

export const QuickActionsDropdown: React.FC<QuickActionsDropdownProps> = ({
  onSendMessage
}) => {
  const handleSendForm = (form: typeof formOptions[0]) => {
    const formUrl = `${window.location.origin}${form.url}`;
    const message = `Hi! Please complete this ${form.name} to continue with your intake process:\n\n📋 ${form.description}\n🔗 ${formUrl}\n\nClick the link above to access the form. If you have any questions, please don't hesitate to ask!`;
    
    onSendMessage(message);
  };

  const handleScheduleAppointment = () => {
    const message = `I'd like to help you schedule an appointment. Our office hours are Monday-Friday 9AM-6PM, Saturday 9AM-2PM.\n\n📅 Please let me know your preferred dates and times, and I'll check our availability.\n\nYou can also call us at (305) 595-9920 to schedule directly.`;
    
    onSendMessage(message);
  };

  const handleAddNote = () => {
    const message = `📝 Note: I'm adding this to your file for our medical team to review. Is there anything specific you'd like me to document about your visit or treatment?`;
    
    onSendMessage(message);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-primary/10"
        >
          <Zap className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg">
        <DropdownMenuLabel className="text-foreground">Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="hover:bg-accent hover:text-accent-foreground">
            <FileText className="mr-2 h-4 w-4" />
            <span>Send Form</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-background border shadow-lg">
            {formOptions.map((form) => (
              <DropdownMenuItem 
                key={form.id}
                onClick={() => handleSendForm(form)}
                className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{form.name}</span>
                  <span className="text-xs text-muted-foreground">{form.description}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuItem 
          onClick={handleScheduleAppointment}
          className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
        >
          <Calendar className="mr-2 h-4 w-4" />
          <span>Schedule Appointment</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleAddNote}
          className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
        >
          <StickyNote className="mr-2 h-4 w-4" />
          <span>Add Note</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};