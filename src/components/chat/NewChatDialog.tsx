import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  User, 
  Search,
  RefreshCw 
} from 'lucide-react';

interface Profile {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role?: string;
  is_active: boolean;
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
  currentUserId: string | null;
  onCreateChat: (memberIds: string[], groupName?: string) => void;
  loading: boolean;
  onRefreshProfiles: () => void;
}

export const NewChatDialog: React.FC<NewChatDialogProps> = ({
  open,
  onOpenChange,
  profiles,
  currentUserId,
  onCreateChat,
  loading,
  onRefreshProfiles
}) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');

  const availableProfiles = profiles.filter(profile => 
    profile.user_id !== currentUserId && profile.is_active
  );

  const filteredProfiles = availableProfiles.filter(profile => {
    const searchString = `${profile.first_name || ''} ${profile.last_name || ''} ${profile.email || ''}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => {
      const newSelection = prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId];
      
      // Auto-switch to group chat if more than one member selected
      if (newSelection.length > 1) {
        setChatType('group');
      } else if (newSelection.length === 1) {
        setChatType('direct');
      }
      
      return newSelection;
    });
  };

  const handleCreateChat = () => {
    if (selectedMembers.length === 0) return;
    
    onCreateChat(
      selectedMembers, 
      chatType === 'group' ? (groupName || 'New Medical Team Group') : undefined
    );
    
    // Reset state
    setSelectedMembers([]);
    setGroupName('');
    setSearchQuery('');
    setChatType('direct');
    onOpenChange(false);
  };

  const getMemberDisplayName = (profile: Profile): string => {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    const role = profile.role === 'admin' ? '(Admin)' : 
                 profile.role === 'doctor' ? '(Dr.)' : 
                 profile.role === 'nurse' ? '(RN)' : '';
    const fullName = `${firstName} ${lastName} ${role}`.trim();
    return fullName || profile.email;
  };

  const getMemberAvatar = (profile: Profile): string => {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || profile.email[0]?.toUpperCase() || 'U';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Start New Conversation</span>
          </DialogTitle>
          <DialogDescription>
            Select team members to start a new conversation
          </DialogDescription>
        </DialogHeader>

        <Tabs value={chatType} onValueChange={(value) => setChatType(value as 'direct' | 'group')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Direct</span>
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Group</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {chatType === 'group' && (
              <div>
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Select Team Members</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onRefreshProfiles}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {selectedMembers.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {selectedMembers.map(memberId => {
                      const member = availableProfiles.find(p => p.user_id === memberId);
                      if (!member) return null;
                      
                      return (
                        <Badge 
                          key={memberId} 
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          {getMemberDisplayName(member)}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              <ScrollArea className="h-48 border rounded-md p-2">
                {loading ? (
                  <div className="text-center text-muted-foreground py-4">
                    Loading team members...
                  </div>
                ) : filteredProfiles.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    {searchQuery ? 'No members found' : 'No team members available'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProfiles.map((profile) => (
                      <div 
                        key={profile.user_id} 
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleMemberToggle(profile.user_id)}
                      >
                        <Checkbox
                          checked={selectedMembers.includes(profile.user_id)}
                          onChange={() => handleMemberToggle(profile.user_id)}
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {getMemberAvatar(profile)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {getMemberDisplayName(profile)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateChat}
            disabled={
              selectedMembers.length === 0 || 
              (chatType === 'direct' && selectedMembers.length > 1)
            }
          >
            Create {chatType === 'group' ? 'Group' : 'Chat'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};