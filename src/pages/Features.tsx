import React from 'react';
import { WebsiteLayout } from '@/components/website/WebsiteLayout';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Brain,
  Smartphone,
  Clock,
  DollarSign,
  CheckCircle,
  Star
} from 'lucide-react';

const Features = () => {
  const mainFeatures = [
    {
      icon: Users,
      title: 'Patient Management System',
      description: 'Comprehensive patient records with multi-language support and specialized workflows.',
      features: [
        'Complete demographic management',
        'Multi-language patient support',
        'PIP & Workers Comp specialization',
        'Insurance verification tools',
        'Patient history tracking'
      ],
      badge: 'Core Feature'
    },
    {
      icon: FileText,
      title: 'Clinical Documentation',
      description: 'Advanced SOAP notes with AI-powered templates and clinical decision support.',
      features: [
        'Smart SOAP note templates',
        'Pain assessment tools',
        'Clinical decision support',
        'Auto-population features',
        'Medical history integration'
      ],
      badge: 'AI-Enhanced'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Intelligent appointment management with automated reminders and recurring bookings.',
      features: [
        'Automated appointment reminders',
        'Recurring appointment management',
        'Calendar integration',
        'Resource optimization',
        'Real-time availability'
      ],
      badge: 'Automated'
    },
    {
      icon: TrendingUp,
      title: 'Pipeline Management',
      description: 'Track patient journey from lead to completion with specialized case management.',
      features: [
        'PIP case pipeline tracking',
        'Attorney referral management',
        'Conversion analytics',
        'Revenue optimization',
        'Treatment completion tracking'
      ],
      badge: 'Revenue Focus'
    },
    {
      icon: MessageSquare,
      title: 'Communication Hub',
      description: 'Unified messaging platform with SMS integration and team collaboration.',
      features: [
        'Patient messaging portal',
        'SMS integration',
        'Team chat functionality',
        'File sharing & attachments',
        'Conversation history'
      ],
      badge: 'All-in-One'
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'HIPAA-compliant platform with enterprise-grade security and audit trails.',
      features: [
        'HIPAA compliance certification',
        'Role-based access controls',
        'Comprehensive audit trails',
        'Data encryption',
        'Secure cloud storage'
      ],
      badge: 'Enterprise-Grade'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Save 4+ Hours Daily',
      description: 'Automated workflows and smart templates reduce administrative burden.'
    },
    {
      icon: DollarSign,
      title: 'Increase Revenue by 30%',
      description: 'Optimized patient flow and reduced no-shows boost practice profitability.'
    },
    {
      icon: CheckCircle,
      title: '99.9% Compliance Rate',
      description: 'Built-in HIPAA compliance ensures regulatory adherence.'
    },
    {
      icon: Star,
      title: 'Improve Patient Satisfaction',
      description: 'Streamlined communication and reduced wait times enhance patient experience.'
    }
  ];

  const integrations = [
    'GoHighLevel CRM',
    'SMS Gateways',
    'Email Providers',
    'Calendar Systems',
    'Payment Processors',
    'Insurance Verifiers',
    'Document Management',
    'Telehealth Platforms'
  ];

  return (
    <WebsiteLayout>
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <ResponsiveContainer size="full">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-medical-teal/10 text-medical-teal border-medical-teal/20">
              Comprehensive Feature Set
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-medical-blue to-medical-teal bg-clip-text text-transparent"> Manage Your Practice</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              From patient intake to treatment completion, our platform provides all the tools 
              healthcare professionals need to deliver exceptional care while optimizing operations.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-medical-blue to-medical-teal text-white">
                Try All Features Free
              </Button>
            </Link>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Main Features */}
      <section className="py-16">
        <ResponsiveContainer size="full">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Core Platform Features</h2>
              <p className="text-lg text-muted-foreground">
                Discover the powerful features that make HealthFlow SaaS the complete healthcare management solution
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              {mainFeatures.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-medical-blue/10">
                          <feature.icon className="h-6 w-6 text-medical-blue" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-medical-teal/10 text-medical-teal">
                        {feature.badge}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-medical-green" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-r from-medical-blue/5 to-medical-teal/5">
        <ResponsiveContainer size="full">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Measurable Results</h2>
              <p className="text-lg text-muted-foreground">
                Healthcare practices using our platform see immediate and lasting improvements
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <benefit.icon className="h-12 w-12 text-medical-blue mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Technology & Integration */}
      <section className="py-16">
        <ResponsiveContainer size="full">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                  <Brain className="inline h-10 w-10 text-medical-blue mr-3" />
                  AI-Powered Intelligence
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Our platform leverages artificial intelligence to enhance clinical decision-making, 
                    automate routine tasks, and provide intelligent insights that improve patient outcomes.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-medical-green" />
                      <span>Smart clinical templates that adapt to patient history</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-medical-green" />
                      <span>Automated appointment scheduling optimization</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-medical-green" />
                      <span>Predictive analytics for patient care</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-medical-green" />
                      <span>Intelligent form auto-population</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <Card className="bg-gradient-to-br from-medical-blue/10 to-medical-teal/10 border-medical-blue/20">
                  <CardContent className="p-8">
                    <Smartphone className="h-16 w-16 text-medical-blue mb-6" />
                    <h3 className="text-xl font-semibold text-foreground mb-4">Mobile-First Design</h3>
                    <p className="text-muted-foreground mb-4">
                      Access your practice management tools anywhere, anytime with our responsive, 
                      mobile-optimized interface.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-medical-green" />
                        <span>Native mobile experience</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-medical-green" />
                        <span>Offline capability</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-medical-green" />
                        <span>Real-time synchronization</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Integrations */}
      <section className="py-16 bg-muted/30">
        <ResponsiveContainer size="full">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Seamless Integrations</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Connect with the tools you already use to create a unified healthcare ecosystem
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {integrations.map((integration) => (
                <Card key={integration} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm font-medium text-foreground">{integration}</p>
                  </CardContent>
                </Card>
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
              Experience All Features Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your free demo and discover how our comprehensive platform can transform 
              your healthcare practice management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-medical-blue to-medical-teal text-white">
                  Start Free Demo
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Schedule Demo Call
                </Button>
              </Link>
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    </WebsiteLayout>
  );
};

export default Features;