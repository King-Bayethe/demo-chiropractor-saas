import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WebsiteLayout } from '@/components/website/WebsiteLayout';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FeatureShowcase } from '@/components/demo/FeatureShowcase';
import { useIsDemoUser } from '@/hooks/useDemoData';
import { Activity, Users, Calendar, FileText, MessageSquare, Shield, Code, Database, Smartphone, Github, ExternalLink, Play, Target, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { signInAsDemo, user } = useAuth();
  const isDemoUser = useIsDemoUser();

  const handleEnterDemo = () => {
    navigate('/auth');
  };

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Patient Management",
      description: "Comprehensive patient records, demographics, and medical history tracking"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Appointment Scheduling",
      description: "Smart scheduling with automated reminders and calendar integration"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "SOAP Notes",
      description: "Structured clinical documentation with templates and auto-population"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Patient Communications",
      description: "SMS, calls, and messaging with conversation tracking"
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Patient Journey Tracking",
      description: "Comprehensive pipeline from lead capture to care completion with automated workflows"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "HIPAA Compliance",
      description: "Secure data handling with role-based access controls"
    }
  ];


  return (
    <WebsiteLayout>
      <section className="py-16 lg:py-24">
        <ResponsiveContainer size="full">
          {/* Header */}
          <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="h-8 w-8 text-medical-blue" />
            <h1 className="text-4xl font-bold text-foreground">HealthFlow SaaS Platform</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Multi-tenant healthcare practice management platform with HIPAA compliance, advanced analytics, 
            and comprehensive workflow automation. Portfolio demonstration of enterprise SaaS development.
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Badge variant="secondary" className="bg-medical-blue/10 text-medical-blue border-medical-blue/20">
              <Code className="h-3 w-3 mr-1" />
              Portfolio Demo
            </Badge>
            <Badge variant="secondary" className="bg-medical-teal/10 text-medical-teal border-medical-teal/20">
              <Database className="h-3 w-3 mr-1" />
              Full-Stack Application
            </Badge>
            <Badge variant="secondary" className="bg-medical-green/10 text-medical-green border-medical-green/20">
              <Smartphone className="h-3 w-3 mr-1" />
              Responsive Design
            </Badge>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleEnterDemo} 
              size="lg" 
              className="bg-medical-blue hover:bg-medical-blue-dark text-white px-8 py-3 text-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Try Live Demo
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="px-8 py-3 text-lg border-medical-blue text-medical-blue hover:bg-medical-blue/10"
              onClick={() => document.getElementById('feature-showcase')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Target className="h-5 w-5 mr-2" />
              Explore Features
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Demo credentials provided • All data is fictional
          </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-medical-blue/10 rounded-lg text-medical-blue">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
          </div>


          {/* Enhanced Feature Showcase - Only show for public visitors or demo users */}
          {(!user || isDemoUser) && (
            <div id="feature-showcase">
              <FeatureShowcase />
            </div>
          )}

          {/* Technical Highlights */}
          <Card className="bg-gradient-to-br from-medical-blue/5 via-background to-medical-teal/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Code className="h-6 w-6 text-medical-blue" />
                Technical Implementation
              </CardTitle>
              <CardDescription>
                Built with modern web technologies and best practices for enterprise-grade healthcare applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-medical-blue/10 rounded-full flex items-center justify-center">
                    <Database className="h-6 w-6 text-medical-blue" />
                  </div>
                  <h3 className="font-semibold">Backend Architecture</h3>
                  <p className="text-sm text-muted-foreground">
                    Supabase with PostgreSQL, Row Level Security, real-time subscriptions, and Edge Functions for serverless logic
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-medical-teal/10 rounded-full flex items-center justify-center">
                    <Code className="h-6 w-6 text-medical-teal" />
                  </div>
                  <h3 className="font-semibold">Frontend Excellence</h3>
                  <p className="text-sm text-muted-foreground">
                    React 18 + TypeScript + Vite for optimal performance, with Tailwind CSS and shadcn/ui for premium design
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-medical-green/10 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-medical-green" />
                  </div>
                  <h3 className="font-semibold">Security & Compliance</h3>
                  <p className="text-sm text-muted-foreground">
                    HIPAA-compliant architecture with encryption, audit trails, and comprehensive access controls
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Links */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Developer Portfolio Showcase</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  This healthcare management platform demonstrates expertise in full-stack development, 
                  healthcare compliance, and enterprise-grade application architecture.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    View Source Code
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Developer Portfolio
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    LinkedIn Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Demo Features Section - Only show for public visitors or demo users */}
          {(!user || isDemoUser) && (
            <Card className="mt-12 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Demo Features</CardTitle>
                <CardDescription className="text-center">
                  Explore the interactive features of this healthcare management system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center p-6 border rounded-lg">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-medical-blue" />
                    <h3 className="text-lg font-semibold mb-2">Live Conversations</h3>
                    <p className="text-muted-foreground mb-4">
                      Experience real-time patient messaging with SMS integration
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/demo-conversations')}
                      className="w-full"
                    >
                      Try Demo Conversations
                    </Button>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-medical-teal" />
                    <h3 className="text-lg font-semibold mb-2">Full Dashboard</h3>
                    <p className="text-muted-foreground mb-4">
                      Access the complete CRM with patient management and scheduling
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/dashboard')}
                      className="w-full"
                    >
                      Enter Full System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center mt-16 pb-8">
            <p className="text-sm text-muted-foreground">
              Built with React, TypeScript, Supabase, and Tailwind CSS • 
              <span className="mx-2">•</span>
              Portfolio Demo Application
            </p>
          </div>
        </ResponsiveContainer>
      </section>
    </WebsiteLayout>
  );
};

export default Landing;