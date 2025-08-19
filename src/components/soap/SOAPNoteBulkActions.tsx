import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ChevronDown, 
  Download, 
  Trash2, 
  FileText, 
  Archive,
  MoreHorizontal,
  X
} from "lucide-react";
import { SOAPNote } from "@/hooks/useSOAPNotes";

interface SOAPNoteBulkActionsProps {
  soapNotes: SOAPNote[];
  selectedNotes: string[];
  onSelectionChange: (noteIds: string[]) => void;
  onBulkDelete?: (noteIds: string[]) => Promise<void>;
  onBulkExport?: (noteIds: string[]) => Promise<void>;
  disabled?: boolean;
}

export function SOAPNoteBulkActions({ 
  soapNotes,
  selectedNotes, 
  onSelectionChange, 
  onBulkDelete,
  onBulkExport,
  disabled = false
}: SOAPNoteBulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const allSelected = soapNotes.length > 0 && selectedNotes.length === soapNotes.length;
  const someSelected = selectedNotes.length > 0 && selectedNotes.length < soapNotes.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(soapNotes.map(note => note.id));
    }
  };

  const handleClearSelection = () => {
    onSelectionChange([]);
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete) return;
    
    setIsProcessing(true);
    try {
      await onBulkDelete(selectedNotes);
      onSelectionChange([]);
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

  const handleBulkExport = async () => {
    if (!onBulkExport) return;
    
    setIsProcessing(true);
    try {
      await onBulkExport(selectedNotes);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedNotesData = soapNotes.filter(note => selectedNotes.includes(note.id));
  const draftCount = selectedNotesData.filter(note => note.is_draft).length;
  const completeCount = selectedNotesData.filter(note => !note.is_draft).length;

  if (soapNotes.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg border">
        {/* Selection Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              disabled={disabled}
              aria-label={allSelected ? "Deselect all notes" : "Select all notes"}
            />
            <span className="text-sm font-medium">
              {selectedNotes.length > 0 ? (
                `${selectedNotes.length} selected`
              ) : (
                'Select notes'
              )}
            </span>
          </div>

          {selectedNotes.length > 0 && (
            <>
              <div className="flex items-center gap-1">
                {completeCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {completeCount} complete
                  </Badge>
                )}
                {draftCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {draftCount} draft{draftCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedNotes.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <div className="hidden sm:flex items-center gap-1">
              {onBulkExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  disabled={disabled || isProcessing}
                  className="h-8"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export ({selectedNotes.length})
                </Button>
              )}
              
              {onBulkDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={disabled || isProcessing}
                  className="h-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete ({selectedNotes.length})
                </Button>
              )}
            </div>

            {/* Mobile Actions Menu */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={disabled || isProcessing}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onBulkExport && (
                    <DropdownMenuItem onClick={handleBulkExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Export {selectedNotes.length} note{selectedNotes.length > 1 ? 's' : ''}
                    </DropdownMenuItem>
                  )}
                  
                  {onBulkDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete {selectedNotes.length} note{selectedNotes.length > 1 ? 's' : ''}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete SOAP Notes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedNotes.length} SOAP note{selectedNotes.length > 1 ? 's' : ''}? 
              This action cannot be undone.
              {draftCount > 0 && completeCount > 0 && (
                <div className="mt-2 text-sm">
                  This includes {draftCount} draft{draftCount > 1 ? 's' : ''} and {completeCount} completed note{completeCount > 1 ? 's' : ''}.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? 'Deleting...' : `Delete ${selectedNotes.length} note${selectedNotes.length > 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}