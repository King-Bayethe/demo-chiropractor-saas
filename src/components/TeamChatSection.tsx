import React, { useState, useEffect, useMemo, useRef } from "react";
import { formatDistanceToNow } from "date-fns";

// --- Mock UI Components (from shadcn/ui) ---
// In a real app, you would import these from your library.
const Card = ({ children, className = "" }) => <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>;
const Button = ({ children, variant = "default", size = "default", onClick, className = "", ...props }) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";
    const sizeStyles = { default: "h-10 py-2 px-4", sm: "h-9 px-3 rounded-md", icon: "h-10 w-10" };
    const variantStyles = { default: "bg-blue-600 text-white hover:bg-blue-600/90", outline: "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800" };
    return <button className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} onClick={onClick} {...props}>{children}</button>;
};
const Input = ({ className = "", ...props }) => <input className={`flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;
const Badge = ({ children, className = "" }) => <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>;
const Avatar = ({ children, className = "" }) => <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>;
const AvatarFallback = ({ children, className = "" }) => <span className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}>{children}</span>;
const ScrollArea = ({ children, className = "" }) => <div className={`overflow-y-auto ${className}`}>{children}</div>;
const Separator = () => <hr className="border-gray-200 dark:border-gray-700" />;
const Dialog = ({ children, open, onOpenChange }) => open ? <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>{children}</div> : null;
const DialogContent = ({ children }) => <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-0 w-full max-w-md" onClick={(e) => e.stopPropagation()}>{children}</div>;
const DialogHeader = ({ children }) => <div className="p-6 border-b dark:border-gray-700">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>;
const DialogTrigger = ({ children, asChild }) => React.cloneElement(children, { onClick: () => console.log("Dialog trigger clicked") }); // Simplified

// --- Mock Icons (from lucide-react) ---
const Icon = ({ children, className="" }) => <span className={`inline-block w-5 h-5 ${className}`}>{children}</span>;
const Search = (props) => <Icon {...props}>&#x1F50D;</Icon>;
const Send = (props) => <Icon {...props}>&#x27A4;</Icon>;
const Plus = (props) => <Icon {...props}>&#x2795;</Icon>;
const MessageSquare = (props) => <Icon {...props}>&#x1F4AC;</Icon>;
const User = (props) => <Icon {...props}>&#x1F464;</Icon>;

// --- Mock `useTeamChats` Hook ---
// In a real app, the CURRENT_USER_ID would come from an authentication context.
const CURRENT_USER_ID = 'user2'; 

const useTeamChats = () => {
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState([
        { id: 'prof1', user_id: 'user1', first_name: 'Alex', last_name: 'Silverman', role: 'doctor' },
        { id: 'prof2', user_id: 'user2', first_name: 'Bayethe', last_name: 'Rowell', role: 'overlord' },
        { id: 'prof3', user_id: 'user3', first_name: 'Vito', last_name: 'Silveiro', role: 'admin' },
        { id: 'prof4', user_id: 'user4', first_name: 'Jane', last_name: 'Smith', role: 'staff' },
    ]);
    const [chats, setChats] = useState([
        { id: 'chat1', type: 'group', name: 'Medical Team Chat', unread_count: 2, last_message: { content: 'Please review the new patient files.' }, last_message_at: new Date(Date.now() - 60000 * 5).toISOString(), created_by: 'user2', participants: profiles, description: "General chat for the medical team." },
        { id: 'chat2', type: 'direct', unread_count: 0, last_message: { content: 'Yes, I will check it now.' }, last_message_at: new Date(Date.now() - 60000 * 30).toISOString(), created_by: 'user1', participants: [profiles.find(p=>p.user_id==='user1'), profiles.find(p=>p.user_id==='user2')] },
        { id: 'chat3', type: 'direct', unread_count: 1, last_message: { content: 'Can you approve this request?' }, last_message_at: new Date(Date.now() - 60000 * 120).toISOString(), created_by: 'user3', participants: [profiles.find(p=>p.user_id==='user3'), profiles.find(p=>p.user_id==='user2')] },
    ]);
    const [allMessages, setAllMessages] = useState({
        'chat1': [
            { id: 'msg1', chat_id: 'chat1', sender_id: 'user2', content: 'Welcome to the team chat!', created_at: new Date(Date.now() - 60000 * 10).toISOString(), sender: profiles.find(p => p.user_id === 'user2') },
            { id: 'msg2', chat_id: 'chat1', sender_id: 'user1', content: 'Glad to be here.', created_at: new Date(Date.now() - 60000 * 8).toISOString(), sender: profiles.find(p => p.user_id === 'user1') },
            { id: 'msg3', chat_id: 'chat1', sender_id: 'user3', content: 'Please review the new patient files.', created_at: new Date(Date.now() - 60000 * 5).toISOString(), sender: profiles.find(p => p.user_id === 'user3') },
        ],
        'chat2': [
            { id: 'msg4', chat_id: 'chat2', sender_id: 'user1', content: 'Did you get the lab results for Mr. Johnson?', created_at: new Date(Date.now() - 60000 * 32).toISOString(), sender: profiles.find(p => p.user_id === 'user1') },
            { id: 'msg5', chat_id: 'chat2', sender_id: 'user2', content: 'Yes, I will check it now.', created_at: new Date(Date.now() - 60000 * 30).toISOString(), sender: profiles.find(p => p.user_id === 'user2') },
        ],
        'chat3': [
             { id: 'msg6', chat_id: 'chat3', sender_id: 'user3', content: 'Can you approve this request?', created_at: new Date(Date.now() - 60000 * 120).toISOString(), sender: profiles.find(p => p.user_id === 'user3') },
        ]
    });
    const [selectedChat, setSelectedChat] = useState(chats[0]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);
    
    const messages = useMemo(() => allMessages[selectedChat?.id] || [], [selectedChat, allMessages]);

    const sendMessage = async (content) => {
        if (!selectedChat) return;
        const newMessage = {
            id: `msg_${Math.random()}`,
            chat_id: selectedChat.id,
            sender_id: CURRENT_USER_ID,
            content,
            created_at: new Date().toISOString(),
            sender: profiles.find(p => p.user_id === CURRENT_USER_ID)
        };
        setAllMessages(prev => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
        }));
        setChats(prev => prev.map(c => c.id === selectedChat.id ? {...c, last_message: {content}, last_message_at: newMessage.created_at} : c));
    };

    const createDirectChat = async (participantUserId) => {
        const existingChat = chats.find(c => c.type === 'direct' && c.participants.length === 2 && c.participants.some(p => p.user_id === participantUserId) && c.participants.some(p => p.user_id === CURRENT_USER_ID));
        if (existingChat) {
            setSelectedChat(existingChat);
            return;
        }

        const newChat = {
            id: `chat_${Math.random()}`,
            type: 'direct',
            unread_count: 0,
            last_message: null,
            last_message_at: new Date().toISOString(),
            created_by: CURRENT_USER_ID,
            participants: [profiles.find(p => p.user_id === CURRENT_USER_ID), profiles.find(p => p.user_id === participantUserId)]
        };
        setChats(prev => [newChat, ...prev]);
        setSelectedChat(newChat);
    };

    return { chats, selectedChat, setSelectedChat, messages, profiles, loading, createDirectChat, sendMessage };
};


// --- The Main Team Chat Component ---
export const TeamChatSection = () => {
  const { chats, selectedChat, setSelectedChat, messages, profiles, loading, createDirectChat, sendMessage } = useTeamChats();
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length) {
        scrollToBottom();
    }
  }, [messages]);


  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    if (chat.type === 'direct') {
      return chat.participants?.some(p => `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return chat.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleCreateDirectChat = async (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      await createDirectChat(profile.user_id);
      setIsNewChatOpen(false);
    }
  };
  
  const getChatDisplayName = (chat) => {
    if (!chat) return '';
    if (chat.type === 'group') return chat.name || 'Medical Team Chat';
    
    // Find the participant who is NOT the current user
    const otherParticipant = chat.participants?.find(p => p.user_id !== CURRENT_USER_ID); 
    
    if (otherParticipant) {
      const role = otherParticipant.role === 'admin' ? '(Admin)' : otherParticipant.role === 'doctor' ? '(Dr.)' : otherParticipant.role === 'overlord' ? '(King)' : otherParticipant.role === 'staff' ? '(Staff)' : '';
      return `${otherParticipant.first_name} ${otherParticipant.last_name} ${role}`.trim();
    }
    return 'Clinical Consultation'; // Fallback name
  };

  const getChatAvatar = (chat) => {
    if (!chat) return '??';
    if (chat.type === 'group') return chat.name?.[0]?.toUpperCase() || 'G';
    
    const otherParticipant = chat.participants?.find(p => p.user_id !== CURRENT_USER_ID);
    return otherParticipant ? `${otherParticipant.first_name?.[0] || ''}${otherParticipant.last_name?.[0] || ''}`.toUpperCase() : 'DC';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[600px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="grid grid-cols-12 gap-6 p-4 bg-gray-50 dark:bg-gray-950">
      {/* Chats List */}
      <div className="col-span-12 md:col-span-4">
        <Card className="border border-border/50 shadow-sm h-[700px] flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2"><MessageSquare /><span>Team Chats</span></CardTitle>
              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <Button size="sm" variant="outline" onClick={() => setIsNewChatOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  New Message
                </Button>
                <DialogContent>
                  <DialogHeader><DialogTitle>Start New Chat</DialogTitle></DialogHeader>
                  <div className="space-y-4 p-6">
                    <div className="text-sm text-muted-foreground">Select a team member to start a direct chat:</div>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {/* Filter out the current user from the list */}
                        {profiles.filter(p => p.user_id !== CURRENT_USER_ID).map(profile => (
                          <div key={profile.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer" onClick={() => handleCreateDirectChat(profile.id)}>
                            <Avatar className="h-8 w-8"><AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-sm">{`${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()}</AvatarFallback></Avatar>
                            <div>
                                <p className="font-medium text-sm">{profile.first_name} {profile.last_name}</p>
                                <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search chats..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            {filteredChats.length === 0 ? (
              <div className="p-4 text-center text-gray-500"><MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No chats found</p></div>
            ) : (
              filteredChats.map((chat) => (
                <div key={chat.id} className={`p-4 cursor-pointer transition-colors border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${selectedChat?.id === chat.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} onClick={() => setSelectedChat(chat)}>
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-blue-100 text-blue-600 font-medium">{getChatAvatar(chat)}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{getChatDisplayName(chat)}</p>
                        {chat.unread_count > 0 && <Badge className="bg-blue-600 text-white text-xs">{chat.unread_count}</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{chat.last_message?.content || 'No messages yet'}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{chat.last_message_at ? formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true }) : ''}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="col-span-12 md:col-span-5">
        <Card className="border border-border/50 shadow-sm h-[700px] flex flex-col">
          {selectedChat ? (
            <>
              <CardHeader className="pb-3"><div className="flex items-center space-x-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-sm">{getChatAvatar(selectedChat)}</AvatarFallback></Avatar><div><p className="font-medium text-sm">{getChatDisplayName(selectedChat)}</p><p className="text-xs text-gray-500">{selectedChat.type === 'direct' ? 'Direct Message' : `${selectedChat.participants?.length || 0} members`}</p></div></div></CardHeader>
              <Separator />
              <ScrollArea className="flex-1 p-4 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex items-end gap-2 ${message.sender_id === CURRENT_USER_ID ? 'justify-end' : 'justify-start'}`}>
                       {message.sender_id !== CURRENT_USER_ID && <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{`${message.sender?.first_name?.[0] || ''}${message.sender?.last_name?.[0] || ''}`.toUpperCase()}</AvatarFallback></Avatar>}
                      <div className={`max-w-[80%] p-3 rounded-lg ${message.sender_id === CURRENT_USER_ID ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 rounded-bl-none'}`}>
                        <p className="text-xs font-medium mb-1 text-blue-300">{message.sender_id !== CURRENT_USER_ID ? `${message.sender?.first_name} ${message.sender?.last_name}` : 'You'}</p>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.sender_id === CURRENT_USER_ID ? 'text-blue-200/70' : 'text-gray-400'}`}>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700"><div className="flex space-x-2"><Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1" /><Button onClick={handleSendMessage} size="icon"><Send className="w-4 h-4" /></Button></div></div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center"><div className="text-center text-gray-500"><MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Select a chat to start messaging</p></div></div>
          )}
        </Card>
      </div>

      {/* Chat Info Panel */}
      <div className="col-span-12 md:col-span-3">
        <Card className="border border-border/50 shadow-sm h-[700px]">
          <CardHeader><CardTitle className="flex items-center space-x-2"><User /><span>Chat Info</span></CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {selectedChat ? (
              <>
                <div className="text-center"><Avatar className="h-16 w-16 mx-auto mb-3"><AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-lg">{getChatAvatar(selectedChat)}</AvatarFallback></Avatar><h3 className="font-semibold text-lg">{getChatDisplayName(selectedChat)}</h3><p className="text-sm text-gray-500">{selectedChat.type === 'direct' ? 'Direct Message' : 'Group Chat'}</p></div>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Participants</p>
                    <div className="space-y-2">
                      {selectedChat.participants?.map((participant) => (
                        <div key={participant.id} className="flex items-center space-x-2"><Avatar className="h-6 w-6"><AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-xs">{`${participant.first_name?.[0] || ''}${participant.last_name?.[0] || ''}`.toUpperCase()}</AvatarFallback></Avatar><span className="text-sm">{participant.first_name} {participant.last_name}</span></div>
                      ))}
                    </div>
                  </div>
                  <div><p className="text-sm font-medium text-gray-500 mb-1">Created</p><p className="text-sm">{selectedChat.created_at ? formatDistanceToNow(new Date(selectedChat.created_at), { addSuffix: true }) : 'Just now'}</p></div>
                  {selectedChat.description && (<div><p className="text-sm font-medium text-gray-500 mb-1">Description</p><p className="text-sm">{selectedChat.description}</p></div>)}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8"><User className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Select a chat to view details</p></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function App() {
    return <TeamChatSection />
}
