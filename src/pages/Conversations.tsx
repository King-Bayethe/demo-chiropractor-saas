import { useState } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamChatSection } from "@/components/TeamChatSection";
import { PatientChatSection } from "@/components/PatientChatSection";
import { 
  Users,
  MessageSquare
} from "lucide-react";

// TypeScript Types matching AppSidebar
interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

interface Participant {
  id: string;
  chat_id: string;
  user_id: string;
  profiles: Profile;
}

interface TeamChat {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
  created_by: string;
  created_at: string;
  participants: Participant[];
  unread_count?: number;
}

export default function Conversations() {
  const [selectedChat, setSelectedChat] = useState<TeamChat | null>(null);

  // Handler functions that will be passed to the sidebar via Layout context
  const handleSelectChat = (chat: TeamChat) => {
    setSelectedChat(chat);
  };

  const handleDeleteChat = (chatId: string) => {
    // Handle chat deletion
    console.log('Delete chat:', chatId);
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
  };

  const handleCreateNewChat = () => {
    // Handle new chat creation
    console.log('Create new chat');
  };

  return (
    <AuthGuard>
      <Layout
        selectedChatId={selectedChat?.id}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onCreateNewChat={handleCreateNewChat}
      >
        <div className="flex h-full">
          {/* Main Chat Content */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              // Show selected chat
              <div className="flex-1 p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {selectedChat.type === 'group' 
                    ? selectedChat.name 
                    : `Chat with ${selectedChat.participants?.find(p => p.profiles?.user_id !== selectedChat.created_by)?.profiles?.first_name || 'User'}`
                  }
                </h2>
                {/* Chat content will be rendered here */}
                <div className="text-muted-foreground">
                  Chat interface for {selectedChat.id} will be implemented here
                </div>
              </div>
            ) : (
              // Show tabbed interface when no chat is selected
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Conversations</h1>
                    <p className="text-muted-foreground">Chat with team members and patients</p>
                  </div>
                </div>

                {/* Tabbed Interface */}
                <Tabs defaultValue="team" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="team" className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Team Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="patients" className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Patients</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="team" className="mt-6">
                    <TeamChatSection />
                  </TabsContent>
                  
                  <TabsContent value="patients" className="mt-6">
                    <PatientChatSection />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}