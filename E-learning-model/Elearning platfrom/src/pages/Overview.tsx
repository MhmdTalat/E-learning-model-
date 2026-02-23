import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Building2, 
  BookOpen, 
  Users, 
  UserCheck, 
  ClipboardList, 
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
}

interface QuickLink {
  to: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}

const Overview = () => {
  const { user } = useAuth();

  const stats: StatCard[] = [
    { label: 'Total Students', value: '2,847', change: '+12%', positive: true, icon: Users },
    { label: 'Active Courses', value: '156', change: '+8%', positive: true, icon: BookOpen },
    { label: 'Instructors', value: '48', change: '+3%', positive: true, icon: UserCheck },
    { label: 'Enrollments', value: '4,521', change: '+18%', positive: true, icon: ClipboardList },
  ];

  const quickLinks: QuickLink[] = [
    { to: '/dashboard/departments', label: 'Departments', desc: 'Manage academic departments', icon: Building2, color: 'bg-blue-500' },
    { to: '/dashboard/courses', label: 'Courses', desc: 'View and edit courses', icon: BookOpen, color: 'bg-emerald-500' },
    { to: '/dashboard/instructors', label: 'Instructors', desc: 'Manage teaching staff', icon: UserCheck, color: 'bg-purple-500' },
    { to: '/dashboard/students', label: 'Students', desc: 'Student management', icon: Users, color: 'bg-orange-500' },
    { to: '/dashboard/enrollments', label: 'Enrollments', desc: 'Course registrations', icon: ClipboardList, color: 'bg-pink-500' },
    { to: '/dashboard/analysis', label: 'Analysis', desc: 'View analytics & reports', icon: BarChart3, color: 'bg-cyan-500' },
  ];

  const recentActivity = [
    { action: 'New student enrolled', subject: 'Web Development 101', time: '2 min ago', icon: CheckCircle },
    { action: 'Course updated', subject: 'Advanced React Patterns', time: '15 min ago', icon: BookOpen },
    { action: 'New instructor added', subject: 'Dr. Sarah Johnson', time: '1 hour ago', icon: UserCheck },
    { action: 'Department created', subject: 'Data Science', time: '3 hours ago', icon: Building2 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
        <h2 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h2>
        <p className="text-primary-foreground/80 text-lg">
          Here's what's happening with your e-learning platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="group hover:shadow-card-hover transition-all duration-300 border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className={`w-4 h-4 ${stat.positive ? 'text-success' : 'text-destructive'}`} />
                    <span className={`text-sm font-medium ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-xl group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickLinks.map((link, i) => (
              <Link
                key={i}
                to={link.to}
                className="group p-4 bg-card rounded-xl border border-border hover:shadow-card-hover hover:border-accent/50 transition-all duration-300"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center mb-3`}>
                  <link.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                      {link.label}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <Card className="border-border">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <activity.icon className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground truncate">{activity.subject}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Overview;
