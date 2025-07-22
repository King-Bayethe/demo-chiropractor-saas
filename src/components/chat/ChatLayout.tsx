import React, { useState } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { ChatHeader } from './ChatHeader';
import { NewChatDialog } from './NewChatDialog';
import { cn } from '@/lib/utils';
import { TeamChat, ChatMessage } from '@/hooks/useTeamChat';

interface ChatLayoutProps {
  chats: TeamChat[];
  selectedChat: TeamChat | null;
  messages: ChatMessage[];
  profiles: any[];
  loading: boolean;
  messagesLoading: boolean;
  onSelectChat: (chat: TeamChat) => void;
  onSendMessage: (message: string) => void;
  onCreateChat: (memberIds: string[], groupName?: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRefresh: () => void;
  onRefreshProfiles: () => void;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  chats,
  selectedChat,
  messages,
  profiles,
  loading,
  messagesLoading,
  onSelectChat,
  onSendMessage,
  onCreateChat,
  onDeleteChat,
  onRefresh,
  onRefreshProfiles
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  return (
    <>
      <div className="flex h-[calc(100vh-12rem)] bg-background border border-border rounded-lg overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-300 border-r border-border bg-card",
          sidebarCollapsed ? "w-0" : "w-80"
        )}>
          <ChatSidebar
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={onSelectChat}
            onCreateChat={() => setIsNewChatOpen(true)}
            onDeleteChat={onDeleteChat}
            onRefresh={onRefresh}
            loading={loading}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatHeader
            selectedChat={selectedChat}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
            onDeleteChat={onDeleteChat}
            onRefresh={onRefresh}
          />
          
          <ChatWindow
            chat={selectedChat}
            messages={messages}
            onSendMessage={onSendMessage}
            loading={messagesLoading}
          />
        </div>
      </div>

      <NewChatDialog
        open={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        profiles={profiles}
        onCreateChat={onCreateChat}
        onRefreshProfiles={onRefreshProfiles}
        loading={loading}
      />
    </>
  );
};