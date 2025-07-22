import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Users, MessageSquare } from "lucide-react";

export const TeamChatSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Chat List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Medical Team Chats</CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 p-4">
              {/* Sample Chat Items */}
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer border border-border">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Dr. John Smith</p>
                  <p className="text-xs text-muted-foreground truncate">Latest message preview...</p>
                </div>
                <Badge variant="secondary" className="text-xs">2</Badge>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Medical Team Group</p>
                  <p className="text-xs text-muted-foreground truncate">Team discussion about...</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>MJ</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Mary Johnson (RN)</p>
                  <p className="text-xs text-muted-foreground truncate">Ready for shift change</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Dr. John Smith</CardTitle>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-4">
              {/* Sample Messages */}
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">Dr. John Smith</span>
                    <span className="text-xs text-muted-foreground">2:30 PM</span>
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-w-xs">
                    <p className="text-sm">Good afternoon! How is the patient in room 204 doing?</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 justify-end">
                <div className="flex-1 max-w-xs">
                  <div className="flex items-center space-x-2 mb-1 justify-end">
                    <span className="text-xs text-muted-foreground">2:32 PM</span>
                    <span className="text-sm font-medium">You</span>
                  </div>
                  <div className="bg-primary rounded-lg p-3 text-primary-foreground">
                    <p className="text-sm">Patient is stable. Vitals are normal and responding well to treatment.</p>
                  </div>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">Dr. John Smith</span>
                    <span className="text-xs text-muted-foreground">2:35 PM</span>
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-w-xs">
                    <p className="text-sm">Excellent! Please continue monitoring and update me if there are any changes.</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};