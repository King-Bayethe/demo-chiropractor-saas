import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  FileText,
  Phone,
  Mail,
  Activity,
  Target,
  ArrowUpRight,
  Award,
  Bell,
  Settings,
  Play
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useDemoData } from "@/hooks/useDemoData";
import { DemoTour } from "@/components/demo/DemoTour";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDemoUser, mockDashboardStats, mockAppointments, mockOpportunities } = useDemoData();
  const [showTour, setShowTour] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Show tour automatically for first-time visitors
    const hasSeenTour = localStorage.getItem('demo-tour-completed');
    if (!hasSeenTour && isDemoUser) {
      const timer = setTimeout(() => setShowTour(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isDemoUser]);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('demo-tour-completed', 'true');
  };

const mockData = {
  patientJourneyPipeline: [
    { stage: "New Lead", count: 45, percentage: 100 },
    { stage: "Qualified Prospect", count: 35, percentage: 78 },
    { stage: "Appointment Scheduled", count: 28, percentage: 62 },
    { stage: "Initial Consultation", count: 24, percentage: 53 },
    { stage: "Active Treatment", count: 18, percentage: 40 }
  ],
  revenueCyclePipeline: [
    { stage: "Service Inquiry", count: 32, percentage: 100 },
    { stage: "Insurance Verified", count: 28, percentage: 88 },
    { stage: "Service Scheduled", count: 24, percentage: 75 },
    { stage: "Service Provided", count: 20, percentage: 63 },
    { stage: "Payment Collected", count: 16, percentage: 50 }
  ],
  stats: {
    conversionRate: 33,
    leadsThisMonth: 73,
    appointmentsScheduled: 48,
    revenueCollected: 142350,
    activePatients: 156
  },
  referralSources: [
    { name: "Physician Referrals", leads: 18, revenue: 54200 },
    { name: "Online Marketing", leads: 14, revenue: 38800 },
    { name: "Patient Referrals", leads: 10, revenue: 28400 },
    { name: "Insurance Network", leads: 8, revenue: 22600 }
  ],
  recentAppointments: [
    { name: "Maria Rodriguez", time: "9:00 AM", type: "Initial Consultation", phone: "(786) 555-0123" },
    { name: "James Wilson", time: "10:30 AM", type: "Follow-up Visit", phone: "(305) 555-0456" },
    { name: "Sarah Johnson", time: "2:00 PM", type: "Annual Physical", phone: "(954) 555-0789" }
  ]
};

const stats = mockDashboardStats || mockData.stats;
  const recentAppointments = mockAppointments.slice(0, 3).map(apt => ({
    name: apt.patient_name,
    time: new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: apt.appointment_type,
    phone: apt.patient_phone
  })) || mockData.recentAppointments;

  return (
    <>
      {/* Demo Banner */}
      {showBanner && isDemoUser && (
        <DemoBanner 
          variant="top" 
          onDismiss={() => setShowBanner(false)}
          showSourceCode={true}
          showPortfolioLink={true}
        />
      )}

      {/* Demo Tour */}
      {showTour && (
        <DemoTour onClose={handleTourComplete} autoStart={true} />
      )}

      <div className="h-full bg-background p-2 sm:p-4 space-y-3 sm:space-y-4 overflow-auto">
      {/* Header */}
      <div className="dashboard-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="h-8 sm:h-12 w-8 sm:w-12 bg-medical-blue rounded-lg flex items-center justify-center">
            <Activity className="h-4 sm:h-6 w-4 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-foreground">Healthcare Portfolio Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Demo Healthcare Management System</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-medical-blue-light text-medical-blue text-xs sm:text-sm">
            Portfolio Demo
          </Badge>
          {!localStorage.getItem('demo-tour-completed') && (
            <Button 
              variant="default" 
              size="sm" 
              className="text-xs sm:text-sm bg-medical-blue hover:bg-medical-blue-dark"
              onClick={() => setShowTour(true)}
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Start Demo Tour</span>
              <span className="sm:hidden">Tour</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs sm:text-sm"
            onClick={() => navigate('/settings?section=notifications')}
          >
            <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Test Notifications</span>
            <span className="sm:hidden">Notify</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Conversion Rate</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <span className="text-lg sm:text-2xl font-bold text-success">{mockData.stats.conversionRate}%</span>
                  <Badge variant="secondary" className="bg-success/10 text-success text-xs mt-1 sm:mt-0 w-fit">
                    <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                    +5%
                  </Badge>
                </div>
              </div>
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Leads This Month</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <span className="text-lg sm:text-2xl font-bold">{mockData.stats.leadsThisMonth}</span>
                  <Badge variant="secondary" className="bg-medical-blue/10 text-medical-blue text-xs mt-1 sm:mt-0 w-fit">
                    <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                    +12%
                  </Badge>
                </div>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Appointments</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <span className="text-lg sm:text-2xl font-bold">{mockData.stats.appointmentsScheduled}</span>
                  <Badge variant="secondary" className="bg-medical-teal/10 text-medical-teal text-xs mt-1 sm:mt-0 w-fit">
                    <Calendar className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                    Today
                  </Badge>
                </div>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-medical-teal" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm relative">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Revenue (YTD)</p>
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 text-xs w-fit">
                    Demo Data
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <span className="text-lg sm:text-2xl font-bold text-muted-foreground">
                    ${mockData.stats.revenueCollected.toLocaleString()}*
                  </span>
                  <Badge variant="secondary" className="bg-muted/10 text-muted-foreground text-xs mt-1 sm:mt-0 w-fit">
                    <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                    Sample Data
                  </Badge>
                </div>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Patients</p>
                <span className="text-lg sm:text-2xl font-bold">{mockData.stats.activePatients}</span>
              </div>
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Patient Journey Pipeline */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-base sm:text-lg">Patient Journey Pipeline</span>
              <Badge variant="outline" className="text-xs w-fit">Acquisition Flow</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {mockData.patientJourneyPipeline.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-medium text-xs sm:text-sm">{stage.stage}</span>
                  </div>
                  <span className="text-muted-foreground text-xs sm:text-sm">{stage.count} patients</span>
                </div>
                <Progress 
                  value={stage.percentage} 
                  className="h-2" 
                />
                <div className="text-xs text-muted-foreground text-right">
                  {stage.percentage}% conversion
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue Cycle Pipeline */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-base sm:text-lg">Revenue Cycle Pipeline</span>
              <Badge variant="outline" className="bg-medical-blue/10 text-medical-blue text-xs w-fit">Financial Flow</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {mockData.revenueCyclePipeline.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-xs sm:text-sm">{stage.stage}</span>
                  <span className="text-muted-foreground text-xs sm:text-sm">{stage.count} opportunities</span>
                </div>
                <Progress 
                  value={stage.percentage} 
                  className="h-2" 
                />
                <div className="text-xs text-muted-foreground text-right">
                  {stage.percentage}% completion
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Top Referral Sources */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-medical-blue" />
              <span>Top Referral Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {mockData.referralSources.map((source, index) => (
              <div key={source.name} className="flex items-center justify-between p-2 sm:p-3 bg-muted/30 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm truncate">{source.name}</p>
                  <p className="text-xs text-muted-foreground">{source.leads} new patients</p>
                </div>
                <div className="text-right ml-2">
                  <p className="font-semibold text-success text-xs sm:text-sm">
                    ${source.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">revenue</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-medical-teal" />
              <span>Today's Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {mockData.recentAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-muted/30 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm truncate">{appointment.name}</p>
                  <p className="text-xs text-muted-foreground">{appointment.type}</p>
                </div>
                <div className="text-right ml-2">
                  <p className="font-semibold text-xs sm:text-sm">{appointment.time}</p>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Phone className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">{appointment.phone}</span>
                    <span className="sm:hidden">Call</span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-3 sm:mt-4" size="sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="text-xs sm:text-sm">View Full Schedule</span>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Access Forms */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-medical-blue" />
              <span>Quick Access Forms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="text-xs sm:text-sm">New Patient Registration</span>
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="text-xs sm:text-sm">Medical History Update</span>
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="text-xs sm:text-sm">Insurance Verification</span>
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="text-xs sm:text-sm">Patient Feedback Survey</span>
            </Button>
            <div className="pt-2 border-t border-border/50">
              <Button variant="default" className="w-full" size="sm">
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span className="text-xs sm:text-sm">Forms Hub</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}

export { Dashboard };