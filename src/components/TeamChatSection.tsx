import React from "react";
import { ChatLayout } from "./chat/ChatLayout";
import { useTeamChat } from "@/hooks/useTeamChat";

export const TeamChatSection = () => {
  const {
    chats,
    selectedChat,
    messages,
    profiles,
    loading,
    messagesLoading,
    sendMessage,
    createChat,
    deleteChat,
    selectChat,
    refreshAll
  } = useTeamChat();

  return (
    <ChatLayout
      chats={chats}
      selectedChat={selectedChat}
      messages={messages}
      profiles={profiles}
      loading={loading}
      messagesLoading={messagesLoading}
      onSelectChat={selectChat}
      onSendMessage={sendMessage}
      onCreateChat={createChat}
      onDeleteChat={deleteChat}
      onRefresh={refreshAll}
      onRefreshProfiles={refreshAll}
    />
  );
};