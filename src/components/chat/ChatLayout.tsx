import React, { useState } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { ChatHeader } from './ChatHeader';
import { useIsMobile } from '@/hooks/use-mobile';
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
  onRefresh?: () => void;
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
  onRefresh,
  loading
}) => {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const handleSelectChat = (chat: any) => {
    onSelectChat(chat);
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  };

  const handleToggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-background border border-border rounded-lg overflow-hidden relative max-w-full">
      {/* Mobile Sidebar Overlay */}
      {isMobile && showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "transition-all duration-300 border-r border-border bg-card z-50",
        isMobile 
          ? cn(
              "fixed left-0 top-0 h-full w-80 max-w-[85vw]",
              showMobileSidebar ? "translate-x-0" : "-translate-x-full"
            )
          : sidebarCollapsed ? "w-0" : "w-80"
      )}>
        <ChatSidebar
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onCreateChat={onCreateChat}
          onDeleteChat={onDeleteChat}
          currentUserId={currentUserId}
          loading={loading}
          collapsed={!isMobile && sidebarCollapsed}
          onMobileClose={() => setShowMobileSidebar(false)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatHeader
          selectedChat={selectedChat}
          currentUserId={currentUserId}
          onToggleSidebar={handleToggleSidebar}
          sidebarCollapsed={isMobile ? !showMobileSidebar : sidebarCollapsed}
          onDeleteChat={onDeleteChat}
          onRefresh={onRefresh}
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