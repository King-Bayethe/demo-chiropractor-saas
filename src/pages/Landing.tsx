import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Users, Calendar, FileText, MessageSquare, Shield, Code, Database, Smartphone } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { signInAsDemo } = useAuth();

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
      title: "Medical Pipeline",
      description: "Track patient journey from lead to treatment completion"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "HIPAA Compliance",
      description: "Secure data handling with role-based access controls"
    }
  ];

  const techStack = [
    { name: "React", color: "bg-medical-blue/10 text-medical-blue" },
    { name: "TypeScript", color: "bg-medical-blue/10 text-medical-blue" },
    { name: "Tailwind CSS", color: "bg-medical-teal/10 text-medical-teal" },
    { name: "Supabase", color: "bg-medical-green/10 text-medical-green" },
    { name: "PostgreSQL", color: "bg-primary/10 text-primary" },
    { name: "Row Level Security", color: "bg-secondary/80 text-secondary-foreground" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/20 via-background to-medical-teal/5 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">{/* Add max-width for better readability */}
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="h-8 w-8 text-medical-blue" />
            <h1 className="text-4xl font-bold text-foreground">Healthcare Management System</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            A comprehensive healthcare practice management system built with modern web technologies.
            This is a portfolio demonstration showcasing real-world medical workflow capabilities.
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
          
          <Button 
            onClick={handleEnterDemo} 
            size="lg" 
            className="bg-medical-blue hover:bg-medical-blue-dark text-white px-8 py-3 text-lg"
          >
            Enter Demo System
          </Button>
          
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

        {/* Technology Stack */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Technology Stack</CardTitle>
            <CardDescription className="text-center">
              Built with modern, production-ready technologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech, index) => (
                <Badge key={index} variant="secondary" className={tech.color}>
                  {tech.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <div className="text-center">
          <Card className="inline-block">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Developed as a portfolio demonstration of full-stack healthcare application development
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">
                  View Source Code
                </Button>
                <Button variant="outline" size="sm">
                  LinkedIn Profile
                </Button>
                <Button variant="outline" size="sm">
                  Contact Developer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className="text-sm text-muted-foreground">
            Built with React, TypeScript, Supabase, and Tailwind CSS • 
            <span className="mx-2">•</span>
            Portfolio Demo Application
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;