import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserX, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const ImpersonationBanner = () => {
  const { 
    isImpersonating, 
    originalProfile, 
    impersonatedProfile, 
    endImpersonation 
  } = useAuth();

  if (!isImpersonating) return null;

  const handleEndImpersonation = async () => {
    await endImpersonation();
    toast.success('Impersonation ended');
  };

  const getOriginalUserName = () => {
    if (originalProfile?.first_name || originalProfile?.last_name) {
      return `${originalProfile.first_name || ''} ${originalProfile.last_name || ''}`.trim();
    }
    return originalProfile?.email || 'Unknown User';
  };

  const getImpersonatedUserName = () => {
    if (impersonatedProfile?.first_name || impersonatedProfile?.last_name) {
      return `${impersonatedProfile.first_name || ''} ${impersonatedProfile.last_name || ''}`.trim();
    }
    return impersonatedProfile?.email || 'Unknown User';
  };

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800 mb-4 mx-4 mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="font-medium">Impersonation Active:</span>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="text-sm">
              {getOriginalUserName()} is acting as {getImpersonatedUserName()}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEndImpersonation}
          className="ml-4 bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
        >
          <UserX className="h-3 w-3 mr-1" />
          Exit Impersonation
        </Button>
      </AlertDescription>
    </Alert>
  );
};