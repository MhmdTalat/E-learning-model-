import { useState, useEffect } from 'react';
import { BookOpen, Users, UserCheck, Search, Plus, X, Check, AlertCircle } from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { getAuthErrorMessage, canAccessAdminFeatures } from '@/lib/authMessages';
import AuthAlert from '@/components/AuthAlert';

interface Course {
  id?: number;
  courseID?: number;
  name?: string;
  courseName?: string;
  code?: string;
  courseCode?: string;
  description?: string;
}

interface Student {
  id?: number;
  studentID?: number;
  firstName?: string;
  firstMidName?: string;
  lastName?: string;
  email?: string;
  enrollmentDate?: string;
}

interface Instructor {
  id?: number;
  instructorID?: number;
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

const AssignInstructorToStudent = () => {
  // Auth
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const adminAccess = canAccessAdminFeatures(user);

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseStudents, setCourseStudents] = useState<StudentAssignment[]>([]);
  const [assignedCounts, setAssignedCounts] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentAssignment | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [filterAssigned, setFilterAssigned] = useState<'all' | 'assigned' | 'unassigned'>('all');

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch courses
        const coursesRes = await coursesAPI.getAll();
        const coursesList = Array.isArray(coursesRes?.data) ? coursesRes.data : [];
        setCourses(coursesList);

        // Fetch instructors
        const instructorsRes = await instructorsAPI.getAll();
        const instructorsList = Array.isArray(instructorsRes?.data) ? instructorsRes.data : [];
        setInstructors(instructorsList);

        // Fetch enrollments
        const enrollmentsRes = await enrollmentsAPI.getAll();
        const enrollmentsList = Array.isArray(enrollmentsRes?.data) ? enrollmentsRes.data : [];
        setEnrollments(enrollmentsList);
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

  // Handle course selection
  useEffect(() => {
    if (!selectedCourseId) {
      setCourseStudents([]);
      setSelectedCourse(null);
      return;
    }

    const course = courses.find((c) => (c.courseID ?? c.id) === selectedCourseId);
    if (!course) return;

    setSelectedCourse(course);

    // Get students enrolled in this course
    const courseEnrollments = enrollments.filter(
      (e) => (e.courseID ?? e.courseId) === selectedCourseId
    );

    const students: StudentAssignment[] = courseEnrollments
      .map((enrollment) => {
        // Find the student in enrollment
        const studentId = enrollment.studentID ?? enrollment.studentId;

        // Try to find student details from other enrollments
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

    // Remove duplicates based on studentID
    const uniqueStudents = Array.from(
      new Map(students.map((s) => [s.studentID, s])).values()
    );

    setCourseStudents(uniqueStudents);

    // Count assigned instructors
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

  // Handle assign instructor
  const handleOpenAssign = (student: StudentAssignment) => {
    setSelectedStudent(student);
    setSelectedInstructor(String(student.currentInstructorId || ''));
    setOpenAssignDialog(true);
    setAssignSuccess(null);
  };

  const handleAssignSubmit = async () => {
    if (!selectedStudent || !selectedInstructor || !selectedCourseId) {
      setError('Please select an instructor');
      return;
    }

    setAssigning(true);
    setError(null);

    try {
      // Update enrollment with instructor
      const enrollmentId = selectedStudent.enrollmentId;

      if (enrollmentId) {
        // Use the enrollment endpoint to update
        const baseUrl = import.meta.env.VITE_API_BASE ?? 'http://localhost:52103';
        const response = await fetch(`${baseUrl}/api/enrollments/${enrollmentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            instructorID: Number(selectedInstructor),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || `HTTP ${response.status}`);
        }

        setAssignSuccess(
          `✓ ${selectedStudent.firstName} ${selectedStudent.lastName} assigned to instructor successfully!`
        );

        // Refresh enrollments
        const enrollmentsRes = await enrollmentsAPI.getAll();
        const enrollmentsList = Array.isArray(enrollmentsRes?.data) ? enrollmentsRes.data : [];
        setEnrollments(enrollmentsList);

        setTimeout(() => {
          setOpenAssignDialog(false);
          setSelectedStudent(null);
          setSelectedInstructor('');
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

  // Get display name for instructor
  const getInstructorName = (instId: number) => {
    const instructor = instructors.find((i) => (i.instructorID ?? i.id) === instId);
    if (!instructor) return 'Unassigned';
    return `${instructor.firstMidName ?? instructor.firstName} ${instructor.lastName}`;
  };

  // Filter students
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

  // Auth check
  if (!adminAccess.canAccess) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Alert className="border-amber-500 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 font-medium">
            {adminAccess.reason}
          </AlertDescription>
        </Alert>
        <Card className="border-border">
          <CardHeader>
            <h2 className="text-2xl font-bold text-foreground">Instructor Assignment</h2>
            <p className="text-muted-foreground text-sm mt-1">
              This page requires administrator privileges.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Assign Instructor to Students</h2>
        <p className="text-muted-foreground">Select a course and assign instructors to its students</p>
      </div>

      {error && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {assignSuccess && (
        <Alert className="border-green-500 bg-green-500/10">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{assignSuccess}</AlertDescription>
        </Alert>
      )}

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
                    <SelectItem key={course.courseID ?? course.id} value={String(course.courseID ?? course.id)}>
                      {course.courseName ?? course.name} ({course.courseCode ?? course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCourse && (
              <div className="space-y-2">
                <Label>Course Information</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-semibold">{selectedCourse.courseName ?? selectedCourse.name}</p>
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

      {/* Assign Dialog */}
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
              <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
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

            {selectedInstructor && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Assigning to:</strong> {getInstructorName(Number(selectedInstructor))}
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
            <Button type="button" onClick={handleAssignSubmit} disabled={assigning || !selectedInstructor}>
              {assigning ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignInstructorToStudent;
