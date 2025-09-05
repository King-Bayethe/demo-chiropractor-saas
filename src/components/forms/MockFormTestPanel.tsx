import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  submitMockPIPForm, 
  submitMockCashForm, 
  submitMockLOPForm, 
  submitMockNewForm,
  submitAllMockForms 
} from '@/utils/mockFormSubmissions';
import { runMockFormTests } from '@/utils/testMockForms';
import { toast } from 'sonner';

export const MockFormTestPanel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runIndividualTest = async (testType: 'pip' | 'cash' | 'lop' | 'new') => {
    setIsRunning(true);
    try {
      let result;
      switch (testType) {
        case 'pip':
          result = await submitMockPIPForm();
          break;
        case 'cash':
          result = await submitMockCashForm();
          break;
        case 'lop':
          result = await submitMockLOPForm();
          break;
        case 'new':
          result = await submitMockNewForm();
          break;
      }
      
      if (result.success) {
        toast.success(`${testType.toUpperCase()} form submitted successfully`);
      } else {
        toast.error(`${testType.toUpperCase()} form submission failed: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Error submitting ${testType.toUpperCase()} form: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      const results = await runMockFormTests();
      setTestResults(results);
      
      if (results.success) {
        toast.success(`All forms tested successfully! ${results.summary.successfulSubmissions}/${results.summary.totalForms} forms submitted`);
      } else {
        toast.error('Some form tests failed');
      }
    } catch (error) {
      toast.error(`Error running tests: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mock Form Test Panel</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test form submissions and autopopulation with mock data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => runIndividualTest('pip')}
            disabled={isRunning}
          >
            Test PIP Form
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => runIndividualTest('cash')}
            disabled={isRunning}
          >
            Test Cash Form
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => runIndividualTest('lop')}
            disabled={isRunning}
          >
            Test LOP Form
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => runIndividualTest('new')}
            disabled={isRunning}
          >
            Test New Form
          </Button>
        </div>
        
        <Button 
          onClick={runAllTests}
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Tests...' : 'Run All Form Tests & SOAP Autopopulation'}
        </Button>

        {testResults && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold">Test Results:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Forms Submitted: <Badge variant="secondary">{testResults.summary.successfulSubmissions}/{testResults.summary.totalForms}</Badge></div>
              <div>SOAP Tests: <Badge variant="secondary">{testResults.summary.soapTestsRun}</Badge></div>
            </div>
            <div className="text-xs text-muted-foreground">
              {testResults.summary.allSuccessful ? '✅ All tests passed' : '❌ Some tests failed'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};