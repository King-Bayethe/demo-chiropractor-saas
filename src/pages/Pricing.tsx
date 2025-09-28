import React from 'react';
import { WebsiteLayout } from '@/components/website/WebsiteLayout';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Zap, Building, Crown, Users, FileText, Calendar, MessageSquare, BarChart3, Shield } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Perfect for small practices getting started',
      badge: null,
      icon: Zap,
      features: [
        'Up to 100 patients',
        '5 team members',
        'Basic SOAP notes',
        'Appointment scheduling',
        'Patient communications',
        'Basic reporting',
        'Email support',
        '14-day free trial'
      ],
      limits: {
        patients: '100',
        users: '5',
        storage: '10GB'
      }
    },
    {
      name: 'Professional',
      price: '$149',
      period: '/month',
      description: 'Comprehensive solution for growing practices',
      badge: 'Most Popular',
      icon: Building,
      features: [
        'Up to 1,000 patients',
        '25 team members',
        'Advanced SOAP notes with templates',
        'Smart scheduling with AI',
        'Multi-channel communications',
        'Advanced analytics & reporting',
        'API access',
        'Priority support',
        'Custom integrations',
        'Automated workflows'
      ],
      limits: {
        patients: '1,000',
        users: '25',
        storage: '100GB'
      }
    },
    {
      name: 'Enterprise',
      price: '$399',
      period: '/month',
      description: 'Full-featured platform for large organizations',
      badge: 'Enterprise',
      icon: Crown,
      features: [
        'Unlimited patients',
        'Unlimited team members',
        'White-label customization',
        'Advanced security & compliance',
        'Custom workflows & automation',
        'Multi-location support',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom integrations',
        'Advanced audit trails',
        'Single Sign-On (SSO)',
        'Custom reporting'
      ],
      limits: {
        patients: 'Unlimited',
        users: 'Unlimited',
        storage: '1TB+'
      }
    }
  ];

  const features = [
    {
      icon: Users,
      title: 'Multi-Tenant Architecture',
      description: 'Secure tenant isolation with organization-level data separation'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliance',
      description: 'End-to-end encryption, audit trails, and regulatory compliance'
    },
    {
      icon: FileText,
      title: 'Clinical Documentation',
      description: 'Advanced SOAP notes, templates, and clinical decision support'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered scheduling with automated reminders and optimization'
    },
    {
      icon: MessageSquare,
      title: 'Unified Communications',
      description: 'Patient messaging, SMS integration, and team collaboration'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time dashboards, custom reports, and business intelligence'
    }
  ];

  return (
    <WebsiteLayout>
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <ResponsiveContainer size="full">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-medical-blue/10 text-medical-blue border-medical-blue/20">
              SaaS Pricing Tiers
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Healthcare SaaS 
              <span className="bg-gradient-to-r from-medical-blue to-medical-teal bg-clip-text text-transparent"> Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Scalable pricing tiers designed for healthcare organizations of all sizes. 
              Portfolio demonstration of SaaS monetization strategies and feature gating.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.badge === 'Most Popular' ? 'border-medical-blue scale-105 shadow-xl' : 'hover:shadow-lg'} transition-all`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className={`px-3 py-1 ${plan.badge === 'Most Popular' ? 'bg-medical-blue text-white' : 'bg-medical-teal text-white'}`}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-medical-blue/10 rounded-lg">
                      <plan.icon className="h-8 w-8 text-medical-blue" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-medical-blue">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className="h-4 w-4 text-medical-green" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-2">Plan Limits</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Patients: {plan.limits.patients}</div>
                      <div>Users: {plan.limits.users}</div>
                      <div>Storage: {plan.limits.storage}</div>
                    </div>
                  </div>

                  <Link to="/auth">
                    <Button 
                      className={`w-full ${plan.badge === 'Most Popular' ? 'bg-medical-blue hover:bg-medical-blue-dark' : 'bg-gradient-to-r from-medical-blue to-medical-teal hover:opacity-90'} text-white`}
                      size="lg"
                    >
                      Start {plan.name} Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Platform Features</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive healthcare management capabilities across all plans
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-medical-blue/10 rounded-lg">
                      <feature.icon className="h-8 w-8 text-medical-blue" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Portfolio Note */}
          <Card className="bg-gradient-to-r from-medical-blue/10 to-medical-teal/10 border-medical-blue/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">Portfolio Demonstration</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                This pricing structure demonstrates SaaS monetization strategies, feature gating, 
                and subscription management. The platform includes Stripe integration for billing, 
                usage tracking, and tenant-based feature access controls.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-medical-blue to-medical-teal text-white">
                    Explore Demo Platform
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline">
                    View Technical Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </ResponsiveContainer>
      </section>
    </WebsiteLayout>
  );
};

export default Pricing;