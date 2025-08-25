import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { TeamChatSection } from "@/components/TeamChatSection";
import { 
  Users
} from "lucide-react";

export default function TeamChat() {
  return (
    <AuthGuard>
      <Layout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Team Chat</h1>
              <p className="text-muted-foreground">Communicate with your team members</p>
            </div>
          </div>

          {/* Team Chat Section */}
          <TeamChatSection />
        </div>
      </Layout>
    </AuthGuard>
  );
}