import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Activity, 
  Shield,
  Database,
  Code,
  Smartphone,
  Zap,
  Brain,
  Lock,
  BarChart3,
  Stethoscope,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    category: 'Patient Management',
    icon: <Users className="h-6 w-6" />,
    color: 'medical-blue',
    items: [
      {
        title: 'Comprehensive Patient Records',
        description: 'Complete patient demographics, medical history, and HIPAA-compliant data management',
        icon: <Users className="h-4 w-4" />,
        demo: '/patients',
        technical: 'React + TypeScript, Supabase RLS, Form validation with Zod'
      },
      {
        title: 'Medical History Tracking',
        description: 'Track chronic conditions, allergies, medications, and family medical history',
        icon: <Stethoscope className="h-4 w-4" />,
        demo: '/patients',
        technical: 'JSONB storage, Complex queries, Audit trails'
      },
      {
        title: 'Insurance Management',
        description: 'Auto insurance, health insurance, and PIP case management',
        icon: <Shield className="h-4 w-4" />,
        demo: '/patients',
        technical: 'Multi-table relationships, Validation triggers, Data normalization'
      }
    ]
  },
  {
    category: 'Clinical Documentation',
    icon: <FileText className="h-6 w-6" />,
    color: 'medical-teal',
    items: [
      {
        title: 'Intelligent SOAP Notes',
        description: 'Structured clinical documentation with smart templates and auto-population',
        icon: <FileText className="h-4 w-4" />,
        demo: '/soap-notes',
        technical: 'Form auto-population, Template engine, PDF generation'
      },
      {
        title: 'Medical Templates',
        description: 'Specialty-specific templates with condition-based recommendations',
        icon: <Brain className="h-4 w-4" />,
        demo: '/new-soap-note',
        technical: 'Dynamic forms, Conditional logic, Medical coding integration'
      },
      {
        title: 'Progress Tracking',
        description: 'Track patient progress over time with visual indicators and trends',
        icon: <BarChart3 className="h-4 w-4" />,
        demo: '/soap-notes',
        technical: 'Time-series data, Chart.js integration, Statistical analysis'
      }
    ]
  },
  {
    category: 'Scheduling & Communication',
    icon: <Calendar className="h-6 w-6" />,
    color: 'medical-green',
    items: [
      {
        title: 'Smart Scheduling',
        description: 'Advanced appointment scheduling with conflict detection and automated reminders',
        icon: <Calendar className="h-4 w-4" />,
        demo: '/appointments',
        technical: 'Real-time availability, Timezone handling, Recurring appointments'
      },
      {
        title: 'Patient Communications',
        description: 'Integrated SMS, email, and call management with GoHighLevel integration',
        icon: <MessageSquare className="h-4 w-4" />,
        demo: '/conversations',
        technical: 'WebSocket real-time updates, SMS API integration, Message queuing'
      },
      {
        title: 'Automated Workflows',
        description: 'Automated appointment reminders, follow-ups, and patient communications',
        icon: <Zap className="h-4 w-4" />,
        demo: '/conversations',
        technical: 'Supabase Edge Functions, Cron jobs, Event-driven architecture'
      }
    ]
  },
  {
    category: 'Security & Compliance',
    icon: <Shield className="h-6 w-6" />,
    color: 'medical-orange',
    items: [
      {
        title: 'HIPAA Compliance',
        description: 'End-to-end encryption, audit trails, and role-based access controls',
        icon: <Lock className="h-4 w-4" />,
        demo: '/settings',
        technical: 'Row Level Security, Encryption at rest, Audit logging'
      },
      {
        title: 'Role-Based Access',
        description: 'Granular permissions for providers, staff, and administrative users',
        icon: <Shield className="h-4 w-4" />,
        demo: '/settings',
        technical: 'JWT authentication, Policy-based authorization, Multi-tenant security'
      },
      {
        title: 'Data Backup & Recovery',
        description: 'Automated backups with point-in-time recovery and disaster planning',
        icon: <Database className="h-4 w-4" />,
        demo: '/settings',
        technical: 'Supabase automated backups, Version control, Data migration tools'
      }
    ]
  }
];

const technicalHighlights = [
  { 
    label: 'Frontend Architecture', 
    value: 'React 18 + TypeScript + Vite',
    icon: <Code className="h-4 w-4" />
  },
  { 
    label: 'Backend & Database', 
    value: 'Supabase (PostgreSQL + Real-time)',
    icon: <Database className="h-4 w-4" />
  },
  { 
    label: 'Styling & Design', 
    value: 'Tailwind CSS + Radix UI + shadcn/ui',
    icon: <Smartphone className="h-4 w-4" />
  },
  { 
    label: 'Authentication', 
    value: 'Row Level Security + JWT',
    icon: <Lock className="h-4 w-4" />
  },
  { 
    label: 'Real-time Features', 
    value: 'WebSocket + Server-Sent Events',
    icon: <Zap className="h-4 w-4" />
  },
  { 
    label: 'Performance', 
    value: 'Code splitting + Lazy loading',
    icon: <BarChart3 className="h-4 w-4" />
  }
];

export const FeatureShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('features');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-medical-blue" />
          Platform Feature Showcase
        </CardTitle>
        <CardDescription>
          Explore the comprehensive features and technical implementation of this healthcare management platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="features">Features & Capabilities</TabsTrigger>
            <TabsTrigger value="technical">Technical Architecture</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="space-y-6">
            {features.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${category.color}/10 rounded-lg text-${category.color}`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{category.category}</h3>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item, itemIndex) => (
                    <Card key={itemIndex} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 bg-${category.color}/10 rounded text-${category.color}`}>
                              {item.icon}
                            </div>
                            <CardTitle className="text-sm">{item.title}</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Live Demo
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm mb-3">
                          {item.description}
                        </CardDescription>
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                            <strong>Tech:</strong> {item.technical}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate(item.demo)}
                          >
                            Try Feature
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="technical" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technicalHighlights.map((tech, index) => (
                <Card key={index} className="border-l-4 border-l-medical-blue">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-medical-blue/10 rounded text-medical-blue">
                        {tech.icon}
                      </div>
                      <h4 className="font-semibold text-sm">{tech.label}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{tech.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Development Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Frontend Excellence
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground ml-6">
                      <li>• Fully responsive design with mobile-first approach</li>
                      <li>• Type-safe development with TypeScript</li>
                      <li>• Component-based architecture with reusable UI</li>
                      <li>• Optimized performance with code splitting</li>
                      <li>• Accessibility compliance (WCAG 2.1)</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Backend & Security
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground ml-6">
                      <li>• HIPAA-compliant data handling and storage</li>
                      <li>• Real-time updates with WebSocket integration</li>
                      <li>• Serverless architecture with Edge Functions</li>
                      <li>• Advanced authentication and authorization</li>
                      <li>• Comprehensive audit logging and monitoring</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};