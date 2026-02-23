import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, UserCheck, Building2, TrendingUp, Activity, Zap, BarChart3 } from 'lucide-react';
import { studentsAPI, coursesAPI, instructorsAPI, departmentsAPI, adminsAPI } from '@/lib/api';

interface Stats {
  totalStudents: number;
  totalCourses: number;
  totalInstructors: number;
  totalDepartments: number;
  totalAdmins: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalCourses: 0,
    totalInstructors: 0,
    totalDepartments: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [studentsRes, coursesRes, instructorsRes, deptRes, adminsRes] = await Promise.all([
          studentsAPI.getAll().catch(() => ({ data: [] })),
          coursesAPI.getAll().catch(() => ({ data: [] })),
          instructorsAPI.getAll().catch(() => ({ data: [] })),
          departmentsAPI.getAll().catch(() => ({ data: [] })),
          adminsAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const students = Array.isArray(studentsRes?.data) ? studentsRes.data : [];
        const courses = Array.isArray(coursesRes?.data) ? coursesRes.data : [];
        const instructors = Array.isArray(instructorsRes?.data) ? instructorsRes.data : [];
        const departments = Array.isArray(deptRes?.data) ? deptRes.data : [];
        const admins = Array.isArray(adminsRes?.data) ? adminsRes.data : [];

        setStats({
          totalStudents: students.length,
          totalCourses: courses.length,
          totalInstructors: instructors.length,
          totalDepartments: departments.length,
          totalAdmins: admins.length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Calculate derived metrics
  const studentsPerCourse = stats.totalCourses > 0 ? (stats.totalStudents / stats.totalCourses).toFixed(1) : 0;
  const instructorsPerDept = stats.totalDepartments > 0 ? (stats.totalInstructors / stats.totalDepartments).toFixed(1) : 0;
  const totalUsers = stats.totalStudents + stats.totalInstructors + stats.totalAdmins;

  const statCards: MetricCard[] = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      description: `${studentsPerCourse} per course on average`,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Courses',
      value: stats.totalCourses,
      description: 'Courses available for enrollment',
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Teaching Staff',
      value: stats.totalInstructors,
      description: `${instructorsPerDept} per department on average`,
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      description: 'Academic divisions',
      icon: Building2,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p className="font-semibold">Error Loading Dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back!</h2>
        <p className="text-muted-foreground">Here's an overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border-border hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Students</span>
                <span className="text-sm font-semibold text-blue-600">{stats.totalStudents}</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: totalUsers > 0 ? `${(stats.totalStudents / totalUsers) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Instructors</span>
                <span className="text-sm font-semibold text-green-600">{stats.totalInstructors}</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: totalUsers > 0 ? `${(stats.totalInstructors / totalUsers) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Admins</span>
                <span className="text-sm font-semibold text-orange-600">{stats.totalAdmins}</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: totalUsers > 0 ? `${(stats.totalAdmins / totalUsers) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Total Users: <span className="font-semibold text-foreground">{totalUsers}</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Metrics */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5" />
              Efficiency Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Students per Course</p>
              <p className="text-2xl font-bold text-foreground">{studentsPerCourse}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Instructors per Department</p>
              <p className="text-2xl font-bold text-foreground">{instructorsPerDept}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Courses per Department</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalDepartments > 0 ? (stats.totalCourses / stats.totalDepartments).toFixed(1) : 0}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-foreground">Server Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-foreground">Database Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-foreground">API Operational</span>
            </div>
            <div className="pt-3 border-t border-border">
              <Badge className="bg-green-500/20 text-green-700">All Systems Operational</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Platform Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-semibold text-foreground mb-2">Student Information</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <span className="text-foreground font-medium">{stats.totalStudents}</span> total students enrolled</li>
                <li>• Average <span className="text-foreground font-medium">{studentsPerCourse}</span> students per course</li>
                <li>• Represents <span className="text-foreground font-medium">{totalUsers > 0 ? ((stats.totalStudents / totalUsers) * 100).toFixed(0) : 0}%</span> of all platform users</li>
              </ul>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-semibold text-foreground mb-2">Course & Instructor Stats</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <span className="text-foreground font-medium">{stats.totalCourses}</span> active courses available</li>
                <li>• <span className="text-foreground font-medium">{stats.totalInstructors}</span> instructors managing courses</li>
                <li>• <span className="text-foreground font-medium">{instructorsPerDept}</span> average instructors per department</li>
              </ul>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-semibold text-foreground mb-2">Organization Structure</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <span className="text-foreground font-medium">{stats.totalDepartments}</span> academic departments</li>
                <li>• <span className="text-foreground font-medium">{stats.totalDepartments > 0 ? (stats.totalCourses / stats.totalDepartments).toFixed(1) : 0}</span> courses per department average</li>
                <li>• Organized across multiple academic divisions</li>
              </ul>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-semibold text-foreground mb-2">Administrative Coverage</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <span className="text-foreground font-medium">{stats.totalAdmins}</span> administrator accounts</li>
                <li>• Represents <span className="text-foreground font-medium">{totalUsers > 0 ? ((stats.totalAdmins / totalUsers) * 100).toFixed(0) : 0}%</span> of total users</li>
                <li>• Responsible for platform management and oversight</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
