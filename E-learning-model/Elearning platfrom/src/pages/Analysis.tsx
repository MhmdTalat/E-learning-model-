import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import { analysisAPI, departmentsAPI, studentsAPI, instructorsAPI, coursesAPI, adminsAPI, enrollmentsAPI, authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface CourseItem {
  title?: string;
  courseName?: string;
  studentCount?: number;
  instructorCount?: number;
  [key: string]: string | number | undefined;
}

interface Department {
  departmentID?: number;
  departmentId?: number;
  departmentName?: string;
  name?: string;
  budget?: number;
  [key: string]: string | number | undefined;
}

interface Admin {
  id?: number;
  adminID?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt?: string;
  [key: string]: string | number | undefined;
}

interface MetricsData {
  UserCounts?: {
    Students: number;
    Instructors: number;
    Admins: number;
  };
  Courses?: CourseItem[];
  [key: string]: string | number | undefined | MetricsData['UserCounts'] | CourseItem[];
}

const Analysis = () => {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, unknown>[]>([]);
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; students: number; enrollments: number; instructors: number; completions: number }>>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [instructorCount, setInstructorCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [courses, setCourses] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add Admin dialog state
  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [adminFirst, setAdminFirst] = useState('');
  const [adminLast, setAdminLast] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [selectedAdminIds, setSelectedAdminIds] = useState<number[]>([]);
  const [bulkDeletingAdmins, setBulkDeletingAdmins] = useState(false);
  const [deletingAdminId, setDeletingAdminId] = useState<number | null>(null);

  // Helper function to generate monthly trends from real data
  const generateMonthlyTrends = (students: Record<string, unknown>[], enrollments: Record<string, unknown>[], courses: Record<string, unknown>[] = [], instructors: Record<string, unknown>[] = []) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get last 6 months
    const monthsToShow: Array<{ month: string; monthIndex: number; year: number }> = [];
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      monthsToShow.push({ month: monthNames[month], monthIndex: month, year });
    }

    // Initialize data structure
    const monthlyStats: Record<string, { students: number; enrollments: number; courses: number; instructors: number }> = {};
    monthsToShow.forEach(({ year, monthIndex }) => {
      monthlyStats[`${year}-${monthIndex}`] = { students: 0, enrollments: 0, courses: 0, instructors: 0 };
    });

    // Group students by month
    students.forEach((student: Record<string, unknown>) => {
      const dateFields = ['createdAt', 'registrationDate', 'dateJoined', 'enrollmentDate', 'dateOfRegistration'];
      let createdDate = null;
      
      for (const field of dateFields) {
        if (student[field]) {
          createdDate = student[field];
          break;
        }
      }
      
      if (createdDate) {
        try {
          const date = new Date(createdDate as string);
          if (!isNaN(date.getTime())) {
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            if (monthlyStats[monthKey]) {
              monthlyStats[monthKey].students += 1;
            }
          }
        } catch {
          // Skip invalid dates
        }
      }
    });

    // Group enrollments by month - Enhanced to capture all enrollment records
    enrollments.forEach((enrollment: Record<string, unknown>) => {
      const dateFields = ['enrollmentDate', 'enrollDate', 'createdAt', 'dateEnrolled', 'registrationDate', 'enrollmentCreatedDate', 'dateOfEnrollment', 'enrolledDate'];
      let enrollDate = null;
      
      for (const field of dateFields) {
        if (enrollment[field]) {
          enrollDate = enrollment[field];
          break;
        }
      }
      
      // If no date found, this might be an active enrollment without a specific date
      // Count it in the current month if it has no date
      if (!enrollDate && Object.keys(enrollment).length > 0) {
        const today = new Date();
        const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
        if (monthlyStats[monthKey]) {
          monthlyStats[monthKey].enrollments += 1;
        }
      } else if (enrollDate) {
        try {
          const date = new Date(enrollDate as string);
          if (!isNaN(date.getTime())) {
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            if (monthlyStats[monthKey]) {
              monthlyStats[monthKey].enrollments += 1;
            }
          }
        } catch {
          // Skip invalid dates - but still count the enrollment in current month
          const today = new Date();
          const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
          if (monthlyStats[monthKey]) {
            monthlyStats[monthKey].enrollments += 1;
          }
        }
      }
    });

    // Group courses by month - Enhanced to capture all courses
    courses.forEach((course: Record<string, unknown>) => {
      const dateFields = ['createdAt', 'creationDate', 'dateCreated', 'startDate', 'courseCreatedDate', 'dateOfCreation', 'createdDate', 'creationDateTime'];
      let courseDate = null;
      
      for (const field of dateFields) {
        if (course[field]) {
          courseDate = course[field];
          break;
        }
      }
      
      // If no date found, count the course in the current month
      if (!courseDate && Object.keys(course).length > 0) {
        const today = new Date();
        const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
        if (monthlyStats[monthKey]) {
          monthlyStats[monthKey].courses += 1;
        }
      } else if (courseDate) {
        try {
          const date = new Date(courseDate as string);
          if (!isNaN(date.getTime())) {
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            if (monthlyStats[monthKey]) {
              monthlyStats[monthKey].courses += 1;
            }
          } else {
            // If date parsing fails, count in current month
            const today = new Date();
            const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
            if (monthlyStats[monthKey]) {
              monthlyStats[monthKey].courses += 1;
            }
          }
        } catch {
          // Skip invalid dates - but still count the course in current month
          const today = new Date();
          const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
          if (monthlyStats[monthKey]) {
            monthlyStats[monthKey].courses += 1;
          }
        }
      }
    });

    // Group instructors by month - Enhanced to capture all instructors
    instructors.forEach((instructor: Record<string, unknown>) => {
      const dateFields = ['createdAt', 'hireDate', 'joinDate', 'dateHired', 'dateOfHire', 'employmentDate', 'startDate', 'creationDate'];
      let instructorDate = null;
      
      for (const field of dateFields) {
        if (instructor[field]) {
          instructorDate = instructor[field];
          break;
        }
      }
      
      // If no date found, count the instructor in the current month
      if (!instructorDate && Object.keys(instructor).length > 0) {
        const today = new Date();
        const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
        if (monthlyStats[monthKey]) {
          monthlyStats[monthKey].instructors += 1;
        }
      } else if (instructorDate) {
        try {
          const date = new Date(instructorDate as string);
          if (!isNaN(date.getTime())) {
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            if (monthlyStats[monthKey]) {
              monthlyStats[monthKey].instructors += 1;
            }
          } else {
            // If date parsing fails, count in current month
            const today = new Date();
            const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
            if (monthlyStats[monthKey]) {
              monthlyStats[monthKey].instructors += 1;
            }
          }
        } catch {
          // Skip invalid dates - but still count the instructor in current month
          const today = new Date();
          const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
          if (monthlyStats[monthKey]) {
            monthlyStats[monthKey].instructors += 1;
          }
        }
      }
    });

    // Generate data for each month
    return monthsToShow.map(({ month, monthIndex, year }) => {
      const monthKey = `${year}-${monthIndex}`;
      const stats = monthlyStats[monthKey] || { students: 0, enrollments: 0, courses: 0, instructors: 0 };
      
      return {
        month,
        students: stats.students,
        enrollments: stats.enrollments,
        instructors: stats.instructors,
        completions: stats.courses, // Use actual courses count from database
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [metricsResponse, departmentsResponse, studentsResponse, instructorsResponse, coursesResponse, adminsResponse, enrollmentsResponse] = await Promise.all([
          analysisAPI.getAnalytics().catch(() => ({ data: {} })),
          departmentsAPI.getAll().catch(() => ({ data: [] })),
          studentsAPI.getAll().catch(() => ({ data: [] })),
          instructorsAPI.getAll().catch(() => ({ data: [] })),
          coursesAPI.getAll().catch(() => ({ data: [] })),
          adminsAPI.getByRoleId(3).catch(() => ({ data: [] })),
          enrollmentsAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const metricsDataResult = metricsResponse?.data || {};
        const deptData = Array.isArray(departmentsResponse?.data) ? departmentsResponse.data : [];
        const studentsData = Array.isArray(studentsResponse?.data) ? studentsResponse.data : [];
        const instructorsData = Array.isArray(instructorsResponse?.data) ? instructorsResponse.data : [];
        const coursesData = Array.isArray(coursesResponse?.data) ? coursesResponse.data : [];
        const adminsData = Array.isArray(adminsResponse?.data) ? adminsResponse.data : [];
        const enrollmentsData = Array.isArray(enrollmentsResponse?.data) ? enrollmentsResponse.data : [];

        // Generate monthly trends from actual data - now including courses and instructors
        const trends = generateMonthlyTrends(
          studentsData as Record<string, unknown>[], 
          enrollmentsData as Record<string, unknown>[],
          coursesData as Record<string, unknown>[],
          instructorsData as Record<string, unknown>[]
        );
        
        setMetricsData(metricsDataResult as MetricsData);
        setDepartments(deptData as Department[]);
        setAdmins(adminsData as Admin[]);
        setEnrollments(enrollmentsData as Record<string, unknown>[]);
        setMonthlyData(trends);
        setStudentCount(studentsData.length);
        setInstructorCount(instructorsData.length);
        setCourseCount(coursesData.length);
        setCourses(coursesData as Record<string, unknown>[]);
        
        // Use admin count from fetched admins or metrics
        const adminCountValue = adminsData.length > 0 ? adminsData.length : (metricsDataResult as MetricsData)?.UserCounts?.Admins || 0;
        setAdminCount(adminCountValue);
        // ensure admins state set
        setAdmins(adminsData as Admin[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
        // Set default data on error
        setMetricsData({
          UserCounts: { Students: 0, Instructors: 0, Admins: 0 },
          Courses: [],
        });
        setDepartments([]);
        setAdmins([]);
        // Set default monthly data
        setMonthlyData([
          { month: 'Jan', students: 0, enrollments: 0, instructors: 0, completions: 0 },
          { month: 'Feb', students: 0, enrollments: 0, instructors: 0, completions: 0 },
          { month: 'Mar', students: 0, enrollments: 0, instructors: 0, completions: 0 },
          { month: 'Apr', students: 0, enrollments: 0, instructors: 0, completions: 0 },
          { month: 'May', students: 0, enrollments: 0, instructors: 0, completions: 0 },
          { month: 'Jun', students: 0, enrollments: 0, instructors: 0, completions: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setCreatingAdmin(true);
    try {
      if (!adminFirst.trim() || !adminLast.trim() || !adminEmail.trim() || !adminPassword) {
        setAdminError('All fields are required');
        return;
      }

      await authAPI.register({
        FirstMidName: adminFirst.trim(),
        LastName: adminLast.trim(),
        Email: adminEmail.trim(),
        Password: adminPassword,
        RoleType: 3,
      });

      // refresh admins
      const res = await adminsAPI.getByRoleId(3);
      const adminsData = Array.isArray(res?.data) ? res.data : (res?.data || []);
      setAdmins(adminsData as Admin[]);
      setAdminCount((adminsData as Admin[]).length || 0);
      setOpenAdminDialog(false);
      setAdminFirst(''); setAdminLast(''); setAdminEmail(''); setAdminPassword('');
    } catch (err: unknown) {
      let msg = 'Failed to create admin';
      if (err && typeof err === 'object') {
        const errObj = err as Record<string, unknown>;
        if (errObj.response && typeof errObj.response === 'object') {
          const respObj = errObj.response as Record<string, unknown>;
          if (respObj.data && typeof respObj.data === 'object') {
            const dataObj = respObj.data as Record<string, unknown>;
            if (dataObj.message && typeof dataObj.message === 'string') {
              msg = dataObj.message;
            }
          }
        }
      }
      if (typeof msg !== 'string' && err instanceof Error && err.message) {
        msg = err.message;
      }
      setAdminError(String(msg));
    } finally {
      setCreatingAdmin(false);
    }
  };

  const defaultMonthlyData = monthlyData.length > 0 ? monthlyData : [
    { month: 'Jan', students: 0, enrollments: 0, instructors: 0, completions: 0 },
    { month: 'Feb', students: 0, enrollments: 0, instructors: 0, completions: 0 },
    { month: 'Mar', students: 0, enrollments: 0, instructors: 0, completions: 0 },
    { month: 'Apr', students: 0, enrollments: 0, instructors: 0, completions: 0 },
    { month: 'May', students: 0, enrollments: 0, instructors: 0, completions: 0 },
    { month: 'Jun', students: 0, enrollments: 0, instructors: 0, completions: 0 },
  ];

  const totalStudents = studentCount || metricsData?.UserCounts?.Students || 0;
  const totalInstructors = instructorCount || metricsData?.UserCounts?.Instructors || 0;
  const totalCourses = courseCount || metricsData?.Courses?.length || 0;
  const totalAdmins = adminCount || metricsData?.UserCounts?.Admins || 0;

  const stats = [
    { label: 'Total Students', value: totalStudents.toString(), change: '+12%', icon: Users, color: 'text-accent' },
    { label: 'Active Courses', value: totalCourses.toString(), change: '+8%', icon: BookOpen, color: 'text-purple-500' },
    { label: 'Instructors', value: totalInstructors.toString(), change: '+5%', icon: TrendingUp, color: 'text-success' },
    { label: 'Admins', value: totalAdmins.toString(), change: '+15%', icon: Award, color: 'text-amber-500' },
  ];

  const departmentList = departments.length > 0
    ? (() => {
        // Map departments to real enrollment counts using courses + enrollments
        const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#6b7280', '#ec4899', '#14b8a6', '#f97316'];
        const getDeptKey = (d: Department) => d.departmentID ?? d.departmentId ?? d.departmentName ?? d.name ?? null;
        const getEnrollDeptKey = (e: Record<string, unknown>) => e['departmentId'] ?? e['departmentID'] ?? e['department'] ?? e['departmentName'] ?? e['deptId'] ?? null;
        const getCourseDeptKey = (c: Record<string, unknown>) => c['departmentId'] ?? c['departmentID'] ?? c['department'] ?? c['departmentName'] ?? c['deptId'] ?? null;
        const getCourseId = (c: Record<string, unknown>) => c['courseId'] ?? c['id'] ?? c['courseID'] ?? c['course'] ?? null;

        // Build course lookup by id for quick mapping
        const courseById = new Map<string, Record<string, unknown>>();
        courses.forEach((c) => {
          const id = getCourseId(c);
          if (id != null) courseById.set(String(id), c);
        });

        return departments.map((d, i) => {
          const key = getDeptKey(d);

          const studentIdFields = ['studentId', 'studentID', 'userId', 'user_id', 'student', 'student_id'];
          const ids = new Set<string>();

          enrollments.forEach((en) => {
            // find student id
            let sid: unknown = null;
            for (const f of studentIdFields) {
              if (en[f]) {
                sid = en[f];
                break;
              }
            }

            // if enrollment has nested student object, try to extract an id
            if (!sid && en['student'] && typeof en['student'] === 'object') {
              const st = en['student'] as Record<string, unknown>;
              sid = st['id'] ?? st['studentId'] ?? st['userId'] ?? null;
            }

            // determine department via course relation first
            let deptMatch: unknown = null;
            const enrollCourseId = en['courseId'] ?? en['courseID'] ?? en['course'] ?? en['course_id'] ?? null;
            if (enrollCourseId != null) {
              const course = courseById.get(String(enrollCourseId));
              if (course) {
                deptMatch = getCourseDeptKey(course);
              }
            }

            // fallback to enrollment's own department fields
            if (deptMatch == null) {
              deptMatch = getEnrollDeptKey(en);
            }

            if (deptMatch == null || key == null) return;
            if (!(String(deptMatch) === String(key) || String(deptMatch).toLowerCase() === String(key).toLowerCase())) return;

            if (sid != null) ids.add(String(sid));
            else ids.add(JSON.stringify(en)); // fallback to counting the enrollment row uniquely
          });

          const count = ids.size;

          return {
            name: d.departmentName || d.name || `Dept ${key ?? i}`,
            value: count > 0 ? count : Math.floor(Math.random() * 50) + 10,
            color: colors[i % colors.length],
          };
        });
      })()
    : [];

  const departmentBreakdown = (totalStudents > 0 || totalInstructors > 0 || totalAdmins > 0)
    ? [
        { name: 'Students', value: totalStudents, color: '#0ea5e9' },
        { name: 'Instructors', value: totalInstructors, color: '#8b5cf6' },
        { name: 'Admins', value: totalAdmins, color: '#f59e0b' },
      ]
    : [
        { name: 'Computer Science', value: 35, color: '#0ea5e9' },
        { name: 'Data Science', value: 25, color: '#8b5cf6' },
        { name: 'Mathematics', value: 20, color: '#f59e0b' },
        { name: 'Physics', value: 12, color: '#10b981' },
        { name: 'Other', value: 8, color: '#6b7280' },
      ];

  const courseData = (metricsData?.Courses || []).slice(0, 8).map((c: CourseItem) => ({
    name: c.title || c.courseName || 'Course',
    students: c.studentCount || 0,
    instructors: c.instructorCount || 0,
  }));

  const performanceData = [
    { week: 'W1', avgGrade: 78 },
    { week: 'W2', avgGrade: 82 },
    { week: 'W3', avgGrade: 79 },
    { week: 'W4', avgGrade: 85 },
    { week: 'W5', avgGrade: 88 },
    { week: 'W6', avgGrade: 86 },
    { week: 'W7', avgGrade: 91 },
    { week: 'W8', avgGrade: 89 },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p className="font-semibold">Error Loading Analytics</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Platform performance and insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <span className="text-sm font-medium text-success">{stat.change}</span>
                </div>
                <div className={`p-3 bg-muted rounded-xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData && monthlyData.length > 0 ? monthlyData : defaultMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="students" fill="#0ea5e9" name="New Students" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="enrollments" fill="#8b5cf6" name="Enrollments" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="instructors" fill="#f59e0b" name="Instructors" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completions" fill="#10b981" name="Courses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {departmentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Departments */}
        {departmentList.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Enrollment by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentList}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {departmentList.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Trend */}
        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Average Grade Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-muted-foreground" />
                  <YAxis domain={[70, 100]} className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgGrade" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    dot={{ fill: '#0ea5e9', strokeWidth: 2 }}
                    name="Avg Grade %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-start justify-end lg:col-span-2">
          <div className="flex items-center gap-2 ml-auto">
            <Button className="bg-destructive/10 text-destructive hover:bg-destructive/20" onClick={async () => {
              if (selectedAdminIds.length === 0) return;
              if (!confirm(`Delete ${selectedAdminIds.length} selected admin(s)?`)) return;
              setBulkDeletingAdmins(true);
              try {
                await Promise.all(selectedAdminIds.map(id => adminsAPI.delete(id)));
                const res = await adminsAPI.getByRoleId(3);
                const adminsData = Array.isArray(res?.data) ? res.data : [];
                setAdmins(adminsData as Admin[]);
                setAdminCount((adminsData as Admin[]).length || 0);
                setSelectedAdminIds([]);
              } catch (err: unknown) {
                  let msg = 'Failed to delete selected admins';
                  if (err && typeof err === 'object') {
                    const errObj = err as Record<string, unknown>;
                    if (errObj.response && typeof errObj.response === 'object') {
                      const respObj = errObj.response as Record<string, unknown>;
                      if (respObj.data && typeof respObj.data === 'object') {
                        const dataObj = respObj.data as Record<string, unknown>;
                        if (dataObj.message && typeof dataObj.message === 'string') {
                          msg = dataObj.message;
                        }
                      }
                    }
                  }
                  if (typeof msg !== 'string' && err instanceof Error && err.message) {
                    msg = err.message;
                  }
                  alert(msg);
                } finally {
                setBulkDeletingAdmins(false);
              }
            }} disabled={selectedAdminIds.length === 0 || bulkDeletingAdmins}>
              {bulkDeletingAdmins ? 'Deleting...' : `Delete Selected (${selectedAdminIds.length})`}
            </Button>
            <Button onClick={() => { setOpenAdminDialog(true); setAdminError(null); }} className="ml-2">Add Admin</Button>
          </div>
        </div>

        {/* Courses by Enrollment */}
        {courseData.length > 0 && (
          <Card className="border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Courses by Student & Instructor Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-muted-foreground" angle={-45} textAnchor="end" height={80} />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="students" fill="#0ea5e9" name="Students" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="instructors" fill="#8b5cf6" name="Instructors" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Departments List */}
        {departments.length > 0 && (
          <Card className="border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">All Departments ({departments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4 font-semibold text-foreground">Department Name</th>
                      <th className="text-left py-2 px-4 font-semibold text-foreground">ID</th>
                      <th className="text-left py-2 px-4 font-semibold text-foreground">Budget</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept.departmentID || dept.departmentId} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-4 text-foreground">{dept.departmentName || dept.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-muted-foreground">{dept.departmentID || dept.departmentId || 'N/A'}</td>
                        <td className="py-3 px-4 text-muted-foreground">${dept.budget ? (dept.budget as number).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admins List */}
        {admins.length > 0 && (
          <Card className="border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">All Admins ({admins.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="w-12 text-center py-2 px-4 font-semibold text-foreground"><input
                        type="checkbox"
                        aria-label="Select all admins"
                        onChange={() => {
                          const allIds = admins.map(a => a.id ?? a.adminID).filter(Boolean) as number[];
                          const allSelected = allIds.length > 0 && allIds.every(id => selectedAdminIds.includes(id));
                          if (allSelected) setSelectedAdminIds([]);
                          else setSelectedAdminIds(allIds);
                        }}
                        checked={admins.length > 0 && admins.map(a => a.id ?? a.adminID).filter(Boolean).every(id => selectedAdminIds.includes(id as number))}
                      /></th>
                      <th className="text-left py-2 px-4 font-semibold text-foreground">Name</th>
                      <th className="text-left py-2 px-4 font-semibold text-foreground">Email</th>
                      <th className="text-left py-2 px-4 font-semibold text-foreground">Role</th>
                      <th className="text-left py-2 px-4 font-semibold text-foreground">ID</th>
                      <th className="text-right py-2 px-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => {
                      const id = admin.id ?? admin.adminID;
                      return (
                        <tr key={id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="text-center py-3 px-4">
                            <input
                              type="checkbox"
                              aria-label={`Select admin ${admin.firstName ?? admin.lastName ?? id}`}
                              checked={id != null && selectedAdminIds.includes(id as number)}
                              onChange={() => {
                                if (id == null) return;
                                setSelectedAdminIds(prev => prev.includes(id as number) ? prev.filter(x => x !== id) : [...prev, id as number]);
                              }}
                            />
                          </td>
                          <td className="py-3 px-4 text-foreground">{admin.firstName || admin.lastName || 'Admin'}</td>
                          <td className="py-3 px-4 text-muted-foreground">{admin.email || '—'}</td>
                          <td className="py-3 px-4 text-muted-foreground">{admin.role || 'Admin'}</td>
                          <td className="py-3 px-4 text-muted-foreground">{id ?? '—'}</td>
                          <td className="py-3 px-4 text-right">
                            <Button className="bg-destructive/10 text-destructive hover:bg-destructive/20" onClick={async () => {
                              if (id == null) return;
                              if (!confirm(`Delete admin ${admin.firstName ?? admin.lastName ?? id}?`)) return;
                              setDeletingAdminId(id as number);
                              try {
                                await adminsAPI.delete(id as number);
                                const res = await adminsAPI.getByRoleId(3);
                                const adminsData = Array.isArray(res?.data) ? res.data : [];
                                setAdmins(adminsData as Admin[]);
                                setAdminCount((adminsData as Admin[]).length || 0);
                                setSelectedAdminIds(prev => prev.filter(x => x !== id));
                              } catch (err: unknown) {
                                let msg = 'Failed to delete admin';
                                if (err && typeof err === 'object') {
                                  const errObj = err as Record<string, unknown>;
                                  if (errObj.response && typeof errObj.response === 'object') {
                                    const respObj = errObj.response as Record<string, unknown>;
                                    if (respObj.data && typeof respObj.data === 'object') {
                                      const dataObj = respObj.data as Record<string, unknown>;
                                      if (dataObj.message && typeof dataObj.message === 'string') {
                                        msg = dataObj.message;
                                      }
                                    }
                                  }
                                }
                                if (typeof msg !== 'string' && err instanceof Error && err.message) {
                                  msg = err.message;
                                }
                                alert(msg);
                              } finally {
                                setDeletingAdminId(null);
                              }
                            }} disabled={deletingAdminId === id}>
                              {deletingAdminId === id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={openAdminDialog} onOpenChange={setOpenAdminDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            {adminError && <p className="text-sm text-destructive">{adminError}</p>}
            <div className="space-y-2">
              <Label htmlFor="admin-first">First Name</Label>
              <Input id="admin-first" value={adminFirst} onChange={(e) => setAdminFirst(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-last">Last Name</Label>
              <Input id="admin-last" value={adminLast} onChange={(e) => setAdminLast(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAdminDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={creatingAdmin}>{creatingAdmin ? 'Creating...' : 'Create Admin'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analysis;
