import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useUsers } from "@/hooks/useUsers";
import { formatDistanceToNow } from "date-fns";
import { Plus, Edit3, Save, X, FileText, AlertCircle, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientNote {
  id: string;
  title: string;
  content: string;
  category: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface PatientNotesFixedProps {
  patientId: string;
}

const NOTE_CATEGORIES = [
  { value: 'General', label: 'General', icon: FileText, color: 'bg-muted text-muted-foreground' },
  { value: 'Medical', label: 'Medical', icon: AlertCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
  { value: 'Administrative', label: 'Administrative', icon: Briefcase, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  { value: 'Personal', label: 'Personal', icon: Users, color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
];

export function PatientNotesFixed({ patientId }: PatientNotesFixedProps) {
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("General");
  const [editingContent, setEditingContent] = useState("");
  const [saving, setSaving] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { fetchUsers, getUserInitials, getUserName, getUserColor } = useUsers();

  // Auto-save for new note
  useAutoSave({
    key: `patient-note-new-${patientId}`,
    data: { content: newNoteContent, category: newNoteCategory },
    interval: 3000,
    enabled: newNoteContent.length > 0,
  });

  // Auto-save for editing note
  useAutoSave({
    key: `patient-note-edit-${editingId}`,
    data: { content: editingContent },
    interval: 3000,
    enabled: !!editingId && editingContent.length > 0,
    onSave: editingId ? async (data) => {
      await handleSaveEdit(editingId, data.content, true);
    } : undefined,
  });

  useEffect(() => {
    if (patientId) {
      fetchNotes();
    }
  }, [patientId]);

  useEffect(() => {
    // Fetch user data for all note creators
    const userIds = [...new Set(notes.map(note => note.created_by))];
    if (userIds.length > 0) {
      fetchUsers(userIds);
    }
  }, [notes, fetchUsers]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_notes')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patient notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim() || !user?.id) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('patient_notes')
        .insert({
          patient_id: patientId,
          title: newNoteContent.split('\n')[0].substring(0, 50) + (newNoteContent.length > 50 ? '...' : ''),
          content: newNoteContent.trim(),
          category: newNoteCategory,
          created_by: user.id,
        });

      if (error) throw error;

      setNewNoteContent("");
      setNewNoteCategory("General");
      fetchNotes();
      
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (noteId: string, content: string, isAutoSave = false) => {
    if (!content.trim()) return;

    try {
      if (!isAutoSave) setSaving(true);
      
      const { error } = await supabase
        .from('patient_notes')
        .update({
          content: content.trim(),
          title: content.split('\n')[0].substring(0, 50) + (content.length > 50 ? '...' : ''),
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);

      if (error) throw error;

      if (!isAutoSave) {
        setEditingId(null);
        setEditingContent("");
        fetchNotes();
        
        toast({
          title: "Success",
          description: "Note updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating note:', error);
      if (!isAutoSave) {
        toast({
          title: "Error",
          description: "Failed to update note",
          variant: "destructive",
        });
      }
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  };

  const startEditing = (note: PatientNote) => {
    setEditingId(note.id);
    setEditingContent(note.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const getCategoryConfig = (categoryValue: string) => {
    return NOTE_CATEGORIES.find(cat => cat.value === categoryValue) || NOTE_CATEGORIES[0];
  };

  if (loading) {
    return (
      <Card className="h-[500px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading notes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Patient Notes
          <Badge variant="secondary" className="ml-auto">
            {notes.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Quick Add Section */}
        <div className="space-y-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className={cn("text-xs text-white", user?.id ? getUserColor(user.id) : 'bg-gray-500')}>
                {user?.id ? getUserInitials(user.id) : '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Add new note</span>
          </div>
          <Textarea
            ref={textareaRef}
            placeholder="Type your note here..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleAddNote();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {NOTE_CATEGORIES.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <Button
                    key={category.value}
                    variant={newNoteCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewNoteCategory(category.value)}
                    className="h-7 px-2"
                  >
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
            <Button 
              onClick={handleAddNote}
              disabled={!newNoteContent.trim() || saving}
              size="sm"
            >
              {saving ? <Save className="h-3 w-3 mr-1 animate-pulse" /> : <Plus className="h-3 w-3 mr-1" />}
              Add
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notes yet. Add the first note above.</p>
              </div>
            ) : (
              notes.map((note) => {
                const categoryConfig = getCategoryConfig(note.category);
                const CategoryIcon = categoryConfig.icon;
                const isEditing = editingId === note.id;
                
                return (
                  <div key={note.id} className="bg-muted/30 rounded-lg p-3 space-y-2 hover:bg-muted/50 transition-colors">
                    {/* Note Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className={cn("text-xs text-white", getUserColor(note.created_by))}>
                                  {getUserInitials(note.created_by)}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getUserName(note.created_by)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <Badge variant="secondary" className={cn("text-xs", categoryConfig.color)}>
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {note.category}
                        </Badge>
                        
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(note)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        )}
                        {isEditing && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveEdit(note.id, editingContent)}
                              disabled={saving}
                              className="h-6 w-6 p-0"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditing}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Note Content */}
                    {isEditing ? (
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="min-h-[60px] text-sm resize-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleSaveEdit(note.id, editingContent);
                          }
                          if (e.key === 'Escape') {
                            cancelEditing();
                          }
                        }}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                        {note.content}
                      </p>
                    )}

                    {/* Updated timestamp */}
                    {note.updated_at !== note.created_at && !isEditing && (
                      <p className="text-xs text-muted-foreground italic">
                        Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}