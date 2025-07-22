import React, { useState } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { ChatHeader } from './ChatHeader';
import { cn } from '@/lib/utils';

interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: any[];
  last_message_at?: string;
  created_by: string;
  unreadCount?: number;
}

interface ChatLayoutProps {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: any[];
  currentUserId: string | null;
  onSelectChat: (chat: Chat) => void;
  onSendMessage: (message: string) => void;
  onCreateChat: () => void;
  onDeleteChat: (chatId: string) => void;
  loading: boolean;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  chats,
  selectedChat,
  messages,
  currentUserId,
  onSelectChat,
  onSendMessage,
  onCreateChat,
  onDeleteChat,
  loading
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
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
          onCreateChat={onCreateChat}
          onDeleteChat={onDeleteChat}
          currentUserId={currentUserId}
          loading={loading}
          collapsed={sidebarCollapsed}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader
          selectedChat={selectedChat}
          currentUserId={currentUserId}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        <ChatWindow
          chat={selectedChat}
          messages={messages}
          onSendMessage={onSendMessage}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};