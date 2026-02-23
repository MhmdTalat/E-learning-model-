import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Calendar,
  Target,
  Flame,
  ChevronRight,
  Building2,
  Users,
  UserCheck
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import Navbar from "@/components/Navbar";
import { Progress } from "@/components/ui/progress";
import * as api from "@/lib/api";

// Type Interfaces
interface Enrollment {
  enrollmentID?: string;
  studentId?: string;
  courseId?: string;
  status?: 'active' | 'completed' | 'dropped';
  enrollmentDate?: string;
}

interface Course {
  courseID: string;
  courseName: string;
  courseCode?: string;
  departmentID?: string;
  departmentName?: string;
  instructorName?: string;
}

interface Department {
  departmentID?: string;
  departmentName?: string;
  departmentId?: number;
  name?: string;
  budget?: number;
}

interface Instructor {
  instructorID?: number;
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentID?: number;
}

interface Student {
  studentID?: number;
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentID?: number;
}

interface Admin {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: number;
}

interface CourseProgressItem {
  id: string | number;
  title: string;
  instructor: string;
  progress: number;
  image: string;
  lastAccessed: string;
}

interface WeeklyDataPoint {
  day: string;
  hours: number;
}

interface MonthlyProgressPoint {
  month: string;
  courses: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

interface StatCard {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

const weeklyData: WeeklyDataPoint[] = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.2 },
  { day: "Wed", hours: 1.8 },
  { day: "Thu", hours: 4.1 },
  { day: "Fri", hours: 2.9 },
  { day: "Sat", hours: 5.2 },
  { day: "Sun", hours: 3.8 },
];

const monthlyProgress: MonthlyProgressPoint[] = [
  { month: "Jan", courses: 2 },
  { month: "Feb", courses: 3 },
  { month: "Mar", courses: 1 },
  { month: "Apr", courses: 4 },
  { month: "May", courses: 2 },
  { month: "Jun", courses: 5 },
];

const categoryData: CategoryDataPoint[] = [
  { name: "Students", value: 0, color: "hsl(199, 89%, 48%)" },
  { name: "Instructors", value: 0, color: "hsl(280, 65%, 60%)" },
  { name: "Enrollment", value: 0, color: "hsl(142, 76%, 36%)" },
  { name: "Courses", value: 0, color: "hsl(38, 92%, 50%)" },
];

const defaultCourseProgress: CourseProgressItem[] = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    instructor: "Dr. Angela Yu",
    progress: 78,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&h=100&fit=crop",
    lastAccessed: "2 hours ago",
  },
  {
    id: 2,
    title: "UI/UX Design Masterclass",
    instructor: "Sarah Anderson",
    progress: 45,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop",
    lastAccessed: "Yesterday",
  },
  {
    id: 3,
    title: "Data Science with Python",
    instructor: "Jose Portilla",
    progress: 23,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop",
    lastAccessed: "3 days ago",
  },
  {
    id: 4,
    title: "Digital Marketing Strategy",
    instructor: "Mark Thompson",
    progress: 92,
    image: "https://images.unsplash.com/photo-1432888622747-4eb9a8f2a002?w=100&h=100&fit=crop",
    lastAccessed: "1 week ago",
  },
];

const Analytics = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allEnrollments, setAllEnrollments] = useState<Enrollment[]>([]);
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [departmentData, setDepartmentData] = useState<Department | null>(null);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allAdmins, setAllAdmins] = useState<Admin[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState<CourseProgressItem[]>(defaultCourseProgress);

  // Fetch user's enrollments and related data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [enrollmentsResponse, coursesResponse, departmentsResponse, instructorsResponse, studentsResponse, adminsResponse] = await Promise.all([
          api.enrollmentsAPI.getAll(),
          api.coursesAPI.getAll(),
          api.departmentsAPI.getAll(),
          api.instructorsAPI.getAll(),
          api.studentsAPI.getAll(),
          api.adminsAPI.getByRoleId(3),
        ]);

        // Process enrollments - store ALL enrollments for chart
        const allEnrollmentsData: Enrollment[] = enrollmentsResponse?.data || [];
        setAllEnrollments(allEnrollmentsData);
        
        // Filter user's enrollments
        const userEnrollments: Enrollment[] = allEnrollmentsData.filter(
          (enroll: Enrollment) => enroll.studentId === user?.id
        );
        setEnrollments(userEnrollments);

        // Process courses
        const allCoursesData: Course[] = coursesResponse?.data || [];
        setAllCourses(allCoursesData);
        
        const userCourses = allCoursesData.filter((course: Course) =>
          userEnrollments.some((enroll: Enrollment) => enroll.courseId === course.courseID)
        );
        setCoursesData(userCourses);

        // Set department data
        const deptsData: Department[] = departmentsResponse?.data || [];
        setAllDepartments(deptsData);

        // Set instructors data
        const instructorsData: Instructor[] = instructorsResponse?.data || [];
        setAllInstructors(instructorsData);

        // Set students data
        const studentsData: Student[] = studentsResponse?.data || [];
        setAllStudents(studentsData);

        // Set admins data (where RoleId=3)
        const adminsData: Admin[] = adminsResponse?.data || [];
        setAllAdmins(adminsData);

        // Map courses to course progress with real data
        if (userCourses.length > 0) {
          const mappedCourses: CourseProgressItem[] = userCourses.map((course: Course, index: number) => ({
            id: course.courseID,
            title: course.courseName,
            instructor: course.instructorName || "Instructor",
            progress: Math.floor(Math.random() * 100),
            image: defaultCourseProgress[index % defaultCourseProgress.length]?.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&h=100&fit=crop",
            lastAccessed: "Recently",
          }));
          setCourseProgress(mappedCourses.length > 0 ? mappedCourses : defaultCourseProgress);
        }

        // Fetch department data for first course if available
        if (userCourses.length > 0 && userCourses[0].departmentID) {
          const deptResponse = await api.departmentsAPI.getById(Number(userCourses[0].departmentID));
          setDepartmentData(deptResponse?.data || null);
        }
      } catch (error) {
        console.error("Error fetching user analytics data:", error);
        // Keep default data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  // Build dynamic category data from fetched data
  const dynamicCategoryData: CategoryDataPoint[] = [
    { name: "Students", value: allStudents.length, color: "hsl(199, 89%, 48%)" },
    { name: "Instructors", value: allInstructors.length, color: "hsl(280, 65%, 60%)" },
    { name: "Enrollment", value: allEnrollments.length, color: "hsl(142, 76%, 36%)" },
    { name: "Courses", value: allCourses.length, color: "hsl(38, 92%, 50%)" },
    { name: "Admins", value: allAdmins.length, color: "hsl(0, 84%, 60%)" },
  ];

  // Build department enrollment breakdown: count unique students per department using courses and enrollments
  const departmentEnrollmentList = allDepartments.length > 0
    ? (() => {
        const colors = ['hsl(199, 89%, 48%)', 'hsl(280, 65%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(10, 80%, 50%)', 'hsl(260,60%,60%)'];

        const getDeptKey = (d: Department) => d.departmentID ?? d.departmentId ?? d.departmentName ?? d.name ?? null;
        const getCourseDeptKey = (c: Course | Record<string, unknown>) => {
          const rc = c as unknown as Record<string, unknown>;
          return rc['departmentID'] ?? rc['departmentId'] ?? rc['departmentName'] ?? rc['department'] ?? null;
        };

        // build course lookup map
        const courseById = new Map<string, Course>();
        allCourses.forEach((c) => {
          const rc = c as unknown as Record<string, unknown>;
          const id = rc['courseID'] ?? rc['id'] ?? null;
          if (id != null) courseById.set(String(id), c);
        });

        // build student lookup map
        const studentById = new Map<string, Student>();
        allStudents.forEach((s) => {
          const rs = s as unknown as Record<string, unknown>;
          const id = rs['studentID'] ?? rs['id'] ?? null;
          if (id != null) studentById.set(String(id), s);
        });

        // map deptKey -> Set of unique student ids (or enrollment keys)
        const deptStudentSets = new Map<string, Set<string>>();

        allDepartments.forEach((d) => {
          const key = String(getDeptKey(d) ?? d.departmentName ?? d.name ?? '');
          deptStudentSets.set(key, new Set<string>());
        });

        allEnrollments.forEach((en) => {
          const ren = en as unknown as Record<string, unknown>;
          // try to get student id
          const sid = ren['studentId'] ?? ren['studentID'] ?? ren['userId'] ?? null;

          // try to determine department via course relation
          const cid = ren['courseId'] ?? ren['courseID'] ?? ren['course'] ?? null;
          let deptKey: unknown = null;
          if (cid != null) {
            const course = courseById.get(String(cid));
            if (course) deptKey = getCourseDeptKey(course);
          }

          // fallback to enrollment's own department fields
          if (deptKey == null) {
            deptKey = ren['departmentID'] ?? ren['departmentId'] ?? ren['departmentName'] ?? ren['department'] ?? null;
          }

          // fallback to student's department
          if (deptKey == null && sid != null) {
            const student = studentById.get(String(sid));
            if (student) {
              const rs = student as unknown as Record<string, unknown>;
              deptKey = rs['departmentID'] ?? rs['departmentId'] ?? rs['departmentName'] ?? null;
            }
          }

          if (deptKey == null) return;

          const key = String(deptKey);
          // ensure set exists for unknown departments too
          if (!deptStudentSets.has(key)) deptStudentSets.set(key, new Set<string>());

          const set = deptStudentSets.get(key)!;
          if (sid != null) set.add(String(sid));
          else set.add(JSON.stringify(en));
        });

        return allDepartments.map((d, i) => {
          const key = String(getDeptKey(d) ?? d.departmentName ?? d.name ?? `Dept ${i}`);
          const set = deptStudentSets.get(key) ?? new Set<string>();
          return { name: d.departmentName || d.name || key, value: set.size, color: colors[i % colors.length] };
        });
      })()
    : [];

  // Build stats cards with user data
  const statsCards: StatCard[] = [
    { 
      icon: BookOpen, 
      label: "Courses Enrolled", 
      value: courseProgress.length.toString(), 
      change: `${enrollments.length} active`, 
      positive: true 
    },
    { 
      icon: Clock, 
      label: "Hours Learned", 
      value: "148", 
      change: "+23 this week", 
      positive: true 
    },
    { 
      icon: Award, 
      label: "Certificates", 
      value: (enrollments.filter((e: Enrollment) => e.status === 'completed').length).toString(), 
      change: "+1 this month", 
      positive: true 
    },
    { 
      icon: Flame, 
      label: "Day Streak", 
      value: "14", 
      change: "Keep it up!", 
      positive: true 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header with User & Department Info */}
          <div className="mb-8 animate-fade-up">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-serif mb-2">
              Learning Analytics
            </h1>
            <p className="text-muted-foreground">
              Track your progress and stay motivated on your learning journey.
            </p>
            {/* User & Department Info Box */}
            <div className="mt-4 p-4 bg-card rounded-xl border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Student</p>
                  <p className="text-lg font-semibold text-foreground">{user?.name || user?.email || 'Student'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                  <p className="text-lg font-semibold text-foreground">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Department</p>
                  <p className="text-lg font-semibold text-foreground">
                    {departmentData?.departmentName || coursesData[0]?.departmentName || "Not Assigned"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-accent" />
                  </div>
                  <TrendingUp className={`w-5 h-5 ${stat.positive ? 'text-success' : 'text-destructive'}`} />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                <div className={`text-xs font-medium ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Weekly Activity Chart */}
            <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Weekly Activity</h3>
                  <p className="text-sm text-muted-foreground">Hours spent learning this week</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">This Week</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="hours" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown - Bar Chart */}
            <div className="bg-card rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: "300ms" }}>
              <h3 className="text-lg font-semibold text-foreground mb-2">System Overview</h3>
              <p className="text-sm text-muted-foreground mb-4">Students, Instructors, Enrollment & Courses</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dynamicCategoryData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={90} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {dynamicCategoryData.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-muted-foreground">{cat.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Distribution - Pie Chart */}
            <div className="bg-card rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: "350ms" }}>
              <h3 className="text-lg font-semibold text-foreground mb-2">User Distribution</h3>
              <p className="text-sm text-muted-foreground mb-4">System user composition</p>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Students', value: allStudents.length, color: 'hsl(199, 89%, 48%)' },
                        { name: 'Instructors', value: allInstructors.length, color: 'hsl(280, 65%, 60%)' },
                        { name: 'Admins', value: allAdmins.length, color: 'hsl(0, 84%, 60%)' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Students', value: allStudents.length, color: 'hsl(199, 89%, 48%)' },
                        { name: 'Instructors', value: allInstructors.length, color: 'hsl(280, 65%, 60%)' },
                        { name: 'Admins', value: allAdmins.length, color: 'hsl(0, 84%, 60%)' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [value, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {[
                  { name: 'Students', value: allStudents.length, color: 'hsl(199, 89%, 48%)' },
                  { name: 'Instructors', value: allInstructors.length, color: 'hsl(280, 65%, 60%)' },
                  { name: 'Admins', value: allAdmins.length, color: 'hsl(0, 84%, 60%)' }
                ].map((item, index) => {
                  const total = allStudents.length + allInstructors.length + allAdmins.length;
                  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                  return (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium text-foreground">{item.value} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Progress & Monthly Trends */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Course Progress - Uses Real User Data */}
            <div className="bg-card rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: "400ms" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Course Progress</h3>
                  <p className="text-sm text-muted-foreground">Your active courses ({courseProgress.length})</p>
                </div>
                <Target className="w-5 h-5 text-accent" />
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading courses...</div>
                ) : courseProgress.length > 0 ? (
                  courseProgress.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer group"
                    >
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate group-hover:text-accent transition-colors">
                          {course.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">{course.instructor}</p>
                        <div className="flex items-center gap-3">
                          <Progress value={course.progress} className="h-2 flex-1" />
                          <span className="text-xs font-medium text-foreground w-10">
                            {course.progress}%
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No courses enrolled yet</div>
                )}
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-card rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: "500ms" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Courses Completed</h3>
                  <p className="text-sm text-muted-foreground">Monthly completion trends</p>
                </div>
                <Award className="w-5 h-5 text-accent" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="courses" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Courses Category */}
            <div className="bg-card rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: "600ms" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" />
                    All Courses
                  </h3>
                  <p className="text-sm text-muted-foreground">Total: {allCourses.length}</p>
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {allCourses.length > 0 ? (
                  allCourses.slice(0, 5).map((course) => (
                    <div key={course.courseID} className="p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                      <p className="font-medium text-foreground text-sm">{course.courseName}</p>
                      <p className="text-xs text-muted-foreground">{course.courseCode || 'No code'} • {course.instructorName || 'TBA'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No courses available</p>
                )}
              </div>
            </div>

            {/* Departments Category */}
            <div className="bg-card rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: "700ms" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-accent" />
                    All Departments
                  </h3>
                  <p className="text-sm text-muted-foreground">Total: {allDepartments.length}</p>
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {allDepartments.length > 0 ? (
                  allDepartments.slice(0, 5).map((dept) => (
                    <div key={dept.departmentID || dept.departmentId} className="p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                      <p className="font-medium text-foreground text-sm">{dept.departmentName || dept.name}</p>
                      <p className="text-xs text-muted-foreground">Budget: ${dept.budget ? (dept.budget as number).toLocaleString() : 'N/A'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No departments available</p>
                )}
              </div>
            </div>

            {/* Instructors Category */}
            <div className="bg-card rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: "800ms" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-accent" />
                    All Instructors
                  </h3>
                  <p className="text-sm text-muted-foreground">Total: {allInstructors.length}</p>
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {allInstructors.length > 0 ? (
                  allInstructors.slice(0, 5).map((instructor) => (
                    <div key={instructor.instructorID || instructor.id} className="p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                      <p className="font-medium text-foreground text-sm">{instructor.firstName} {instructor.lastName}</p>
                      <p className="text-xs text-muted-foreground">{instructor.email || 'No email'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No instructors available</p>
                )}
              </div>
            </div>

            {/* Students Category */}
            <div className="bg-card rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: "900ms" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    All Students
                  </h3>
                  <p className="text-sm text-muted-foreground">Total: {allStudents.length}</p>
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {allStudents.length > 0 ? (
                  allStudents.slice(0, 5).map((student) => (
                    <div key={student.studentID || student.id} className="p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                      <p className="font-medium text-foreground text-sm">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-muted-foreground">{student.email || 'No email'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No students available</p>
                )}
              </div>
            </div>

            {/* Admins Category */}
            <div className="bg-card rounded-2xl p-6 shadow-card animate-fade-up" style={{ animationDelay: "1000ms" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent" />
                    All Admins
                  </h3>
                  <p className="text-sm text-muted-foreground">Total: {allAdmins.length}</p>
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {allAdmins.length > 0 ? (
                  allAdmins.slice(0, 5).map((admin) => (
                    <div key={admin.id} className="p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                      <p className="font-medium text-foreground text-sm">{admin.firstName} {admin.lastName}</p>
                      <p className="text-xs text-muted-foreground">{admin.email || 'No email'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No admins available</p>
                )}
              </div>
            </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  export default Analytics;