import React, { useState, useEffect } from 'react';

// --- Mock UI Components (from shadcn/ui & lucide-react) ---
// In a real app, these would be imported from your component library.
const Button = ({ children, variant = "default", size = "default", onClick, className = "", ...props }) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";
    const sizeStyles = { default: "h-10 py-2 px-4", sm: "h-9 px-3 rounded-md", icon: "h-10 w-10" };
    const variantStyles = { default: "bg-blue-600 text-white hover:bg-blue-600/90", ghost: "hover:bg-gray-100 dark:hover:bg-gray-800" };
    return <button className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} onClick={onClick} {...props}>{children}</button>;
};
const Avatar = ({ children, className = "" }) => <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>;
const AvatarFallback = ({ children, className = "" }) => <span className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}>{children}</span>;

// A more robust Dropdown mock
const DropdownMenu = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative inline-block text-left" onBlur={() => setIsOpen(false)}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { isOpen, setIsOpen });
                }
                return child;
            })}
        </div>
    );
};
const DropdownMenuTrigger = ({ children, asChild, isOpen, setIsOpen }) => {
    const child = asChild ? children : <Button>{children}</Button>;
    return React.cloneElement(child, { onClick: () => setIsOpen(!isOpen) });
};
const DropdownMenuContent = ({ children, align, isOpen }) => {
    if (!isOpen) return null;
    return <div className={`origin-top-right absolute ${align === 'end' ? 'right-0' : 'left-0'} mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none`}>{children}</div>;
};
const DropdownMenuItem = ({ children }) => <div className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">{children}</div>;


const Icon = ({ children, className = "" }) => <span className={`inline-block w-5 h-5 ${className}`}>{children}</span>;
const Menu = (props) => <Icon {...props}>&#x2630;</Icon>;
const Users = (props) => <Icon {...props}>&#x1F465;</Icon>;
const Phone = (props) => <Icon {...props}>&#x1F4DE;</Icon>;
const Video = (props) => <Icon {...props}>&#x1F3A5;</Icon>;
const MoreVertical = (props) => <Icon {...props}>&#x22EE;</Icon>;
const Info = (props) => <Icon {...props}>&#x2139;</Icon>;


// --- Type Definitions ---
interface Participant {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    role: 'doctor' | 'admin' | 'nurse' | 'overlord' | 'staff';
}

interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: Participant[];
  last_message_at?: string;
  created_by: string;
}

interface ChatHeaderProps {
  selectedChat: Chat | null;
  currentUserId: string | null;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

// --- The ChatHeader Component ---
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedChat,
  currentUserId,
  onToggleSidebar,
  sidebarCollapsed
}) => {
  const getChatDisplayName = (chat: Chat): string => {
    if (chat.type === 'group') return chat.name || 'Medical Team Group';
    
    const otherParticipant = chat.participants?.find((p: any) => p.id !== currentUserId);
    
    if (otherParticipant) {
      const firstName = otherParticipant.first_name || '';
      const lastName = otherParticipant.last_name || '';
      const role = otherParticipant.role === 'admin' ? '(Admin)' : 
                   otherParticipant.role === 'doctor' ? '(Dr.)' : 
                   otherParticipant.role === 'nurse' ? '(RN)' : 
                   otherParticipant.role === 'overlord' ? '(Admin)' : '';
      
      const fullName = `${firstName} ${lastName} ${role}`.trim();
      return fullName || otherParticipant.email || 'Team Member';
    }
    return 'Team Member';
  };

  const getChatAvatar = (chat: Chat): string => {
    if (chat.type === 'group') {
      return chat.name?.substring(0, 2).toUpperCase() || 'GT';
    }
    
    const otherParticipant = chat.participants?.find((p: any) => p.id !== currentUserId);
    if (otherParticipant) {
      const firstName = otherParticipant.first_name || '';
      const lastName = otherParticipant.last_name || '';
      return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'TM';
    }
    return 'TM';
  };

  const getOnlineStatus = (): string => {
    return 'online'; // mock for now
  };

  if (!selectedChat) {
    return (
      <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 bg-white dark:bg-gray-900">
        <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="mr-4">
          <Menu className="w-4 h-4" />
        </Button>
        <div className="text-gray-500 dark:text-gray-400">Select a conversation</div>
      </div>
    );
  }

  return (
    <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 bg-white dark:bg-gray-900">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onToggleSidebar} className={sidebarCollapsed ? "mr-0" : "mr-2"}>
          <Menu className="w-4 h-4" />
        </Button>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                {getChatAvatar(selectedChat)}
              </AvatarFallback>
            </Avatar>
            {selectedChat.type === 'direct' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {getChatDisplayName(selectedChat)}
            </h2>
            <div className="flex items-center space-x-2">
              {selectedChat.type === 'group' ? (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedChat.participants?.length || 0} members
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {getOnlineStatus()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        {selectedChat.type === 'direct' && (
          <>
            <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
          </>
        )}
        <Button variant="ghost" size="icon"><Info className="w-4 h-4" /></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Info className="w-4 h-4 mr-2" />Chat Info</DropdownMenuItem>
            <DropdownMenuItem><Users className="w-4 h-4 mr-2" />Manage Members</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};


// --- Main App Component for Demonstration ---
export default function App() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);

    // Mock Data
    const currentUserId = 'user-123';
    const mockUser1: Participant = { id: 'user-123', first_name: 'Bayethe', last_name: 'Rowell', email: 'bay@test.com', role: 'overlord' };
    const mockUser2: Participant = { id: 'user-456', first_name: 'Alex', last_name: 'Silverman', email: 'alex@test.com', role: 'doctor' };
    const mockUser3: Participant = { id: 'user-789', first_name: 'Jane', last_name: 'Doe', email: 'jane@test.com', role: 'nurse' };
    
    const directChat: Chat = {
        id: 'chat-direct-1',
        type: 'direct',
        participants: [mockUser1, mockUser2],
        created_by: 'user-123',
    };

    const groupChat: Chat = {
        id: 'chat-group-1',
        type: 'group',
        name: 'ER Team Alpha',
        participants: [mockUser1, mockUser2, mockUser3],
        created_by: 'user-456',
    };
    
    useEffect(() => {
        // Start with the direct chat selected by default
        setCurrentChat(directChat);
    }, []);

    return (
        <div className="bg-gray-100 dark:bg-gray-950 p-8 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Chat Header Demo</h1>
                <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Controls</h3>
                    <div className="flex space-x-2">
                        <Button onClick={() => setCurrentChat(directChat)}>Load Direct Chat</Button>
                        <Button onClick={() => setCurrentChat(groupChat)}>Load Group Chat</Button>
                        <Button onClick={() => setCurrentChat(null)}>Clear Selection</Button>
                        <Button variant="outline" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                            Toggle Sidebar
                        </Button>
                    </div>
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg">
                    <ChatHeader 
                        selectedChat={currentChat}
                        currentUserId={currentUserId}
                        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                        sidebarCollapsed={sidebarCollapsed}
                    />
                </div>
                 <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <p>Current User ID: <span className="font-mono">{currentUserId}</span></p>
                    <p>Sidebar Collapsed: <span className="font-mono">{sidebarCollapsed.toString()}</span></p>
                </div>
            </div>
        </div>
    );
}
