import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, MoreHorizontal, Mail, BookOpen, Calendar, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { studentsAPI, departmentsAPI, enrollmentsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { getAuthErrorMessage, canAccessAdminFeatures, canPerformAction } from '@/lib/authMessages';
import * as XLSX from 'xlsx';

interface Student {
  id?: number;
  studentID?: number;
  firstName?: string;
  firstMidName?: string;
  lastName?: string;
  email?: string;
  enrollmentDate?: string;
  phoneNumber?: string;
  departmentId?: number | null;
  departmentName?: string;
}

interface Enrollment {
  id?: number;
  enrollmentId?: number;
  enrollmentID?: number;
  studentId?: number;
  studentID?: number;
  courseId?: number;
  courseID?: number;
  courseName?: string; // added to fix: Property 'courseName' does not exist on type 'Enrollment'
  enrollmentDate?: string;
  grade?: string | number | null;
}

interface Department {
  departmentID: number;
  name: string;
  budget: number;
  startDate: string;
  instructorID?: number;
  administratorName?: string;
  courseCount: number;
  studentCount: number;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

interface AxiosError extends ErrorResponse {
  message?: string;
}

interface ParsedStudentRecord {
  firstname?: string;
  firstmidname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  phonenumber?: string;
  enrollmentdate?: string;
  password?: string;
  [key: string]: string | undefined;
}

interface BulkStudentPreview {
  row: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  enrollmentDate: string;
  department: string;
  valid: boolean;
  error: string | null;
}

const Students = () => {
  // Auth hooks
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const adminAccess = canAccessAdminFeatures(user);

  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [addFirstName, setAddFirstName] = useState('');
  const [addLastName, setAddLastName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEnrollmentDate, setAddEnrollmentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [addPassword, setAddPassword] = useState('');
  const [addDepartmentId, setAddDepartmentId] = useState<number | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEnrollmentDate, setEditEnrollmentDate] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState('');
  const [bulkPreviewData, setBulkPreviewData] = useState<BulkStudentPreview[]>([]);
  const [bulkPreviewError, setBulkPreviewError] = useState<string | null>(null);
  const [showBulkPreview, setShowBulkPreview] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Students] Fetching students...');
      const response = await studentsAPI.getAll();
      console.log('[Students] Response received:', response);
      console.log('[Students] Response data:', response?.data);
      setStudents(Array.isArray(response?.data) ? response.data : []);
      console.log('[Students] Students set:', Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('[Students] Error fetching students:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load students';
      setError(errorMessage);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('[Students] Fetching departments...');
      const response = await departmentsAPI.getAll();
      console.log('[Students] Departments response:', response?.data);
      setDepartments(Array.isArray(response?.data) ? response.data : []);
    } catch (err: unknown) {
      console.error('[Students] Failed to load departments:', err);
      if (err instanceof Error) {
        console.error('[Students] Error message:', err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error('[Students] Response error:', (err as ErrorResponse).response?.data);
      }
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      console.log('[Students] Fetching enrollments...');
      const response = await enrollmentsAPI.getAll();
      console.log('[Students] Enrollments response:', response?.data);
      setEnrollments(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('[Students] Failed to load enrollments', err);
      setEnrollments([]);
    }
  };

  const getStudentEnrollmentSummary = (student: Student) => {
    const sid = student.studentID ?? student.id;
    if (sid == null) return { enrolled: 0, completed: 0, avgGrade: null };
    const studentEnrolls = enrollments.filter(e => (e.studentID ?? e.studentId) === sid);
    const enrolled = studentEnrolls.length;
    const completed = studentEnrolls.filter(e => e.grade !== null && e.grade !== undefined && String(e.grade).trim() !== '').length;
    const grades = studentEnrolls
      .map(e => {
        const g = e.grade;
        const n = typeof g === 'number' ? g : (g ? Number(String(g)) : NaN);
        return Number.isFinite(n) ? n : null;
      })
      .filter((g): g is number => g !== null);
    const avgGrade = grades.length > 0 ? Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 100) / 100 : null;
    return { enrolled, completed, avgGrade };
  };

  const handleOpenAdd = () => {
    setAddFirstName(''); setAddLastName(''); setAddEmail(''); setAddPhone('');
    setAddEnrollmentDate(new Date().toISOString().slice(0, 10)); setAddPassword('');
    setAddDepartmentId(null);
    setFormError(null); setOpenAddDialog(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (!addDepartmentId) {
      setFormError('Please select a department.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      console.log('[Students] Creating student');
      await studentsAPI.create({
        firstMidName: addFirstName,
        lastName: addLastName,
        email: addEmail,
        phoneNumber: addPhone || undefined,
        enrollmentDate: addEnrollmentDate,
        password: addPassword,
        departmentID: addDepartmentId,
      });
      setOpenAddDialog(false);
      await fetchStudents();
    } catch (err: unknown) {
      console.error('[Students] Error creating student:', err);
      const errorMessage = getAuthErrorMessage(err, user, {
        action: 'create student records',
        resource: 'students',
        requiredRole: 'Admin',
      });
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditFirstName(student.firstMidName ?? student.firstName ?? '');
    setEditLastName(student.lastName ?? '');
    setEditEmail(student.email ?? '');
    setEditPhone(student.phoneNumber ?? '');
    setEditEnrollmentDate(student.enrollmentDate ? student.enrollmentDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setEditDepartmentId(student.departmentId ?? null);
    setFormError(null);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingStudent?.studentID ?? editingStudent?.id;
    if (id == null) return;
    if (!editDepartmentId) {
      setFormError('Please select a department.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      console.log('[Students] Updating student:', id);
      console.log('[Students] Auth token exists:', !!localStorage.getItem('token'));
      await studentsAPI.update(id, {
        id,
        firstMidName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phoneNumber: editPhone || undefined,
        enrollmentDate: editEnrollmentDate,
        departmentID: editDepartmentId,
      });
      setOpenEditDialog(false);
      setEditingStudent(null);
      await fetchStudents();
    } catch (err: unknown) {
      console.error('[Students] Error updating student:', err);
      const errorMessage = getAuthErrorMessage(err, user, {
        action: 'edit student records',
        resource: 'students',
        requiredRole: 'Admin',
      });
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (student: Student) => {
    const id = student.studentID ?? student.id;
    if (id == null) return;
    if (!confirm(`Delete student "${student.firstMidName ?? student.firstName} ${student.lastName}"?`)) return;
    setDeletingId(id);
    try {
      await studentsAPI.delete(id);
      await fetchStudents();
      setSelectedIds(prev => prev.filter(x => x !== id));
    } catch (err: unknown) {
      const errorMessage = getAuthErrorMessage(err, user, {
        action: 'delete student records',
        resource: 'students',
        requiredRole: 'Admin',
      });
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const allIds = filteredStudents.map(s => s.studentID ?? s.id).filter(Boolean) as number[];
    const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(allIds);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected student(s)?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => studentsAPI.delete(id)));
      await fetchStudents();
      setSelectedIds([]);
    } catch (err: unknown) {
      const errorMessage = getAuthErrorMessage(err, user, {
        action: 'delete student records',
        resource: 'students',
        requiredRole: 'Admin',
      });
      alert(errorMessage);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) {
      setFormError('Please select a file');
      return;
    }

    setBulkImporting(true);
    setFormError(null);

    try {
      const data = await parseExcelFile(bulkFile);
      
      if (data.length === 0) {
        setFormError('No valid student records found in file');
        setBulkImporting(false);
        return;
      }

      // Build preview data
      const previewData: BulkStudentPreview[] = data.map((record, idx) => {
        const errors: string[] = [];
        
        if (!record.firstname && !record.firstmidname) errors.push('Missing first name');
        if (!record.lastname) errors.push('Missing last name');
        if (!record.email) errors.push('Missing email');
        
        const validRecord = errors.length === 0;
        
        return {
          row: idx + 2,
          firstName: record.firstname || record.firstmidname || '',
          lastName: record.lastname || '',
          email: record.email || '',
          phone: record.phone || record.phonenumber || '',
          enrollmentDate: record.enrollmentdate || new Date().toISOString().slice(0, 10),
          department: record.department || '',
          valid: validRecord,
          error: validRecord ? null : errors.join(', '),
        };
      });

      setBulkPreviewData(previewData);
      setShowBulkPreview(true);
      setBulkImporting(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse file';
      setFormError(errorMessage);
      setBulkImporting(false);
    }
  };

  const handleBulkImportConfirm = async () => {
    if (bulkPreviewData.length === 0) return;
    
    setBulkImporting(true);
    setFormError(null);

    try {
      const data = await parseExcelFile(bulkFile!);
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        const record = data[i];
        try {
          setBulkProgress(`Processing ${i + 1} of ${data.length}...`);

          // Validate required fields
          if (!record.firstname && !record.firstmidname) {
            errors.push(`Row ${i + 2}: Missing first name`);
            failedCount++;
            continue;
          }
          if (!record.lastname) {
            errors.push(`Row ${i + 2}: Missing last name`);
            failedCount++;
            continue;
          }
          if (!record.email) {
            errors.push(`Row ${i + 2}: Missing email`);
            failedCount++;
            continue;
          }

          const password = record.password || 'TempPass123!';
          
          // Find department by name if provided
          let departmentId: number | null = null;
          if (record.department) {
            const dept = departments.find(d => d.name.toLowerCase() === record.department?.toLowerCase());
            if (dept) {
              departmentId = dept.departmentID;
            } else {
              errors.push(`Row ${i + 2}: Department "${record.department}" not found`);
              failedCount++;
              continue;
            }
          } else if (departments.length > 0) {
            // Auto-assign first department if none specified
            departmentId = departments[0].departmentID;
          }

          if (departmentId === null) {
            errors.push(`Row ${i + 2}: No department available`);
            failedCount++;
            continue;
          }

          // Prepare payload matching API expectations
          const payload = {
            firstMidName: (record.firstname || record.firstmidname || '').trim(),
            lastName: (record.lastname || '').trim(),
            email: (record.email || '').trim().toLowerCase(),
            phoneNumber: record.phone || record.phonenumber ? (record.phone || record.phonenumber).trim() : null,
            enrollmentDate: record.enrollmentdate ? record.enrollmentdate.trim() : new Date().toISOString().slice(0, 10),
            password: password.trim(),
            departmentID: departmentId,
          };

          console.log(`[BulkImport] Row ${i + 2} payload:`, payload);

          await studentsAPI.create(payload);

          successCount++;
        } catch (err: unknown) {
          failedCount++;
          const errMsg = getAuthErrorMessage(err, user, {
            action: 'create student',
            resource: 'students',
            requiredRole: 'Admin',
          });
          
          console.error(`[BulkImport] Row ${i + 2} error:`, errMsg);
          errors.push(`Row ${i + 2}: ${errMsg}`);
        }
      }

      setBulkProgress(`Complete! ${successCount} imported, ${failedCount} failed`);
      
      // Show success message
      if (successCount > 0) {
        setFormError(null);
        const successMessage = `✅ Successfully imported ${successCount} student(s)!${failedCount > 0 ? `\n⚠️ ${failedCount} record(s) failed to import.` : ''}`;
        alert(successMessage);
      }
      
      if (errors.length > 0 && failedCount > 0) {
        const errorDisplay = errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : '');
        console.error('[BulkImport] Errors:', errorDisplay);
        setFormError(`Import completed with errors:\n${errorDisplay}`);
      }

      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Close dialog and refresh only if there were successes
      if (successCount > 0) {
        setOpenBulkDialog(false);
        setBulkFile(null);
        setBulkPreviewData([]);
        setShowBulkPreview(false);
        setBulkProgress('');
        
        // Refresh students list
        await fetchStudents();
        await fetchEnrollments();
      }
      
    } catch (err: unknown) {
      const errorMessage = getAuthErrorMessage(err, user, {
        action: 'bulk import students',
        resource: 'students',
        requiredRole: 'Admin',
      });
      console.error('[BulkImport] Fatal error:', errorMessage);
      setFormError(errorMessage);
    } finally {
      setBulkImporting(false);
    }
  };

  const parseExcelFile = (file: File): Promise<ParsedStudentRecord[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            defval: '',
            blankrows: false 
          }) as Array<Record<string, string>>;

          if (jsonData.length === 0) {
            reject(new Error('No data found in Excel file'));
            return;
          }

          // Normalize keys to lowercase
          const normalizedData: ParsedStudentRecord[] = jsonData.map(row => {
            const normalized: ParsedStudentRecord = {};
            
            Object.keys(row).forEach(key => {
              const lowerKey = key.toLowerCase().trim();
              const value = String(row[key]).trim();
              
              if (value) {
                normalized[lowerKey] = value;
              }
            });
            
            return normalized;
          });

          console.log('Parsed Excel data:', normalizedData);
          resolve(normalizedData);
        } catch (err) {
          console.error('Parse error:', err);
          reject(new Error('Failed to parse Excel file. Ensure it\'s a valid .xlsx file.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
};

// Helper function to properly parse CSV lines
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const nextChar = line[j + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"';
        j++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add last value
  values.push(currentValue.trim());
  
  return values;
};

const downloadTemplate = () => {
  // Create workbook and worksheet
  const ws_data = [
    ['firstName', 'lastName', 'email', 'phone', 'enrollmentDate', 'password', 'department'],
    ['John', 'Doe', 'john.doe@example.com', '1234567890', '2026-01-15', 'SecurePass123', 'Computer Science'],
    ['Jane', 'Smith', 'jane.smith@example.com', '0987654321', '2026-01-15', 'SecurePass456', 'Engineering'],
    ['Ahmed', 'Khan', 'ahmed.khan@example.com', '5555555555', '2026-02-01', 'SecurePass789', 'Business'],
    ['Maria', 'Garcia', 'maria.garcia@example.com', '9876543210', '2026-02-05', 'SecurePass101', 'Computer Science'],
    ['Michael', 'Johnson', 'michael.j@example.com', '4444444444', '2026-02-10', 'SecurePass202', 'Engineering'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  
  // Style header row
  const headerStyle = {
    fill: { fgColor: { rgb: 'FF4472C4' } },
    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  for (let i = 0; i < ws_data[0].length; i++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: i });
    if (ws[cellAddress]) {
      ws[cellAddress].s = headerStyle;
    }
  }

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // firstName
    { wch: 15 }, // lastName
    { wch: 25 }, // email
    { wch: 15 }, // phone
    { wch: 15 }, // enrollmentDate
    { wch: 15 }, // password
    { wch: 20 }, // department
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  XLSX.writeFile(wb, 'students_template.xlsx');
};

const filteredStudents = (Array.isArray(students) ? students : []).filter(student =>
  `${student.firstName ?? student.firstMidName ?? ''} ${student.lastName ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (student.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
);

const getStatusColor = (status: string) => {
  if (status === 'Pending') {
    return 'bg-amber-500/10 text-amber-600';
  }
  return 'bg-success/10 text-success';
};

const getStudentStatus = (student: Student) => {
  const { enrolled, completed, avgGrade } = getStudentEnrollmentSummary(student);
  if (enrolled === 0) return 'Pending';
  // Completed only when avg grade is 100
  if (avgGrade !== null && avgGrade >= 100) return 'Completed';
  return 'In-Progress';
};

const totalEnrollments = enrollments.length;
const graduatedCount = (students || []).filter(s => getStudentStatus(s) === 'Completed').length;

if (loading) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
        <p className="font-semibold">Error Loading Students</p>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );
}

// Check admin authorization
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
          <h2 className="text-2xl font-bold text-foreground">Students Management</h2>
          <p className="text-muted-foreground text-sm mt-1">This page requires administrator privileges to access and manage student records.</p>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your current role: <span className="font-semibold text-foreground">{user?.role || 'Unknown'}</span></p>
          <p className="text-muted-foreground text-sm mt-2">If you believe you should have access to this page, please contact your system administrator.</p>
        </CardContent>
      </Card>
    </div>
  );
}

return (
  <div className="space-y-6 animate-fade-in">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Students</h2>
        <p className="text-muted-foreground">Manage student records</p>
      </div>
      <div className="flex items-center gap-2">
        <Button className="bg-destructive/10 text-destructive hover:bg-destructive/20 button-hover" onClick={handleBulkDelete} disabled={selectedIds.length === 0 || bulkDeleting}>
          {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
        </Button>
        <Button className="bg-green-500/10 text-green-600 hover:bg-green-500/20 button-hover" onClick={downloadTemplate}>
          <Upload className="w-4 h-4 mr-2" />
          Download Template
        </Button>
        <Button className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 button-hover" onClick={() => setOpenBulkDialog(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Import Excel
        </Button>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground button-hover" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>
    </div>

    <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="space-y-2"><Label>First name</Label><Input value={addFirstName} onChange={(e) => setAddFirstName(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Last name</Label><Input value={addLastName} onChange={(e) => setAddLastName(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Password (min 6)</Label><Input type="password" minLength={6} value={addPassword} onChange={(e) => setAddPassword(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} /></div>
          <div className="space-y-2"><Label>Enrollment date</Label><Input type="date" value={addEnrollmentDate} onChange={(e) => setAddEnrollmentDate(e.target.value)} required /></div>
          <div className="space-y-2">
            <Label>Department *</Label>
            <Select value={addDepartmentId?.toString() ?? ''} onValueChange={(value) => setAddDepartmentId(value ? parseInt(value) : null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.departmentID} value={dept.departmentID.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={openEditDialog} onOpenChange={(open) => { if (!open) { setOpenEditDialog(false); setEditingStudent(null); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="space-y-2"><Label>First name</Label><Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Last name</Label><Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} /></div>
          <div className="space-y-2"><Label>Enrollment date</Label><Input type="date" value={editEnrollmentDate} onChange={(e) => setEditEnrollmentDate(e.target.value)} required /></div>
          <div className="space-y-2">
            <Label>Department *</Label>
            <Select value={editDepartmentId?.toString() ?? ''} onValueChange={(value) => setEditDepartmentId(value ? parseInt(value) : null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.departmentID} value={dept.departmentID.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={openBulkDialog} onOpenChange={(open) => {
      if (!open) {
        setOpenBulkDialog(false);
        setBulkFile(null);
        setBulkPreviewData([]);
        setShowBulkPreview(false);
        setBulkProgress('');
        setFormError(null);
      } else {
        setOpenBulkDialog(true);
      }
    }}>
      <DialogContent className={`${showBulkPreview ? 'sm:max-w-3xl' : 'sm:max-w-md'}`}>
        <DialogHeader><DialogTitle>{showBulkPreview ? 'Review Import Data' : 'Import Students from Excel'}</DialogTitle></DialogHeader>
        
        {!showBulkPreview ? (
          <form onSubmit={handleBulkUpload} className="space-y-4">
            {formError && <p className="text-sm text-destructive whitespace-pre-wrap">{formError}</p>}
            {bulkProgress && <p className="text-sm text-blue-600">{bulkProgress}</p>}
            <div className="space-y-2">
              <Label>Select Excel or CSV File</Label>
              <Input 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                onChange={(e) => {
                  setBulkFile(e.target.files?.[0] || null);
                  setBulkPreviewData([]);
                  setBulkPreviewError(null);
                }}
                disabled={bulkImporting}
                required
              />
              <p className="text-xs text-muted-foreground">
                File format: Excel or CSV with columns: firstName, lastName, email, phone (optional), enrollmentDate (optional), password (optional), department (optional - must match exact department name)
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenBulkDialog(false)} disabled={bulkImporting}>Cancel</Button>
              <Button type="submit" disabled={bulkImporting || !bulkFile}>{bulkImporting ? 'Analyzing...' : 'Next'}</Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            {bulkPreviewError && <p className="text-sm text-destructive">{bulkPreviewError}</p>}
            <div className="max-h-96 overflow-y-auto border border-border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Row</TableHead>
                    <TableHead className="text-xs">First Name</TableHead>
                    <TableHead className="text-xs">Last Name</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkPreviewData.map((preview) => (
                    <TableRow key={preview.row} className={preview.valid ? '' : 'bg-destructive/5'}>
                      <TableCell className="text-xs font-medium">{preview.row}</TableCell>
                      <TableCell className="text-xs">{preview.firstName}</TableCell>
                      <TableCell className="text-xs">{preview.lastName}</TableCell>
                      <TableCell className="text-xs">{preview.email}</TableCell>
                      <TableCell className="text-xs">{preview.department || '(auto)'}</TableCell>
                      <TableCell className="text-xs">
                        {preview.valid ? (
                          <Badge className="bg-success/10 text-success">Valid</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">{preview.error}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Valid records: {bulkPreviewData.filter(p => p.valid).length} / {bulkPreviewData.length}</p>
            </div>
            {bulkProgress && <p className="text-sm text-blue-600">{bulkProgress}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowBulkPreview(false); setBulkPreviewData([]); }} disabled={bulkImporting}>Back</Button>
              <Button 
                onClick={handleBulkImportConfirm} 
                disabled={bulkImporting || bulkPreviewData.filter(p => p.valid).length === 0}
              >
                {bulkImporting ? 'Importing...' : 'Confirm Import'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 grid-item-stagger">
      <Card className="border-border card-hover">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{students.length}</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border card-hover">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-success/10 rounded-lg">
            <Users className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{students.length}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border card-hover">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <BookOpen className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalEnrollments}</p>
            <p className="text-sm text-muted-foreground">Enrollments</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border card-hover">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{graduatedCount}</p>
            <p className="text-sm text-muted-foreground">Graduated</p>
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
            placeholder="Search students..."
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
                <TableHead className="w-12 text-center">
                  <input type="checkbox" aria-label="Select all" onChange={toggleSelectAll} checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.includes(s.studentID ?? s.id ?? -1))} />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-center">Enrolled</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">Avg Grade</TableHead>
                <TableHead>Enrolled </TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="list-item-stagger">
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.studentID ?? student.id ?? ''} className="hover:bg-muted/50 table-row-enter">
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        aria-label={`Select student ${student.firstMidName ?? student.firstName}`}
                        checked={selectedIds.includes((student.studentID ?? student.id) as number)}
                        onChange={() => { const id = student.studentID ?? student.id; if (id) toggleSelect(id); }}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-sm">{student.studentID ?? student.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {(student.firstName ?? student.firstMidName ?? 'U')[0]}{(student.lastName ?? 'K')[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{student.firstName ?? student.firstMidName} {student.lastName}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{student.departmentName ? student.departmentName : <span className="text-muted-foreground italic">Not assigned</span>}</span>
                    </TableCell>
                    {(() => {
                      const { enrolled, completed, avgGrade } = getStudentEnrollmentSummary(student);
                      const sid = student.studentID ?? student.id;
                      const studentEnrolls = enrollments.filter(e => (e.studentID ?? e.studentId) === sid);

                      // new helpers for lists
                      const completedEnrolls = studentEnrolls.filter(e =>
                        e.grade !== undefined && e.grade !== null && e.grade !== ''
                      );

                      const activeEnrolls = studentEnrolls.filter(e =>
                        !completedEnrolls.includes(e)
                      );

                      return (
                        <>
                          <TableCell className="text-center">
                            {enrolled > 0 ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="px-2">
                                    {enrolled}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  {studentEnrolls.length === 0 ? (
                                    <DropdownMenuItem disabled>No courses</DropdownMenuItem>
                                  ) : (
                                    studentEnrolls.map(e => (
                                      <DropdownMenuItem key={e.id ?? e.enrollmentId ?? `${e.courseId}`}>
                                        {e.courseName ?? `Course ${e.courseId ?? e.courseID ?? ''}`}{e.grade ? ` — ${e.grade}` : ''}
                                      </DropdownMenuItem>
                                    ))
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <span>0</span>
                            )}
                          </TableCell>

                          {/* Completed: show dropdown list of completed enrollments */}
                          <TableCell className="text-center">
                            {completed > 0 ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="px-2">
                                    {completed}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  {completedEnrolls.length === 0 ? (
                                    <DropdownMenuItem disabled>No completed courses</DropdownMenuItem>
                                  ) : (
                                    completedEnrolls.map(e => (
                                      <DropdownMenuItem key={e.id ?? e.enrollmentId ?? `${e.courseId}`}>
                                        {e.courseName ?? `Course ${e.courseId ?? e.courseID ?? ''}`}{e.grade ? ` — ${e.grade}` : ''}
                                      </DropdownMenuItem>
                                    ))
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <span>0</span>
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            {avgGrade !== null ? <span className="font-medium">{avgGrade}</span> : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                        </>
                      );
                    })()}

                    {/* Active / Status column: show badge that opens dropdown with active enrollments */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="p-0">
                            <Badge className={getStatusColor(getStudentStatus(student))}>{getStudentStatus(student)}</Badge>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {(() => {
                            const sid = student.studentID ?? student.id;
                            const studentEnrolls = enrollments.filter(e => (e.studentID ?? e.studentId) === sid);
                            const completedEnrolls = studentEnrolls.filter(e =>
                              (e.grade !== undefined && e.grade !== null && e.grade !== '')
                            );
                            const activeEnrolls = studentEnrolls.filter(e =>
                              !completedEnrolls.includes(e)
                            );

                            if (activeEnrolls.length === 0) {
                              return <DropdownMenuItem disabled>No active courses</DropdownMenuItem>;
                            }
                            return activeEnrolls.map(e => (
                              <DropdownMenuItem key={e.id ?? e.enrollmentId ?? `${e.courseId}`}>
                                {e.courseName ?? `Course ${e.courseId ?? e.courseID ?? ''}`}{e.grade ? ` — ${e.grade}` : ''}
                              </DropdownMenuItem>
                            ));
                          })()}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(student)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(student)} disabled={deletingId === (student.studentID ?? student.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
  );
};

export default Students;
