import React from 'react';
import { WebsiteLayout } from '@/components/website/WebsiteLayout';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Shield, 
  TrendingUp, 
  Stethoscope, 
  Calendar,
  FileText,
  MessageSquare,
  Brain,
  Award
} from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Patient-Centric Care',
      description: 'Every feature is designed with patient outcomes and satisfaction at the forefront.'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliance',
      description: 'Bank-level security and full HIPAA compliance ensure patient data protection.'
    },
    {
      icon: TrendingUp,
      title: 'Practice Growth',
      description: 'Data-driven insights and automation tools to optimize revenue and efficiency.'
    },
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Smart templates and clinical decision support enhance care quality.'
    }
  ];

  const capabilities = [
    {
      icon: Users,
      title: 'Comprehensive Patient Management',
      description: 'Complete patient records, demographics, and multi-language support with specialized workflows for PIP, Workers Comp, and cash patients.'
    },
    {
      icon: FileText,
      title: 'Advanced Clinical Documentation',
      description: 'SOAP notes with smart templates, pain assessments, medical history tracking, and clinical decision support systems.'
    },
    {
      icon: Calendar,
      title: 'Intelligent Scheduling',
      description: 'Smart appointment scheduling with automated reminders, recurring appointments, and integrated calendar management.'
    },
    {
      icon: TrendingUp,
      title: 'Medical Pipeline Management',
      description: 'Track patient journey from lead to completion with specialized PIP case management and attorney referral tracking.'
    },
    {
      icon: MessageSquare,
      title: 'Unified Communication Hub',
      description: 'Patient messaging, SMS integration, team chat, and comprehensive conversation tracking in one platform.'
    },
    {
      icon: Award,
      title: 'Compliance & Security',
      description: 'HIPAA-compliant data handling, role-based access controls, and comprehensive audit trails.'
    }
  ];

  return (
    <WebsiteLayout>
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <ResponsiveContainer size="full">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-medical-blue/10 text-medical-blue border-medical-blue/20">
              Healthcare Technology Leaders
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Transforming Healthcare 
              <span className="bg-gradient-to-r from-medical-blue to-medical-teal bg-clip-text text-transparent"> Practice Management</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              We empower healthcare professionals with comprehensive practice management solutions 
              that streamline workflows, enhance patient care, and optimize revenue generation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/features">
                <Button size="lg" className="bg-gradient-to-r from-medical-blue to-medical-teal text-white">
                  Explore Features
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Get In Touch
                </Button>
              </Link>
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-medical-blue/5">
        <ResponsiveContainer size="full">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To bridge the gap between exceptional patient care and efficient practice management by providing 
              healthcare professionals with innovative, secure, and user-friendly technology solutions that 
              enhance workflow efficiency, improve patient outcomes, and drive sustainable practice growth.
            </p>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <ResponsiveContainer size="full">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Born from the real challenges faced by healthcare professionals, Dr. Silverman CRM was 
                    developed by understanding the unique needs of medical practices, particularly those 
                    specializing in injury-related care and complex insurance workflows.
                  </p>
                  <p>
                    Our platform emerged from the need to unify patient management, clinical documentation, 
                    appointment scheduling, and communication into one seamless experience that doesn't 
                    compromise on security or compliance.
                  </p>
                  <p>
                    Today, we serve healthcare professionals who demand excellence in both patient care 
                    and practice efficiency, providing specialized solutions for PIP cases, Workers 
                    Compensation claims, and comprehensive medical practice management.
                  </p>
                </div>
              </div>
              <div className="lg:order-first">
                <Card className="bg-gradient-to-br from-medical-blue/10 to-medical-teal/10 border-medical-blue/20">
                  <CardContent className="p-8">
                    <Stethoscope className="h-16 w-16 text-medical-blue mb-6" />
                    <h3 className="text-xl font-semibold text-foreground mb-4">Built for Healthcare Professionals</h3>
                    <p className="text-muted-foreground">
                      Every feature, workflow, and interface is designed with deep understanding of 
                      healthcare operations, regulatory requirements, and the critical importance of 
                      patient data security.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-muted/30">
        <ResponsiveContainer size="full">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
              <p className="text-lg text-muted-foreground">
                The principles that guide everything we build and every decision we make
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <value.icon className="h-12 w-12 text-medical-blue mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Platform Capabilities */}
      <section className="py-16">
        <ResponsiveContainer size="full">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Comprehensive Healthcare Solutions</h2>
              <p className="text-lg text-muted-foreground">
                A complete ecosystem designed to handle every aspect of modern healthcare practice management
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {capabilities.map((capability, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <capability.icon className="h-10 w-10 text-medical-blue mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{capability.title}</h3>
                    <p className="text-muted-foreground text-sm">{capability.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Technology & Innovation */}
      <section className="py-16 bg-gradient-to-r from-medical-blue/10 to-medical-teal/10">
        <ResponsiveContainer size="full">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Technology & Innovation</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Built on modern web technologies including React, TypeScript, and Supabase, our platform 
              delivers real-time collaboration, AI-powered clinical decision support, and enterprise-grade 
              security that scales with your practice.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['React', 'TypeScript', 'Supabase', 'Real-time Sync', 'AI Integration', 'HIPAA Compliant'].map((tech) => (
                <Badge key={tech} variant="secondary" className="bg-medical-blue/10 text-medical-blue">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <ResponsiveContainer size="full">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join healthcare professionals who have revolutionized their practice management 
              with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-medical-blue to-medical-teal text-white">
                  Start Free Demo
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    </WebsiteLayout>
  );
};

export default About;