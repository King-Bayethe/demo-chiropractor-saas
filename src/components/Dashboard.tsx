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
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockData = {
  salesPipeline: [
    { stage: "Lead Captured", count: 45, percentage: 100 },
    { stage: "Consult Scheduled", count: 32, percentage: 71 },
    { stage: "Patient Seen", count: 24, percentage: 53 },
    { stage: "Billing Pending", count: 18, percentage: 40 },
    { stage: "Payment Collected", count: 15, percentage: 33 }
  ],
  pipPipeline: [
    { stage: "Lead Captured", count: 28, percentage: 100 },
    { stage: "Intake Completed", count: 22, percentage: 79 },
    { stage: "Treatment Ongoing", count: 18, percentage: 65 },
    { stage: "Final Report", count: 12, percentage: 43 },
    { stage: "Payment Received", count: 10, percentage: 36 }
  ],
  stats: {
    conversionRate: 33,
    leadsThisMonth: 73,
    appointmentsScheduled: 48,
    revenueCollected: 142350,
    activePatients: 156
  },
  attorneys: [
    { name: "Johnson & Associates", leads: 12, revenue: 38400 },
    { name: "Miller Law Firm", leads: 8, revenue: 24800 },
    { name: "Davis Legal Group", leads: 6, revenue: 19200 },
    { name: "Wilson & Partners", leads: 4, revenue: 12800 }
  ],
  recentAppointments: [
    { name: "Maria Rodriguez", time: "9:00 AM", type: "PIP Initial", phone: "(786) 555-0123" },
    { name: "James Wilson", time: "10:30 AM", type: "Follow-up", phone: "(305) 555-0456" },
    { name: "Sarah Johnson", time: "2:00 PM", type: "New Patient", phone: "(954) 555-0789" }
  ]
};

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Dr. Silverman's team</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-medical-blue-light text-medical-blue">
            Live Data
          </Badge>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-success">{mockData.stats.conversionRate}%</span>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5%
                  </Badge>
                </div>
              </div>
              <Target className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads This Month</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{mockData.stats.leadsThisMonth}</span>
                  <Badge variant="secondary" className="bg-medical-blue/10 text-medical-blue">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12%
                  </Badge>
                </div>
              </div>
              <Users className="w-8 h-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Appointments</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{mockData.stats.appointmentsScheduled}</span>
                  <Badge variant="secondary" className="bg-medical-teal/10 text-medical-teal">
                    <Calendar className="w-3 h-3 mr-1" />
                    Today
                  </Badge>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-medical-teal" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (YTD)</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-success">
                    ${mockData.stats.revenueCollected.toLocaleString()}
                  </span>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +18%
                  </Badge>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Patients</p>
                <span className="text-2xl font-bold">{mockData.stats.activePatients}</span>
              </div>
              <Activity className="w-8 h-8 text-medical-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Pipeline */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sales Process Pipeline</span>
              <Badge variant="outline">Monthly View</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.salesPipeline.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">{stage.count} patients</span>
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

        {/* PIP Pipeline */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>PIP Case Pipeline</span>
              <Badge variant="outline" className="bg-medical-blue/10 text-medical-blue">PIP Focus</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.pipPipeline.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">{stage.count} cases</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attorney Referral Leaderboard */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-medical-blue" />
              <span>Top Referring Attorneys</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockData.attorneys.map((attorney, index) => (
              <div key={attorney.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{attorney.name}</p>
                  <p className="text-xs text-muted-foreground">{attorney.leads} leads this month</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success text-sm">
                    ${attorney.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">revenue</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-medical-teal" />
              <span>Today's Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockData.recentAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{appointment.name}</p>
                  <p className="text-xs text-muted-foreground">{appointment.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{appointment.time}</p>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{appointment.phone}</span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              View Full Schedule
            </Button>
          </CardContent>
        </Card>

        {/* Quick Access Forms */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-medical-blue" />
              <span>Quick Access Forms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Lead Intake Form
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              New Patient Intake
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              PIP Patient Intake
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Target className="w-4 h-4 mr-2" />
              Pain Assessment
            </Button>
            <div className="pt-2 border-t border-border/50">
              <Button variant="default" className="w-full" size="sm">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Forms Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}