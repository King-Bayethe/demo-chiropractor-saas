import React, { useState } from 'react';
import { WebsiteLayout } from '@/components/website/WebsiteLayout';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  Calendar,
  HeadphonesIcon,
  Shield
} from 'lucide-react';

const ContactUs = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    practiceType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get detailed answers to your questions',
      contact: 'support@drsilvermancrm.com',
      availability: '24/7 Response within 2 hours'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our healthcare experts',
      contact: '1-800-HEALTHCARE',
      availability: 'Mon-Fri: 8AM-8PM EST'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Instant support for quick questions',
      contact: 'Available in platform',
      availability: 'Mon-Fri: 9AM-6PM EST'
    },
    {
      icon: Calendar,
      title: 'Schedule Demo',
      description: 'Personal walkthrough of all features',
      contact: 'Book online consultation',
      availability: 'Flexible scheduling available'
    }
  ];

  const officeInfo = [
    {
      icon: MapPin,
      title: 'Headquarters',
      details: ['Healthcare Technology District', 'Medical City, HC 12345', 'United States']
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Monday - Friday: 8:00 AM - 8:00 PM EST', 'Saturday: 9:00 AM - 5:00 PM EST', 'Sunday: Emergency support only']
    },
    {
      icon: HeadphonesIcon,
      title: 'Support Levels',
      details: ['Standard: Email & Chat support', 'Premium: Priority phone support', 'Enterprise: Dedicated account manager']
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      details: ['HIPAA Compliance Certified', 'SOC 2 Type II Compliant', 'End-to-end encryption']
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 2 hours during business hours.",
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        practiceType: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <WebsiteLayout>
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <ResponsiveContainer size="full">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-medical-green/10 text-medical-green border-medical-green/20">
              We're Here to Help
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Get in Touch with
              <span className="bg-gradient-to-r from-medical-blue to-medical-teal bg-clip-text text-transparent"> Healthcare Experts</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Have questions about our platform? Need a personalized demo? Our healthcare technology 
              specialists are ready to help you optimize your practice management.
            </p>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <ResponsiveContainer size="full">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">How Can We Help You?</h2>
              <p className="text-lg text-muted-foreground">
                Choose the support method that works best for your needs
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <method.icon className="h-12 w-12 text-medical-blue mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{method.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{method.description}</p>
                    <p className="text-medical-blue font-medium text-sm mb-2">{method.contact}</p>
                    <p className="text-xs text-muted-foreground">{method.availability}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-muted/30">
        <ResponsiveContainer size="full">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Dr. John Smith"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="doctor@practice.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <label htmlFor="practiceType" className="block text-sm font-medium text-foreground mb-2">
                          Practice Type
                        </label>
                        <Input
                          id="practiceType"
                          name="practiceType"
                          type="text"
                          value={formData.practiceType}
                          onChange={handleInputChange}
                          placeholder="Chiropractic, General Practice, etc."
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about your practice needs and how we can help..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-medical-blue to-medical-teal text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Office Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Office Information</h3>
                  <p className="text-muted-foreground mb-6">
                    Visit us, call us, or reach out through any of our support channels. 
                    We're committed to providing exceptional service to healthcare professionals.
                  </p>
                </div>

                {officeInfo.map((info, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <info.icon className="h-6 w-6 text-medical-blue mt-1" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">{info.title}</h4>
                          {info.details.map((detail, detailIndex) => (
                            <p key={detailIndex} className="text-muted-foreground text-sm">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Emergency Support */}
      <section className="py-16">
        <ResponsiveContainer size="full">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-r from-medical-red/10 to-medical-orange/10 border-medical-red/20">
              <CardContent className="p-8">
                <Shield className="h-12 w-12 text-medical-red mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-4">Emergency Support</h3>
                <p className="text-muted-foreground mb-6">
                  For critical system issues affecting patient care, our emergency support team 
                  is available 24/7 to ensure your practice operations continue smoothly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" className="border-medical-red text-medical-red hover:bg-medical-red/10">
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency Hotline: 1-800-URGENT-HC
                  </Button>
                  <Button variant="outline" className="border-medical-red text-medical-red hover:bg-medical-red/10">
                    <Mail className="h-4 w-4 mr-2" />
                    emergency@drsilvermancrm.com
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ResponsiveContainer>
      </section>
    </WebsiteLayout>
  );
};

export default ContactUs;