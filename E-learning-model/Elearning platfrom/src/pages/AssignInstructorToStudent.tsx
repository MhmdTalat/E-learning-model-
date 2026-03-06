import { useState, useEffect } from 'react';
import { BookOpen, Users, UserCheck, Search, Plus, X, Check, AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { coursesAPI, instructorsAPI, enrollmentsAPI } from '@/lib/api';
import { 
  getInstructorCourses, 
  assignInstructorToStudent, 
  getAdvisedStudents,
  getInstructors
} from '@/api/instructors';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { getAuthErrorMessage, canAccessAdminFeatures } from '@/lib/authMessages';
import AuthAlert from '@/components/AuthAlert';

// we maintain our own local course shape, with extra fallbacks
interface Course {
  courseID?: number | string;
  name?: string;
  title?: string; // comes from backend model
  courseName?: string;
  code?: string;
  courseCode?: string;
  description?: string;
}

// raw data returned by various APIs may include unknown fields like `title` or `name`
interface RawCourse {
  courseID?: number | string;
  courseName?: string;
  title?: string;
  name?: string;
  code?: string;
  courseCode?: string;
  description?: string;
  [key: string]: unknown;
}

interface Student {
  id?: string;
  studentID?: number | string;
  firstName?: string;
  firstMidName?: string;
  lastName?: string;
  email?: string;
  enrollmentDate?: string;
  applicationUserID?: string;
  roleType?: number;
}

interface Instructor {
  id?: number;
  instructorID?: number | string;
  firstName?: string;
  firstMidName?: string;
  lastName?: string;
  email?: string;
  departmentId?: number;
  departmentID?: number;
}

interface Enrollment {
  id?: number;
  enrollmentID?: number;
  enrollmentId?: number;
  studentID?: number;
  studentId?: number;
  courseID?: number;
  courseId?: number;
  courseName?: string;
  instructorID?: number | null;
  instructorId?: number | null;
  grade?: string | number | null;
  enrollmentDate?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface StudentAssignment {
  studentID: number;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentDate: string;
  currentInstructor?: string;
  currentInstructorId?: number | null;
  enrollmentId?: number;
}

type InterfaceView = 'enrollment-based' | 'course-based';

const AssignInstructorToStudent = () => {
  // Auth
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const adminAccess = canAccessAdminFeatures(user);

  // View selection
  const [view, setView] = useState<InterfaceView>('enrollment-based');

  // Enrollment-based state
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseStudents, setCourseStudents] = useState<StudentAssignment[]>([]);
  const [assignedCounts, setAssignedCounts] = useState<{ [key: number]: number }>({});

  // Course-based state
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<Map<string, Course[]>>(new Map());
  const [advisedStudents, setAdvisedStudents] = useState<Map<string, Set<string>>>(new Map());
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedCourseForInstructor, setSelectedCourseForInstructor] = useState<Course | null>(null);
  const [expandedInstructors, setExpandedInstructors] = useState<Set<string>>(new Set());
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [courseStudentSearchTerm, setCourseStudentSearchTerm] = useState('');

  // Common state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentAssignment | null>(null);
  const [selectedInstructorDropdown, setSelectedInstructorDropdown] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [filterAssigned, setFilterAssigned] = useState<'all' | 'assigned' | 'unassigned'>('all');

  // Course-based assignment
  const [assignmentStudentIds, setAssignmentStudentIds] = useState<Set<string>>(new Set());
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch courses
        const coursesRes = await coursesAPI.getAll();
        const rawCourses = Array.isArray(coursesRes?.data) ? coursesRes.data as RawCourse[] : [];
        // normalize to ensure courseName exists (backend uses Title)
        const coursesList = rawCourses.map((c: RawCourse) => ({
          ...c,
          courseName: c.courseName || c.title || c.name,
        } as Course));
        setCourses(coursesList);

        // Fetch instructors
        const instructorsRes = await instructorsAPI.getAll();
        const instructorsList = Array.isArray(instructorsRes?.data) ? instructorsRes.data : [];
        setInstructors(instructorsList);
        setAllInstructors(instructorsList);

        // Fetch students
        const studentsRes = await fetch(`${import.meta.env.VITE_API_BASE ?? 'http://localhost:52103'}/api/students`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const studentsList = studentsRes.ok ? await studentsRes.json() : [];
        const loadedStudents: Student[] = Array.isArray(studentsList?.data)
          ? studentsList.data
          : studentsList || [];
        console.log('loaded students', loadedStudents.length, loadedStudents);
        setAllStudents(loadedStudents);

        // Fetch enrollments
        const enrollmentsRes = await enrollmentsAPI.getAll();
        const enrollmentsList = Array.isArray(enrollmentsRes?.data) ? enrollmentsRes.data : [];
        setEnrollments(enrollmentsList);

        // Load courses and advised students for each instructor (for course-based view)
        const coursesMap = new Map<string, Course[]>();
        const advisedMap = new Map<string, Set<string>>();

        for (const instructor of instructorsList || []) {
          const instructorId = String(instructor.instructorID || instructor.id || '');
          if (instructorId) {
            try {
              // API type returns Course but backend may include extra properties like title/name
              const courses = (await getInstructorCourses(instructorId)) as RawCourse[];
              const normalizedCourses = (courses || []).map((c: RawCourse) => ({
                ...c,
                courseID: typeof c.courseID === 'string' ? Number(c.courseID) : c.courseID,
                // API returns `Title` property for course name - copy into our expected field
                courseName: c.courseName || c.title || c.name,
              } as Course));
              coursesMap.set(instructorId, normalizedCourses);

              const advised = await getAdvisedStudents(instructorId);
              const advisedIds = new Set(
                (advised || []).map((s: Student) => String(s.id || s.studentID || ''))
              );
              console.log('advised students for', instructorId, advisedIds);
              advisedMap.set(instructorId, advisedIds);
            } catch (err) {
              console.error(`Failed to load courses for instructor ${instructorId}:`, err);
            }
          }
        }

        setInstructorCourses(coursesMap);
        setAdvisedStudents(advisedMap);
      } catch (err) {
        const errorMessage = getAuthErrorMessage(err, user, {
          action: 'fetch course and instructor data',
          resource: 'courses and instructors',
          requiredRole: 'Admin',
        });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  // Handle course selection for enrollment-based view
  useEffect(() => {
    if (!selectedCourseId) {
      setCourseStudents([]);
      setSelectedCourse(null);
      return;
    }

    const course = courses.find((c) => c.courseID === selectedCourseId);
    if (!course) return;

    setSelectedCourse(course);

    // Get students enrolled in this course
    const courseEnrollments = enrollments.filter(
      (e) => (e.courseID ?? e.courseId) === selectedCourseId
    );

    const students: StudentAssignment[] = courseEnrollments
      .map((enrollment) => {
        const studentId = enrollment.studentID ?? enrollment.studentId;
        const otherEnrollments = enrollments.filter(
          (e) => (e.studentID ?? e.studentId) === studentId
        );
        const studentEnrollment = otherEnrollments[0];
        const instructor = instructors.find(
          (i) => (i.instructorID ?? i.id) === (enrollment.instructorID ?? enrollment.instructorId)
        );

        return {
          studentID: studentId || 0,
          firstName: studentEnrollment?.firstName ?? 'Unknown',
          lastName: studentEnrollment?.lastName ?? 'Unknown',
          email: studentEnrollment?.email ?? 'Unknown',
          enrollmentDate: enrollment.enrollmentDate || '',
          currentInstructor: instructor
            ? `${instructor.firstMidName ?? instructor.firstName} ${instructor.lastName}`
            : undefined,
          currentInstructorId: enrollment.instructorID ?? enrollment.instructorId,
          enrollmentId: enrollment.enrollmentID ?? enrollment.id,
        };
      })
      .filter((s) => s.studentID > 0);

    const uniqueStudents = Array.from(
      new Map(students.map((s) => [s.studentID, s])).values()
    );

    setCourseStudents(uniqueStudents);

    const counts = courseEnrollments.reduce(
      (acc, e) => {
        const instId = e.instructorID ?? e.instructorId;
        if (instId) {
          acc[instId] = (acc[instId] || 0) + 1;
        }
        return acc;
      },
      {} as { [key: number]: number }
    );
    setAssignedCounts(counts);
  }, [selectedCourseId, courses, enrollments, instructors]);

  // Handle assign instructor - enrollment based
  const handleOpenAssign = (student: StudentAssignment) => {
    setSelectedStudent(student);
    setSelectedInstructorDropdown(String(student.currentInstructorId || ''));
    setOpenAssignDialog(true);
    setAssignSuccess(null);
  };

  const handleAssignSubmit = async () => {
    if (!selectedStudent || !selectedInstructorDropdown || !selectedCourseId) {
      setError('Please select an instructor');
      return;
    }

    setAssigning(true);
    setError(null);

    try {
      const enrollmentId = selectedStudent.enrollmentId;

      if (enrollmentId) {
        const baseUrl = import.meta.env.VITE_API_BASE ?? 'http://localhost:52103';
        const response = await fetch(`${baseUrl}/api/enrollments/${enrollmentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            instructorID: Number(selectedInstructorDropdown),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || `HTTP ${response.status}`);
        }

        setAssignSuccess(
          `✓ ${selectedStudent.firstName} ${selectedStudent.lastName} assigned to instructor successfully!`
        );

        const enrollmentsRes = await enrollmentsAPI.getAll();
        const enrollmentsList = Array.isArray(enrollmentsRes?.data) ? enrollmentsRes.data : [];
        setEnrollments(enrollmentsList);

        setTimeout(() => {
          setOpenAssignDialog(false);
          setSelectedStudent(null);
          setSelectedInstructorDropdown('');
          setAssignSuccess(null);
        }, 1500);
      }
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err, user, {
        action: 'assign instructor to student',
        resource: 'enrollments',
        requiredRole: 'Admin',
      });
      setError(errorMessage);
    } finally {
      setAssigning(false);
    }
  };

  // Handle assign students - course based
  const handleCourseBasedAssign = async () => {
    if (!selectedInstructor || assignmentStudentIds.size === 0) {
      setError('Please select at least one student');
      return;
    }

    try {
      setAssigning(true);
      setError(null);

      const instructorId = String(selectedInstructor.instructorID || selectedInstructor.id || '');
      let successCount = 0;
      let failureCount = 0;

      for (const studentId of assignmentStudentIds) {
        try {
          await assignInstructorToStudent(instructorId, studentId);
          successCount++;
        } catch (err) {
          failureCount++;
          console.error(`Failed to assign student ${studentId}:`, err);
        }
      }

      if (successCount > 0) {
        setAssignSuccess(
          `Successfully assigned ${successCount} student${successCount > 1 ? 's' : ''} to ${selectedInstructor.firstMidName || selectedInstructor.firstName} ${selectedInstructor.lastName}`
        );
        setShowAssignDialog(false);
        setAssignmentStudentIds(new Set());
        // Reload data
        const newAdvisedMap = new Map(advisedStudents);
        const instructorIdStr = String(selectedInstructor.instructorID || selectedInstructor.id || '');
        newAdvisedMap.set(instructorIdStr, new Set([...(newAdvisedMap.get(instructorIdStr) || new Set()), ...assignmentStudentIds]));
        setAdvisedStudents(newAdvisedMap);
      }

      if (failureCount > 0) {
        setError(`Failed to assign ${failureCount} student${failureCount > 1 ? 's' : ''}. Please try again.`);
      }
    } catch (err) {
      setError('Failed to assign students. Please try again.');
      console.error('Error assigning students:', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignAll = async () => {
    const filtered = getFilteredCourseBasedStudents();
    if (!selectedInstructor || filtered.length === 0) {
      setError('No students available to assign');
      return;
    }

    setAssigning(true);
    setError(null);

    const instructorId = String(selectedInstructor.instructorID || selectedInstructor.id || '');
    let successCount = 0;
    let failureCount = 0;

    for (const student of filtered) {
      const studentId = String(student.id || student.studentID || '');
      try {
        await assignInstructorToStudent(instructorId, studentId);
        successCount++;
      } catch (err) {
        failureCount++;
        console.error(`Failed to assign student ${studentId}:`, err);
      }
    }

    if (successCount > 0) {
      setAssignSuccess(
        `Successfully assigned ${successCount} student${successCount > 1 ? 's' : ''} to ${selectedInstructor.firstMidName || selectedInstructor.firstName} ${selectedInstructor.lastName}`
      );
      const newAdvisedMap = new Map(advisedStudents);
      const instructorIdStr = String(selectedInstructor.instructorID || selectedInstructor.id || '');
      newAdvisedMap.set(
        instructorIdStr,
        new Set([...(newAdvisedMap.get(instructorIdStr) || new Set()), ...filtered.map(s => String(s.id || s.studentID || ''))])
      );
      setAdvisedStudents(newAdvisedMap);
    }

    if (failureCount > 0) {
      setError(`Failed to assign ${failureCount} student${failureCount > 1 ? 's' : ''}. Please try again.`);
    }

    setAssigning(false);
  };

  const getInstructorName = (instId: number) => {
    const instructor = instructors.find((i) => (i.instructorID ?? i.id) === instId);
    if (!instructor) return 'Unassigned';
    return `${instructor.firstMidName ?? instructor.firstName} ${instructor.lastName}`;
  };

  const filteredStudents = courseStudents.filter((student) => {
    const matchesSearch =
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterAssigned === 'assigned') {
      return matchesSearch && student.currentInstructorId;
    } else if (filterAssigned === 'unassigned') {
      return matchesSearch && !student.currentInstructorId;
    }
    return matchesSearch;
  });

  const getFilteredCourseBasedStudents = () => {
    const advisedStudentIds = advisedStudents.get(
      String(selectedInstructor?.instructorID || selectedInstructor?.id || '')
    ) || new Set();

    const filtered = (allStudents || []).filter((student) => {
      const studentId = String(student.id || student.studentID || '');
      const studentName = `${student.firstMidName || student.firstName || ''} ${student.lastName || ''}`.toLowerCase();

      return (
        !advisedStudentIds.has(studentId) &&
        studentName.includes(courseStudentSearchTerm.toLowerCase())
      );
    });

    console.log('filtered students for instructor', selectedInstructor?.instructorID || selectedInstructor?.id, 'course', selectedCourseForInstructor?.courseID, '=>', filtered.length);
    return filtered;
  };

  const getAlreadyAssignedStudents = () => {
    const advisedStudentIds = advisedStudents.get(
      String(selectedInstructor?.instructorID || selectedInstructor?.id || '')
    ) || new Set();

    return (allStudents || []).filter((student) => {
      const studentId = String(student.id || student.studentID || '');
      return advisedStudentIds.has(studentId);
    });
  };

  const handleStudentToggle = (studentId: string) => {
    const updated = new Set(assignmentStudentIds);
    if (updated.has(studentId)) {
      updated.delete(studentId);
    } else {
      updated.add(studentId);
    }
    setAssignmentStudentIds(updated);
  };

  if (!adminAccess.canAccess) {
    return <AuthAlert type="insufficient_permissions" message={adminAccess.reason} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-blue-600" />
          Assign Instructor to Students
        </h1>
        <p className="text-slate-600 mt-2">
          Choose between enrollment-based or course-based assignment of instructors to students
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-4">
        <Button
          variant={view === 'enrollment-based' ? 'default' : 'outline'}
          onClick={() => setView('enrollment-based')}
          className="flex-1"
        >
          <Users className="w-4 h-4 mr-2" />
          Enrollment Based
        </Button>
        <Button
          variant={view === 'course-based' ? 'default' : 'outline'}
          onClick={() => setView('course-based')}
          className="flex-1"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Course Based
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {assignSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <Check className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">{assignSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Enrollment-Based View */}
      {view === 'enrollment-based' && (
        <>
          {/* Course Selection */}
          <Card className="border-border card-hover">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Select Course
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select
                    value={selectedCourseId ? String(selectedCourseId) : ''}
                    onValueChange={(value) => setSelectedCourseId(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem
                          key={course.courseID}
                          value={String(course.courseID)}
                        >
                          {course.courseName ?? course.title ?? course.name} ({course.courseCode ?? course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCourse && (
                  <div className="space-y-2">
                    <Label>Course Information</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-semibold">{selectedCourse.courseName ?? selectedCourse.title ?? selectedCourse.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedCourse.courseCode ?? selectedCourse.code}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedCourseId && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 grid-item-stagger">
                <Card className="border-border card-hover">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{courseStudents.length}</p>
                      <p className="text-sm text-muted-foreground">Enrolled</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border card-hover">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <UserCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {courseStudents.filter((s) => s.currentInstructorId).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Assigned</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border card-hover">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {courseStudents.filter((s) => !s.currentInstructorId).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Unassigned</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border card-hover">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{instructors.length}</p>
                      <p className="text-sm text-muted-foreground">Available</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Filter:</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={filterAssigned === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterAssigned('all')}
                    >
                      All ({courseStudents.length})
                    </Button>
                    <Button
                      variant={filterAssigned === 'assigned' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterAssigned('assigned')}
                    >
                      Assigned ({courseStudents.filter((s) => s.currentInstructorId).length})
                    </Button>
                    <Button
                      variant={filterAssigned === 'unassigned' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterAssigned('unassigned')}
                    >
                      Unassigned ({courseStudents.filter((s) => !s.currentInstructorId).length})
                    </Button>
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Students in {selectedCourse?.courseName ?? selectedCourse?.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Student</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Enrollment Date</TableHead>
                          <TableHead>Current Instructor</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="list-item-stagger">
                        {filteredStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              {courseStudents.length === 0 ? 'No students enrolled in this course' : 'No results found'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStudents.map((student) => (
                            <TableRow key={student.studentID} className="hover:bg-muted/50">
                              <TableCell className="font-medium">
                                {student.firstName} {student.lastName}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{student.email}</TableCell>
                              <TableCell className="text-sm">
                                {new Date(student.enrollmentDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {student.currentInstructorId ? (
                                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                                    {student.currentInstructor}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                                    Unassigned
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenAssign(student)}
                                  className="button-hover"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Assign
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {/* Course-Based View */}
      {view === 'course-based' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Instructors Column */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Instructors & Their Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(allInstructors || []).length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No instructors found</p>
                  ) : (
                    (allInstructors || []).map((instructor) => {
                      const instructorId = String(instructor.instructorID || instructor.id || '');
                      const courses = instructorCourses.get(instructorId) || [];
                      const isExpanded = expandedInstructors.has(instructorId);

                      return (
                        <Collapsible
                          key={instructorId}
                          open={isExpanded}
                          onOpenChange={(open) => {
                            const newExpanded = new Set(expandedInstructors);
                            if (open) {
                              newExpanded.add(instructorId);
                            } else {
                              newExpanded.delete(instructorId);
                            }
                            setExpandedInstructors(newExpanded);
                          }}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant={
                                selectedInstructor?.instructorID === instructor.instructorID ||
                                selectedInstructor?.id === instructor.id
                                  ? 'default'
                                  : 'outline'
                              }
                              className="w-full justify-between"
                            >
                              <span className="text-left">
                                {instructor.firstMidName || instructor.firstName}{' '}
                                {instructor.lastName}
                              </span>
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="mt-2 ml-4 space-y-2">
                            {courses.length === 0 ? (
                              <p className="text-sm text-slate-500 py-2">
                                No courses assigned
                              </p>
                            ) : (
                              courses.map((course) => (
                                <Button
                                  key={course.courseID}
                                  variant={
                                    selectedCourseForInstructor?.courseID === course.courseID
                                      ? 'default'
                                      : 'ghost'
                                  }
                                  className="w-full justify-start text-left px-3"
                                  onClick={() => {
                                    setSelectedInstructor(instructor);
                                    setSelectedCourseForInstructor(course);
                                    setAssignmentStudentIds(new Set());
                                    setCourseStudentSearchTerm('');
                                  }}
                                >
                                  <span className="text-sm">
                                    {course.courseName ?? course.title ?? course.name}
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      {course.courseCode ?? course.code}
                                    </Badge>
                                  </span>
                                </Button>
                              ))
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students Column */}
          {selectedInstructor && selectedCourseForInstructor && (
            <div className="space-y-6">
              {/* Already Assigned */}
              {getAlreadyAssignedStudents().length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Check className="w-5 h-5" />
                      Already Assigned ({getAlreadyAssignedStudents().length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {getAlreadyAssignedStudents().map((student) => (
                        <div
                          key={String(student.id || student.studentID)}
                          className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm"
                        >
                          <p className="font-medium text-green-900">
                            {student.firstMidName || student.firstName}{' '}
                            {student.lastName}
                          </p>
                          <p className="text-green-700 text-xs">{student.email}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Available Students */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Available Students ({getFilteredCourseBasedStudents().length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search students..."
                        value={courseStudentSearchTerm}
                        onChange={(e) => setCourseStudentSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* bulk actions */}
                    {selectedInstructor && getFilteredCourseBasedStudents().length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const ids = getFilteredCourseBasedStudents().map(s => String(s.id || s.studentID || ''));
                            setAssignmentStudentIds(new Set(ids));
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleAssignAll}
                          disabled={assigning}
                        >
                          Assign All
                        </Button>
                      </div>
                    )}

                    {getFilteredCourseBasedStudents().length === 0 ? (
                      <p className="text-slate-500 text-center py-8">
                        {allStudents.length === 0
                          ? 'Unable to load students'
                          : courseStudentSearchTerm
                          ? 'No matching students found'
                          : 'All students are already assigned'}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {getFilteredCourseBasedStudents().map((student) => {
                          const studentId = String(student.id || student.studentID || '');
                          const isSelected = assignmentStudentIds.has(studentId);

                          return (
                            <div
                              key={studentId}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-300'
                                  : 'bg-white border-slate-200 hover:border-blue-300'
                              }`}
                              onClick={() => handleStudentToggle(studentId)}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">
                                    {student.firstMidName || student.firstName}{' '}
                                    {student.lastName}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    {student.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {getFilteredCourseBasedStudents().length > 0 && (
                      <Button
                        onClick={() => setShowAssignDialog(true)}
                        disabled={assignmentStudentIds.size === 0}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Assign {assignmentStudentIds.size} Student
                        {assignmentStudentIds.size !== 1 ? 's' : ''}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!selectedInstructor && (
            <Card className="lg:col-span-2">
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-slate-500 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  Select an instructor and course to view available students
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Assign Dialog - Enrollment Based */}
      <Dialog open={openAssignDialog} onOpenChange={setOpenAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Assign Instructor to {selectedStudent?.firstName} {selectedStudent?.lastName}
            </DialogTitle>
          </DialogHeader>

          {assignSuccess && (
            <Alert className="border-green-500 bg-green-500/10">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{assignSuccess}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="instructor-select">Select Instructor</Label>
              <Select value={selectedInstructorDropdown} onValueChange={setSelectedInstructorDropdown}>
                <SelectTrigger id="instructor-select">
                  <SelectValue placeholder="Select an instructor..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— No Instructor —</SelectItem>
                  {instructors.map((instructor) => (
                    <SelectItem
                      key={instructor.instructorID ?? instructor.id}
                      value={String(instructor.instructorID ?? instructor.id)}
                    >
                      {instructor.firstMidName ?? instructor.firstName} {instructor.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedInstructorDropdown && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Assigning to:</strong> {getInstructorName(Number(selectedInstructorDropdown))}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Student:</strong> {selectedStudent?.firstName} {selectedStudent?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Course:</strong> {selectedCourse?.courseName ?? selectedCourse?.name}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenAssignDialog(false)} disabled={assigning}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAssignSubmit} disabled={assigning || !selectedInstructorDropdown}>
              {assigning ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog - Course Based */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Assignment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Instructor</Label>
              <p className="text-lg font-semibold text-slate-900">
                {selectedInstructor?.firstMidName || selectedInstructor?.firstName}{' '}
                {selectedInstructor?.lastName}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700">Course</Label>
              <p className="text-lg font-semibold text-slate-900">
                {selectedCourseForInstructor?.courseName || selectedCourseForInstructor?.name}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700">
                Students to Assign ({assignmentStudentIds.size})
              </Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {Array.from(assignmentStudentIds).map((studentId) => {
                  const student = allStudents.find(
                    (s) => String(s.id || s.studentID) === studentId
                  );
                  return (
                    <div
                      key={studentId}
                      className="p-2 bg-blue-50 rounded border border-blue-200 text-sm"
                    >
                      {student?.firstMidName || student?.firstName}{' '}
                      {student?.lastName}
                    </div>
                  );
                })}
              </div>
            </div>

            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                The selected students will be assigned to{' '}
                <strong>
                  {selectedInstructor?.firstMidName || selectedInstructor?.firstName}{' '}
                  {selectedInstructor?.lastName}
                </strong>{' '}
                as their advisor for the{' '}
                <strong>{selectedCourseForInstructor?.courseName || selectedCourseForInstructor?.name}</strong>{' '}
                course.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCourseBasedAssign}
              disabled={assigning}
            >
              {assigning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignInstructorToStudent;