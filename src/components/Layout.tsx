import { ReactNode, useState } from "react";
import { CRMSidebar } from "./CRMSidebar";
import { Bell, Search, User, LogOut, Settings as SettingsIcon, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen flex w-full bg-background">
      <CRMSidebar />
      
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border/50 bg-card px-6 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search patients, cases, or contacts..." 
                className="pl-10 w-80 bg-background border-border/50"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-[#007BFF] text-white">
                3
              </Badge>
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium">Front Desk</p>
                <p className="text-xs text-muted-foreground">Staff Member</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-[#007BFF]/10 hover:bg-[#007BFF]/20">
                    <User className="w-5 h-5 text-[#007BFF]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border border-border/50 shadow-lg">
                  <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer hover:bg-muted text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}