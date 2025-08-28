import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGHLConversations } from '@/hooks/useGHLConversations';
import { MessageSquare, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddMessageDialogProps {
  conversationId: string;
  trigger?: React.ReactNode;
}

export const AddMessageDialog = ({ conversationId, trigger }: AddMessageDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageType, setMessageType] = useState<'inbound' | 'outbound'>('inbound');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { addInboundMessage, addOutboundCall } = useGHLConversations();
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter message content",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let success = false;
      
      if (messageType === 'inbound') {
        success = await addInboundMessage(conversationId, {
          type: 'SMS',
          message: content,
          conversationProviderId: 'system'
        });
      } else {
        success = await addOutboundCall(conversationId, {
          type: 'Call',
          conversationProviderId: 'system',
          altId: `call_${Date.now()}`
        });
      }

      if (success) {
        toast({
          title: "Success",
          description: `${messageType === 'inbound' ? 'Inbound message' : 'Outbound call'} added successfully`
        });
        setIsOpen(false);
        setContent('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Message
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Message to Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Message Type</label>
            <Select value={messageType} onValueChange={(value: 'inbound' | 'outbound') => setMessageType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbound">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Inbound Message
                  </div>
                </SelectItem>
                <SelectItem value="outbound">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Outbound Call
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {messageType === 'inbound' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Message Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the inbound message content..."
                rows={4}
              />
            </div>
          )}
          
          {messageType === 'outbound' && (
            <div className="text-sm text-muted-foreground">
              This will add an outbound call record to the conversation.
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isLoading}>
              {isLoading ? 'Adding...' : `Add ${messageType === 'inbound' ? 'Message' : 'Call'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};