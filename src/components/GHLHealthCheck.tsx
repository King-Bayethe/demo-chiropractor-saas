import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useGHLHealthCheck } from '@/hooks/useGHLHealthCheck';

export const GHLHealthCheck = () => {
  const { runHealthCheck, isLoading, result, error } = useGHLHealthCheck();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'passed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>GoHighLevel Health Check</CardTitle>
        <CardDescription>
          Diagnose GoHighLevel API connection and configuration issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runHealthCheck} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Run Health Check
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="p-4 bg-gray-50 border rounded-md">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(result.summary.overall)}
                <h3 className="font-medium">Overall Status</h3>
                <Badge variant={getStatusBadgeVariant(result.summary.overall)}>
                  {result.summary.overall}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{result.summary.message}</p>
            </div>

            {/* Credentials Check */}
            <div>
              <h4 className="font-medium mb-2">Credentials</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2">
                  {result.credentials.apiKey ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">API Key</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.credentials.locationId ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Location ID</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.credentials.defaultCalendarId ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">Default Calendar</span>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div>
              <h4 className="font-medium mb-2">Test Results</h4>
              <div className="space-y-2">
                {Object.entries(result.tests).map(([testName, testResult]) => (
                  <div key={testName} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResult.status)}
                      <span className="text-sm font-medium">
                        {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                    <Badge variant={getStatusBadgeVariant(testResult.status)}>
                      {testResult.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Details */}
            {Object.values(result.tests).some(test => test.error) && (
              <div>
                <h4 className="font-medium mb-2">Error Details</h4>
                <div className="space-y-2">
                  {Object.entries(result.tests)
                    .filter(([, testResult]) => testResult.error)
                    .map(([testName, testResult]) => (
                      <div key={testName} className="p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm font-medium text-red-800">
                          {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </p>
                        <p className="text-sm text-red-700">{testResult.error}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {result.summary.overall === 'failed' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Check that your GOHIGHLEVEL_API_KEY and GOHIGHLEVEL_LOCATION_ID are correctly configured in Supabase secrets</li>
                  <li>• Verify that the API key has the necessary permissions for calendar management</li>
                  <li>• Ensure the API key and location ID are from the same GoHighLevel agency/account</li>
                  <li>• Contact your GoHighLevel administrator if you need access to the location</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};