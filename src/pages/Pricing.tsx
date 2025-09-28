import React from 'react';
import { WebsiteLayout } from '@/components/website/WebsiteLayout';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Star, 
  Users, 
  Database, 
  Shield, 
  Zap,
  Building,
  Crown,
  Heart
} from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Perfect for small practices getting started',
      features: [
        'Up to 100 patients',
        'Basic SOAP notes',
        'Appointment scheduling',
        'Patient communications',
        'Email support',
        '5 team members',
        'Mobile app access',
        'Basic analytics'
      ],
      limitations: [
        'Limited integrations',
        'Standard templates only'
      ],
      icon: Heart,
      badge: null,
      buttonText: 'Start Free Trial',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Professional',
      price: '$129',
      period: '/month',
      description: 'Advanced features for growing practices',
      features: [
        'Up to 1,000 patients',
        'Advanced SOAP notes with AI',
        'Smart scheduling & reminders',
        'Multi-channel communications',
        'Priority support',
        '25 team members',
        'Advanced analytics',
        'Custom templates',
        'API access',
        'GoHighLevel integration',
        'Automated workflows',
        'Custom forms'
      ],
      limitations: [],
      icon: Zap,
      badge: 'Most Popular',
      buttonText: 'Start Free Trial',
      buttonVariant: 'default' as const
    },
    {
      name: 'Enterprise',
      price: '$399',
      period: '/month',
      description: 'Full-scale solution for large organizations',
      features: [
        'Unlimited patients',
        'Enterprise SOAP notes',
        'Advanced scheduling suite',
        'Omnichannel communications',
        'Dedicated support',
        'Unlimited team members',
        'Advanced analytics & BI',
        'White-label branding',
        'Full API access',
        'All integrations',
        'Custom development',
        'SSO & advanced security',
        'Compliance reporting',
        'Multi-location support'
      ],
      limitations: [],
      icon: Crown,
      badge: 'Enterprise',
      buttonText: 'Contact Sales',
      buttonVariant: 'outline' as const
    }
  ];

  const features = [
    {
      icon: Database,
      title: 'Multi-Tenant Architecture',
      description: 'Secure data isolation with organization-level access controls'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Enterprise-grade security with comprehensive audit trails'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Role-based permissions and real-time team communication'
    },
    {
      icon: Building,
      title: 'Multi-Location Support',
      description: 'Manage multiple practice locations from a single platform'
    }
  ];

  return (
    <WebsiteLayout>
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <ResponsiveContainer size="full">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-medical-blue/10 text-medical-blue border-medical-blue/20">
              SaaS Pricing
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-medical-blue to-medical-teal bg-clip-text text-transparent"> Plan</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Scalable healthcare management solutions designed to grow with your practice. 
              Start with a 14-day free trial on any plan.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative hover:shadow-xl transition-all duration-300 ${
                  plan.badge === 'Most Popular' 
                    ? 'border-medical-blue shadow-lg scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge 
                      className={`${
                        plan.badge === 'Most Popular' 
                          ? 'bg-medical-blue text-white' 
                          : 'bg-medical-teal text-white'
                      }`}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-medical-blue/10 rounded-full w-fit">
                    <plan.icon className="h-8 w-8 text-medical-blue" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-medical-green mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6">
                    <Link to="/auth">
                      <Button 
                        className={`w-full ${
                          plan.buttonVariant === 'default' 
                            ? 'bg-gradient-to-r from-medical-blue to-medical-teal text-white' 
                            : ''
                        }`}
                        variant={plan.buttonVariant}
                        size="lg"
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enterprise Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <feature.icon className="h-10 w-10 text-medical-blue mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <Card className="bg-muted/30">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Is this HIPAA compliant?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes, HealthFlow SaaS is built with HIPAA compliance at its core, featuring 
                    end-to-end encryption, audit trails, and access controls.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Can I upgrade or downgrade plans?</h3>
                  <p className="text-muted-foreground text-sm">
                    Absolutely! You can change your plan at any time. Changes take effect 
                    at the next billing cycle.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">What integrations are available?</h3>
                  <p className="text-muted-foreground text-sm">
                    We integrate with major EHR systems, billing platforms, and communication 
                    tools. Custom integrations available for Enterprise plans.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Is there a setup fee?</h3>
                  <p className="text-muted-foreground text-sm">
                    No setup fees for Starter and Professional plans. Enterprise plans include 
                    white-glove onboarding and setup assistance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-medical-blue to-medical-teal text-white">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    </WebsiteLayout>
  );
};

export default Pricing;