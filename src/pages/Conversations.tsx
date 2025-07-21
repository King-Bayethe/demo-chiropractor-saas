import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamChatSection } from "@/components/TeamChatSection";
import { PatientChatSection } from "@/components/PatientChatSection";
import { 
  Users,
  MessageSquare
} from "lucide-react";

export default function Conversations() {
  return (
    <Layout>
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
    </Layout>
  );
}