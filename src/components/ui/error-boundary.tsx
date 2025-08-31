import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  error?: Error;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export const ErrorBoundary = ({ error, onRetry, children }: ErrorBoundaryProps) => {
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-6">
        <div className="text-center space-y-4 max-w-md">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Something went wrong: {error.message}
            </AlertDescription>
          </Alert>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};