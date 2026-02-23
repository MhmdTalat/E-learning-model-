import { useState, useEffect, ChangeEvent } from 'react';
import { ClipboardList, Plus, Search, Edit, Trash2, MoreHorizontal, User, BookOpen, Calendar, CheckCircle, Clock, XCircle, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { enrollmentsAPI, studentsAPI, coursesAPI, departmentsAPI } from '@/lib/api';

// Parse Excel file (CSV format)
const parseExcelFile = async (file: File): Promise<Array<{ studentid: string; courseid: string; enrollmentdate?: string; grade?: string }>> => {
  const text = await file.text();
  const lines = text.split('\n');
  const records: Array<{ studentid: string; courseid: string; enrollmentdate?: string; grade?: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const [studentid, courseid, enrollmentdate, grade] = line.split(',').map(v => v.trim());
    if (studentid && courseid) {
      records.push({
        studentid,
        courseid,
        enrollmentdate: enrollmentdate || undefined,
        grade: grade || undefined,
      });
    }
  }

  return records;
};

// Download CSV template for bulk import
const downloadTemplate = () => {
  const headers = 'studentId,courseId,enrollmentDate,grade\n';
  const exampleRow = '1,101,2024-01-15,85\n';
  const csvContent = headers + exampleRow;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'enrollment_template.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

interface Enrollment {
  id?: number;
  enrollmentId?: number;
  enrollmentID?: number;
  studentId?: number;
  studentID?: number;
  courseId?: number;
  courseID?: number;
  enrollmentDate?: string;
  grade?: string | number;
  studentName?: string;
  studentEmail?: string;
  courseName?: string;
  credits?: number;
  departmentId?: number;
  departmentID?: number;
  departmentName?: string;
}

interface Student {
  id?: number;
  studentID?: number;
  firstMidName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Course {
  id?: number;
  courseID?: number;
  title?: string;
  courseName?: string;
  name?: string;
}

interface BulkPreviewRecord {
  row: number;
  studentId: number;
  courseId: number;
  studentName: string;
  courseName: string;
  enrollmentDate: string;
  grade: string;
  valid: boolean;
  error: string | null;
  warning?: string | null;
}

// API raw types to avoid `any` and satisfy eslint
type ApiCourse = {
  id?: number;
  courseID?: number;
  title?: string;
  courseName?: string;
  name?: string;
  credits?: number;
  Credits?: number;
  departmentID?: number;
  DepartmentID?: number;
  departmentId?: number;
};

type ApiDept = {
  id?: number;
  departmentID?: number;
  name?: string;
  Name?: string;
};

type ApiEnrollment = {
  id?: number;
  enrollmentId?: number;
  enrollmentID?: number;
  studentId?: number;
  studentID?: number;
  courseId?: number;
  courseID?: number;
  enrollmentDate?: string;
  grade?: string | number;
  studentName?: string;
  studentEmail?: string;
  courseName?: string;
  credits?: number;
  departmentId?: number;
  departmentID?: number;
  departmentName?: string;
};

const Enrollments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<ApiDept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [droppedCount, setDroppedCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('droppedEnrollments');
      return raw ? parseInt(raw, 10) || 0 : 0;
    } catch { return 0; }
  });
  const [droppedList, setDroppedList] = useState<Array<{ studentId?: number; studentName?: string; courseId?: number; courseName?: string; deletedAt?: string }>>(() => {
    try {
      const raw = localStorage.getItem('droppedEnrollmentsList');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [openDroppedDialog, setOpenDroppedDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [addStudentId, setAddStudentId] = useState('');
  const [addCourseId, setAddCourseId] = useState('');
  const [addGrade, setAddGrade] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState('');
  const [bulkPreviewData, setBulkPreviewData] = useState<BulkPreviewRecord[]>([]);
  const [bulkPreviewError, setBulkPreviewError] = useState<string | null>(null);
  const [bulkImportingError, setBulkImportingError] = useState<string | null>(null);
  const [studentMap, setStudentMap] = useState<Map<number, Student>>(new Map());
  const [courseMap, setCourseMap] = useState<Map<number, Course>>(new Map());

  const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError(null);
        // Try to fetch enrollments, courses and departments so we can merge department info client-side
        const [eRes, cRes, dRes] = await Promise.all([
          enrollmentsAPI.getAll().catch(() => ({ data: [] })),
          coursesAPI.getAll().catch(() => ({ data: [] })),
          departmentsAPI.getAll().catch(() => ({ data: [] })),
        ]);

        let enrollmentData: ApiEnrollment[] = eRes?.data ?? [];
        if (typeof enrollmentData === 'string') {
          try { enrollmentData = JSON.parse(enrollmentData); } catch { enrollmentData = []; }
        }
        if (!Array.isArray(enrollmentData)) enrollmentData = [];

        const coursesData: ApiCourse[] = Array.isArray(cRes?.data) ? cRes.data : [];
        const deptsData: ApiDept[] = Array.isArray(dRes?.data) ? dRes.data : [];

        // Build lookup maps
        const courseMap = new Map<number | string, ApiCourse>();
        coursesData.forEach((c: ApiCourse) => {
          const id = c.courseID ?? c.id;
          courseMap.set(id ?? '', c);
        });

        const deptMap = new Map<number | string, ApiDept>();
        deptsData.forEach((d: ApiDept) => {
          const id = d.departmentID ?? d.id;
          deptMap.set(id ?? '', d);
        });

        // Map enrollments and enrich with course/department info when backend doesn't provide it
        const mappedEnrollments: Enrollment[] = enrollmentData.map((e: ApiEnrollment) => {
          const courseId = e.courseId ?? e.courseID;
          const course = courseMap.get(courseId ?? '');
          const departmentId = e.departmentId ?? e.departmentID ?? course?.departmentID ?? course?.DepartmentID ?? course?.departmentId;
          const dept = deptMap.get(departmentId ?? '');

          return {
            id: e.enrollmentId || e.enrollmentID || e.id,
            enrollmentId: e.enrollmentId || e.enrollmentID || e.id,
            enrollmentID: e.enrollmentId || e.enrollmentID || e.id,
            studentId: e.studentId || e.studentID,
            studentID: e.studentId || e.studentID,
            courseId: courseId,
            courseID: courseId,
            enrollmentDate: e.enrollmentDate,
            grade: e.grade,
            studentName: e.studentName,
            studentEmail: e.studentEmail,
            courseName: e.courseName ?? course?.title ?? course?.courseName ?? course?.name,
            credits: e.credits ?? course?.credits ?? course?.Credits,
            departmentId: departmentId,
            departmentID: departmentId,
            departmentName: e.departmentName ?? dept?.name ?? dept?.Name,
          } as Enrollment;
        });

        console.log('[Mapped Enrollments]', mappedEnrollments);
        setEnrollments(mappedEnrollments);
        // compute counts
        const completed = mappedEnrollments.filter(e => {
          const g = e.grade;
          const n = typeof g === 'number' ? g : (g ? Number(String(g)) : NaN);
          return Number.isFinite(n) && n >= 100;
        }).length;
        const active = mappedEnrollments.filter(e => {
          const g = e.grade;
          const n = typeof g === 'number' ? g : (g ? Number(String(g)) : NaN);
          // active = not completed (no grade or grade < 100)
          return !(Number.isFinite(n) && n >= 100);
        }).length;
        setCompletedCount(completed);
        setActiveCount(active);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load enrollments');
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    if (openAddDialog || openEditDialog) {
      Promise.all([studentsAPI.getAll(), coursesAPI.getAll(), departmentsAPI.getAll()])
        .then(([sRes, cRes, dRes]) => {
          setStudents(Array.isArray(sRes?.data) ? sRes.data : []);
          setCourses(Array.isArray(cRes?.data) ? cRes.data : []);
          setDepartments(Array.isArray(dRes?.data) ? dRes.data : []);
        })
        .catch(() => { setStudents([]); setCourses([]); setDepartments([]); });
    }
  }, [openAddDialog, openEditDialog]);

  const handleOpenAdd = () => {
    setAddStudentId(''); setAddCourseId(''); setAddGrade(''); setFormError(null);
    setAddDepartmentId('');
    setOpenAddDialog(true);
  };

  const [addDepartmentId, setAddDepartmentId] = useState<string>('');

  const filterStudentsByDept = (deptId?: number | null) => {
    if (!deptId) return students;
    return students.filter((s: Student & { departmentID?: number; departmentId?: number; DepartmentID?: number; DepartmentId?: number; Department?: { departmentID?: number; id?: number } }) => {
      const sid = s.departmentID ?? s.departmentId ?? s.DepartmentID ?? s.DepartmentId ?? s.Department?.departmentID ?? s.Department?.id;
      return sid == null ? false : Number(sid) === Number(deptId);
    });
  };

  const filterCoursesByDept = (deptId?: number | null) => {
    if (!deptId) return courses;
    return courses.filter((c: Course & { departmentID?: number; DepartmentID?: number; departmentId?: number; Department?: { departmentID?: number; id?: number } }) => {
      const cid = c.departmentID ?? c.DepartmentID ?? c.departmentId ?? c.Department?.departmentID ?? c.Department?.id;
      return cid == null ? false : Number(cid) === Number(deptId);
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await enrollmentsAPI.create({
        studentID: parseInt(addStudentId, 10),
        courseID: parseInt(addCourseId, 10),
        grade: addGrade.trim() || undefined,
        enrollmentDate: new Date().toISOString().slice(0, 10),
      });
      setOpenAddDialog(false);
      await fetchEnrollments();
    } catch (err: unknown) {
      let errorMessage = 'Failed to create enrollment';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
        if (typeof response === 'string') {
          errorMessage = response;
        }
      }
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setEditGrade(enrollment.grade ? String(enrollment.grade) : '');
    setFormError(null);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingEnrollment?.id ?? editingEnrollment?.enrollmentId;
    if (id == null) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await enrollmentsAPI.update(id, {
        enrollmentID: id,
        studentID: editingEnrollment!.studentId ?? editingEnrollment!.studentID!,
        courseID: editingEnrollment!.courseId ?? editingEnrollment!.courseID!,
        grade: editGrade.trim() || undefined,
        enrollmentDate: editingEnrollment?.enrollmentDate ?? new Date().toISOString().slice(0, 10),
      });
      setOpenEditDialog(false);
      setEditingEnrollment(null);
      await fetchEnrollments();
    } catch (err: unknown) {
      let errorMessage = 'Failed to update enrollment';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
        if (typeof response === 'string') {
          errorMessage = response;
        }
      }
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (enrollment: Enrollment) => {
    const id = enrollment.id ?? enrollment.enrollmentId;
    if (id == null) return;
    if (!confirm('Remove this enrollment?')) return;
    setDeletingId(id);
    try {
      await enrollmentsAPI.delete(id);
      // record this as a dropped enrollment (persist details)
      const record = {
        studentId: enrollment.studentId ?? enrollment.studentID,
        studentName: enrollment.studentName,
        courseId: enrollment.courseId ?? enrollment.courseID,
        courseName: enrollment.courseName,
        deletedAt: new Date().toISOString(),
      };
      setDroppedList(prev => {
        const next = [record, ...prev];
        try { localStorage.setItem('droppedEnrollmentsList', JSON.stringify(next)); } catch (err) {
          // Silently ignore localStorage errors
        }
        try { localStorage.setItem('droppedEnrollments', String(next.length)); } catch (err) {
          // Silently ignore localStorage errors
        }
        return next;
      });
      setDroppedCount(prev => prev + 1);
      await fetchEnrollments();
    } catch (err: unknown) {
      let errorMessage = 'Failed to delete';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
        if (typeof response === 'string') {
          errorMessage = response;
        }
      }
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  // keep droppedCount in sync with droppedList
  useEffect(() => {
    try {
      const n = Array.isArray(droppedList) ? droppedList.length : 0;
      setDroppedCount(n);
      localStorage.setItem('droppedEnrollments', String(n));
    } catch {
      // Silently ignore localStorage errors
    }
  }, [droppedList]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setBulkFile(file);
    setBulkPreviewData([]);
    setBulkPreviewError(null);
    
    if (!file) return;

    try {
      const data = await parseExcelFile(file);
      
      if (data.length === 0) {
        setBulkPreviewError('No valid enrollment records found in file');
        return;
      }

      // Build maps from students and courses
      const sMap = new Map<number, Student>();
      const cMap = new Map<number, Course>();

      if (students.length > 0) {
        students.forEach(s => {
          const id = s.studentID || s.id;
          if (id) sMap.set(id, s);
        });
      }

      if (courses.length > 0) {
        courses.forEach(c => {
          const id = c.courseID || c.id;
          if (id) cMap.set(id, c);
        });
      }

      setStudentMap(sMap);
      setCourseMap(cMap);

      // Transform preview data to show full details
      const previewData = data.map((record, idx) => {
        const studentId = parseInt(record.studentid);
        const courseId = parseInt(record.courseid);
        const student = sMap.get(studentId);
        const course = cMap.get(courseId);

        return {
          row: idx + 2,
          studentId,
          courseId,
          studentName: student ? `${student.firstMidName || student.firstName || ''} ${student.lastName || ''}`.trim() : `Student ${studentId}`,
          courseName: course ? course.courseName || course.title || course.name || `Course ${courseId}` : `Course ${courseId}`,
          enrollmentDate: record.enrollmentdate || new Date().toISOString().slice(0, 10),
          grade: record.grade || '-',
          valid: course ? true : false,
          error: !course ? `Course ${courseId} not found` : null,
          warning: !student ? `Student ${studentId} not found` : null,
        };
      });

      setBulkPreviewData(previewData);
    } catch (err) {
      setBulkPreviewError(err instanceof Error ? err.message : 'Failed to parse file');
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) {
      setFormError('Please select a file');
      return;
    }

    if (bulkPreviewData.length === 0) {
      setFormError('No valid records to import');
      return;
    }

    setBulkImporting(true);
    setFormError(null);

    try {
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const preview of bulkPreviewData) {
        try {
          setBulkProgress(`Importing enrollment: ${preview.studentName} → ${preview.courseName}`);

          if (!preview.valid) {
            errors.push(`Row ${preview.row}: ${preview.error}`);
            failedCount++;
            continue;
          }

          await enrollmentsAPI.create({
            studentId: preview.studentId,
            courseId: preview.courseId,
            enrollmentDate: preview.enrollmentDate,
            grade: preview.grade !== '-' ? preview.grade : undefined,
          });

          successCount++;
        } catch (err: unknown) {
          failedCount++;
          let errMsg = 'Unknown error';
          if (err instanceof Error) {
            errMsg = err.message;
          } else if (err && typeof err === 'object' && 'response' in err) {
            const response = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
            if (typeof response === 'string') {
              errMsg = response;
            }
          }
          errors.push(`Row ${preview.row}: ${errMsg}`);
        }
      }

      setBulkProgress(`Complete! ${successCount} imported, ${failedCount} failed`);
      
      if (errors.length > 0) {
        setFormError(`Import completed with errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : ''}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      setOpenBulkDialog(false);
      setBulkFile(null);
      setBulkPreviewData([]);
      setBulkProgress('');
      await fetchEnrollments();
    } catch (err: unknown) {
      let errorMessage = 'Failed to import enrollments';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: string }).message === 'string') {
        errorMessage = (err as { message: string }).message;
      }
      setFormError(errorMessage);
    } finally {
      setBulkImporting(false);
    }
  };

  const filteredEnrollments = (Array.isArray(enrollments) ? enrollments : []).filter(enrollment => {
    const studentId = enrollment.studentId ?? enrollment.studentID ?? '';
    const courseId = enrollment.courseId ?? enrollment.courseID ?? '';
    const deptId = enrollment.departmentId ?? enrollment.departmentID ?? '';
    const deptName = (enrollment.departmentName ?? '').toString();
    const studentName = (enrollment.studentName ?? '').toString();
    const courseName = (enrollment.courseName ?? '').toString();
    const q = searchTerm.toLowerCase();
    return (
      studentId.toString().toLowerCase().includes(q) ||
      courseId.toString().toLowerCase().includes(q) ||
      deptId.toString().toLowerCase().includes(q) ||
      deptName.toLowerCase().includes(q) ||
      studentName.toLowerCase().includes(q) ||
      courseName.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    return 'bg-accent/10 text-accent';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading enrollments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p className="font-semibold">Error Loading Enrollments</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Enrollments</h2>
            <p className="text-muted-foreground">Manage course registrations</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            <Button variant="outline" onClick={() => setOpenBulkDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleOpenAdd}>
              <Plus className="w-4 h-4 mr-2" />
              New Enrollment
            </Button>
          </div>
        </div>

      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Enrollment</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="space-y-2">
              <Label>Student</Label>
              <div className="mb-2">
                <Label className="text-xs">Department (filter)</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
                  value={addDepartmentId}
                  onChange={(e) => setAddDepartmentId(e.target.value)}
                >
                  <option value="">— All Departments —</option>
                  {departments.map((d) => (
                    <option key={d.departmentID ?? d.id} value={d.departmentID ?? d.id}>{d.name ?? d.Name}</option>
                  ))}
                </select>
              </div>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={addStudentId}
                onChange={(e) => setAddStudentId(e.target.value)}
                required
              >
                <option value="">Select student</option>
                {filterStudentsByDept(addDepartmentId ? Number(addDepartmentId) : undefined).map((s: Student & { departmentID?: number; departmentId?: number; DepartmentID?: number; DepartmentId?: number; Department?: { departmentID?: number; id?: number } }) => (
                  <option key={s.id ?? s.studentID} value={s.id ?? s.studentID}>
                    {(s.firstMidName ?? s.firstName ?? '')} {(s.lastName ?? '')} ({s.email ?? ''})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={addCourseId}
                onChange={(e) => setAddCourseId(e.target.value)}
                required
              >
                <option value="">Select course</option>
                {filterCoursesByDept(addDepartmentId ? Number(addDepartmentId) : undefined).map((c: Course & { departmentID?: number; DepartmentID?: number; departmentId?: number; Department?: { departmentID?: number; id?: number } }) => (
                  <option key={c.courseID ?? c.id} value={c.courseID ?? c.id}>
                    {c.title ?? c.courseName ?? c.name ?? ''} (ID: {c.courseID ?? c.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Grade (optional)</Label>
              <Input type="number" min={0} max={100} step={0.1} value={addGrade} onChange={(e) => setAddGrade(e.target.value)} placeholder="0-100" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAddDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditDialog} onOpenChange={(open) => { if (!open) { setOpenEditDialog(false); setEditingEnrollment(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Grade</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="space-y-2">
              <Label>Grade</Label>
              <Input type="number" min={0} max={100} step={0.1} value={editGrade} onChange={(e) => setEditGrade(e.target.value)} placeholder="0-100" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openBulkDialog} onOpenChange={setOpenBulkDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Import Enrollments</DialogTitle>
            <DialogDescription>Upload a CSV file with studentId, courseId, enrollmentDate, and grade columns</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {bulkImportingError && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                {bulkImportingError}
              </div>
            )}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="bulk-file-input"
              />
              <label htmlFor="bulk-file-input" className="cursor-pointer block">
                <p className="font-semibold">Drop CSV file or click to select</p>
                <p className="text-sm text-muted-foreground mt-1">Format: studentId, courseId, enrollmentDate, grade</p>
                {bulkFile && <p className="text-sm text-accent mt-2">✓ {bulkFile.name}</p>}
              </label>
            </div>

            {bulkPreviewData.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkPreviewData.map((row, idx) => (
                      <TableRow key={idx} className={row.valid && !row.warning ? 'bg-success/5' : row.warning && row.valid ? 'bg-warning/5' : 'bg-destructive/5'}>
                        <TableCell>
                          <div className="text-sm font-medium">{row.studentName}</div>
                          <div className="text-xs text-muted-foreground">ID: {row.studentId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{row.courseName}</div>
                          <div className="text-xs text-muted-foreground">ID: {row.courseId}</div>
                        </TableCell>
                        <TableCell className="text-sm">{row.enrollmentDate}</TableCell>
                        <TableCell className="text-sm">{row.grade || '-'}</TableCell>
                        <TableCell>
                          {row.error ? (
                            <div className="flex items-center gap-2">
                              <XCircle className="w-5 h-5 text-destructive" />
                              <span className="text-xs text-destructive">{row.error}</span>
                            </div>
                          ) : row.warning ? (
                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5 text-yellow-600" />
                              <span className="text-xs text-yellow-600">{row.warning}</span>
                            </div>
                          ) : (
                            <CheckCircle className="w-5 h-5 text-success" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenBulkDialog(false)} disabled={bulkImporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkUpload} 
              disabled={bulkPreviewData.length === 0 || bulkImporting || bulkPreviewData.some(r => r.error)}
            >
              {bulkImporting ? `Importing... (${bulkProgress}/${bulkPreviewData.length})` : `Import ${bulkPreviewData.length} Enrollments`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{enrollments.length + droppedCount}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
                <button onClick={() => setOpenDroppedDialog(true)} className="text-left">
                  <p className="text-2xl font-bold text-foreground">{droppedCount}</p>
                  <p className="text-sm text-muted-foreground">Dropped</p>
                </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search enrollments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Enrolled date</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No enrollments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((enrollment) => {
                    // Concatenate student name (firstname + lastname)
                    const studentFullName = enrollment.studentName || 'Unknown Student';
                    // Concatenate course name + id
                    const courseDisplay = `${enrollment.courseName || 'Unknown Course'} (ID: ${enrollment.courseID || enrollment.courseId || 'N/A'})`;
                    
                    return (
                      <TableRow key={enrollment.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{studentFullName}</div>
                              <div className="text-xs text-muted-foreground">Student ID: {enrollment.studentId || enrollment.studentID || 'N/A'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{courseDisplay}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              Credits: {enrollment.credits || 0}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{enrollment.departmentName || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">Dept ID: {enrollment.departmentId || enrollment.departmentID || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="pr-8">
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              {enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{enrollment.grade || 'N/A'}%</span>
                              {(enrollment.grade !== undefined && enrollment.grade !== null)
                                ? <span className="font-medium text-success">●</span>
                                : <span className="font-medium text-amber-500">●</span>
                              }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEdit(enrollment)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(enrollment)} disabled={deletingId === (enrollment.id ?? enrollment.enrollmentId)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
      </CardContent>
    </Card>
    </div>

    <Dialog open={openDroppedDialog} onOpenChange={setOpenDroppedDialog}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dropped Enrollments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {droppedList.length === 0 ? (
            <div className="text-muted-foreground">No dropped enrollments recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Deleted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {droppedList.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="font-medium text-sm">{r.studentName || `Student ${r.studentId ?? 'N/A'}`}</div>
                        <div className="text-xs text-muted-foreground">ID: {r.studentId ?? 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{r.courseName || `Course ${r.courseId ?? 'N/A'}`}</div>
                        <div className="text-xs text-muted-foreground">ID: {r.courseId ?? 'N/A'}</div>
                      </TableCell>
          <Button variant="outline" onClick={() => { setDroppedList([]); try { localStorage.removeItem('droppedEnrollmentsList'); localStorage.setItem('droppedEnrollments','0'); } catch { /* ignore */ } }}>Clear</Button>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setDroppedList([]); try { localStorage.removeItem('droppedEnrollmentsList'); localStorage.setItem('droppedEnrollments','0'); } catch { /* ignore error */ } }}>Clear</Button>
          <Button onClick={() => setOpenDroppedDialog(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Enrollments;
