import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, ChevronLeft, Play, Users, Calendar, FileText, MessageSquare, Activity, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Healthcare Dashboard',
    description: 'Your central command center showing key metrics, pipelines, and today\'s schedule with real-time updates.',
    target: '.dashboard-header',
    icon: <Activity className="h-5 w-5" />,
    position: 'bottom',
    highlight: true
  },
  {
    id: 'metrics',
    title: 'Performance Metrics',
    description: 'Track conversion rates, leads, appointments, and revenue with interactive charts and trend analysis.',
    target: '.metrics-grid',
    icon: <Target className="h-5 w-5" />,
    position: 'bottom'
  },
  {
    id: 'patients',
    title: 'Patient Management',
    description: 'Comprehensive patient records with medical history, demographics, and HIPAA-compliant data handling.',
    target: '.patients-section',
    icon: <Users className="h-5 w-5" />,
    position: 'right'
  },
  {
    id: 'appointments',
    title: 'Smart Scheduling',
    description: 'Advanced appointment scheduling with automated reminders, conflict detection, and calendar integration.',
    target: '.appointments-section',
    icon: <Calendar className="h-5 w-5" />,
    position: 'right'
  },
  {
    id: 'soap',
    title: 'Clinical Documentation',
    description: 'Structured SOAP notes with intelligent templates, auto-population, and medical coding assistance.',
    target: '.soap-section',
    icon: <FileText className="h-5 w-5" />,
    position: 'right'
  },
  {
    id: 'communications',
    title: 'Patient Communications',
    description: 'Integrated SMS, email, and call management with conversation tracking and automated workflows.',
    target: '.communications-section',
    icon: <MessageSquare className="h-5 w-5" />,
    position: 'right'
  }
];

interface DemoTourProps {
  onClose: () => void;
  autoStart?: boolean;
}

export const DemoTour: React.FC<DemoTourProps> = ({ onClose, autoStart = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(autoStart);
  const [hasStarted, setHasStarted] = useState(false);

  const currentTourStep = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (isActive && currentTourStep?.target) {
      const element = document.querySelector(currentTourStep.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (currentTourStep.highlight) {
          element.classList.add('tour-highlight');
          setTimeout(() => element.classList.remove('tour-highlight'), 3000);
        }
      }
    }
  }, [currentStep, isActive, currentTourStep]);

  const startTour = () => {
    setIsActive(true);
    setHasStarted(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (isLastStep) {
      completeTour();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTour = () => {
    setIsActive(false);
    onClose();
  };

  const skipTour = () => {
    setIsActive(false);
    onClose();
  };

  if (!isActive && !hasStarted) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="w-80 shadow-lg border-medical-blue/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-medical-blue/10 rounded-lg">
                  <Play className="h-4 w-4 text-medical-blue" />
                </div>
                <CardTitle className="text-lg">Interactive Demo Tour</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Discover the key features of this healthcare management platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>6 interactive steps</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>~3 minutes to complete</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={startTour} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Tour
              </Button>
              <Button variant="outline" onClick={onClose}>
                Maybe Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isActive) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={skipTour} />
      
      {/* Tour Step Card */}
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="w-96 shadow-xl border-medical-blue/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-medical-blue/10 rounded-lg">
                  {currentTourStep.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{currentTourStep.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep + 1} of {tourSteps.length}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={skipTour}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4 leading-relaxed">
              {currentTourStep.description}
            </CardDescription>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-medical-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={prevStep}
                disabled={isFirstStep}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={skipTour}>
                  Skip Tour
                </Button>
                <Button onClick={nextStep}>
                  {isLastStep ? 'Complete' : 'Next'}
                  {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};