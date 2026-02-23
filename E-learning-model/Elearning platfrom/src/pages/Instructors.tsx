import { useState, useEffect, useCallback } from 'react';
import { UserCheck, Plus, Search, Edit, Trash2, MoreHorizontal, Mail, BookOpen, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { instructorsAPI, departmentsAPI } from '@/lib/api';

interface Instructor {
  id?: number;
  instructorID?: number;
  firstName?: string;
  firstMidName?: string;
  lastName?: string;
  email?: string;
  departmentId?: number;
  departmentID?: number;
  hireDate?: string;
  phoneNumber?: string;
  courses?: Course[];
  students?: Student[];
}

interface Department {
  id?: number;
  departmentID?: number;
  departmentId?: number;
  name?: string;
  departmentName?: string;
}

interface Course {
  id?: number;
  courseID?: number;
  name?: string;
  courseName?: string;
  code?: string;
  courseCode?: string;
}

interface Student {
  id?: number;
  studentID?: number;
  firstName?: string;
  firstMidName?: string;
  lastName?: string;
  email?: string;
}

const Instructors = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingInst, setEditingInst] = useState<Instructor | null>(null);
  const [addFirstName, setAddFirstName] = useState('');
  const [addLastName, setAddLastName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addHireDate, setAddHireDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [addDepartmentId, setAddDepartmentId] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editHireDate, setEditHireDate] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignInstructor, setAssignInstructor] = useState<Instructor | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await instructorsAPI.getAll();
      let instructorData = response.data;
      if (typeof instructorData === 'string') {
        try { instructorData = JSON.parse(instructorData); } catch { instructorData = []; }
      }
      const instructorList = Array.isArray(instructorData) ? instructorData : [];
      
      // Fetch course counts and student counts for each instructor
      const instructorsWithData = await Promise.all(
        instructorList.map(async (inst) => {
          let instWithData = inst;
          try {
            const instId = inst.instructorID ?? inst.id;
            if (!instId) return inst;
            
            const baseUrl = import.meta.env.VITE_API_BASE ?? 'http://localhost:52103';
            
            // Fetch courses
            const courseEndpoints = [
              `${baseUrl}/api/instructors/${instId}/courses`,
              `${baseUrl}/api/instructor/${instId}/courses`,
            ];
            
            for (const endpoint of courseEndpoints) {
              try {
                const res = await fetch(endpoint, {
                  headers: { Accept: 'application/json' }
                });
                if (res.ok) {
                  const courses = await res.json();
                  instWithData = {
                    ...instWithData,
                    courses: Array.isArray(courses) ? courses : (courses?.data ?? [])
                  };
                  break;
                }
              } catch (e) {
                // Continue to next endpoint
              }
            }
            
            // Fetch students
            const studentEndpoints = [
              `${baseUrl}/api/instructors/${instId}/students`,
              `${baseUrl}/api/instructor/${instId}/students`,
              `${baseUrl}/api/enrollments?instructorId=${instId}`,
            ];
            
            for (const endpoint of studentEndpoints) {
              try {
                const res = await fetch(endpoint, {
                  headers: { Accept: 'application/json' }
                });
                if (res.ok) {
                  const studentsData = await res.json();
                  instWithData = {
                    ...instWithData,
                    students: Array.isArray(studentsData) ? studentsData : (studentsData?.data ?? [])
                  };
                  break;
                }
              } catch (e) {
                // Continue to next endpoint
              }
            }
          } catch (err) {
            console.debug(`Failed to fetch courses/students for instructor ${inst.instructorID ?? inst.id}`);
          }
          return instWithData;
        })
      );
      
      setInstructors(instructorsWithData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instructors');
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInstructorCourses = async (instructor: Instructor) => {
    // API endpoint for courses doesn't exist, skipping
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  useEffect(() => {
    fetchInstructors();
    fetchDepartments();
  }, [fetchInstructors]);



  const handleOpenAdd = () => {
    setAddFirstName(''); setAddLastName(''); setAddEmail(''); setAddPhone('');
    setAddHireDate(new Date().toISOString().slice(0, 10)); setAddDepartmentId(''); setAddPassword('');
    setFormError(null); setOpenAddDialog(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await instructorsAPI.create({
        firstMidName: addFirstName,
        lastName: addLastName,
        email: addEmail,
        phoneNumber: addPhone || undefined,
        hireDate: addHireDate,
        departmentID: addDepartmentId ? parseInt(addDepartmentId, 10) : null,
        password: addPassword,
      });
      setOpenAddDialog(false);
      await fetchInstructors();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err ? (err as AxiosError<{ message?: string }>).response?.data?.message ?? err.message : err instanceof Error ? err.message : 'Failed to create instructor';
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (inst: Instructor) => {
    const id = inst.instructorID ?? inst.id;
    setEditingInst(inst);
    setEditFirstName(inst.firstMidName ?? inst.firstName ?? '');
    setEditLastName(inst.lastName ?? '');
    setEditEmail(inst.email ?? '');
    setEditPhone(inst.phoneNumber ?? '');
    setEditHireDate(inst.hireDate ? inst.hireDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setEditDepartmentId(inst.departmentID != null ? String(inst.departmentID) : (inst.departmentId != null ? String(inst.departmentId) : ''));
    setFormError(null);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingInst?.instructorID ?? editingInst?.id;
    if (id == null) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await instructorsAPI.update(id, {
        instructorID: id,
        firstMidName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phoneNumber: editPhone || undefined,
        hireDate: editHireDate,
        departmentID: editDepartmentId ? parseInt(editDepartmentId, 10) : null,
        password: 'KEEP_CURRENT_PASSWORD',
      });
      setOpenEditDialog(false);
      setEditingInst(null);
      await fetchInstructors();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err ? (err as AxiosError<{ message?: string }>).response?.data?.message ?? err.message : err instanceof Error ? err.message : 'Failed to update instructor';
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (inst: Instructor) => {
    const id = inst.instructorID ?? inst.id;
    if (id == null) return;
    if (!confirm(`Delete instructor "${inst.firstMidName ?? inst.firstName} ${inst.lastName}"?`)) return;
    setDeletingId(id);
    try {
      await instructorsAPI.delete(id);
      await fetchInstructors();
      // remove from selection if present
      setSelectedIds(prev => prev.filter(x => x !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err ? (err as AxiosError<{ message?: string }>).response?.data?.message ?? err.message : err instanceof Error ? err.message : 'Failed to delete';
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const allIds = filteredInstructors.map(i => i.instructorID ?? i.id).filter(Boolean) as number[];
    const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(allIds);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected instructor(s)?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => instructorsAPI.delete(id)));
      await fetchInstructors();
      setSelectedIds([]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err ? (err as AxiosError<{ message?: string }>).response?.data?.message ?? err.message : err instanceof Error ? err.message : 'Failed to delete selected';
      alert(errorMessage);
    } finally {
      setBulkDeleting(false);
    }
  };

  const filteredInstructors = (Array.isArray(instructors) ? instructors : []).filter(inst => {
    const fullName = `${inst.firstName ?? inst.firstMidName ?? ''} ${inst.lastName ?? ''}`.toLowerCase();
    const email = (inst.email || '').toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    return 'bg-success/10 text-success';
  };

  const getDepartmentName = (deptId?: number) => {
    if (!deptId) return '—';
    const dept = departments.find(d => 
      (d.departmentID ?? d.departmentId ?? d.id) === deptId
    );
    return dept?.name ?? dept?.departmentName ?? '—';
  };

  const getCourseCount = (inst: Instructor): number => {
    return inst.courses ? (Array.isArray(inst.courses) ? inst.courses.length : 0) : 0;
  };

  const getStudentCount = (inst: Instructor): number => {
    return inst.students ? (Array.isArray(inst.students) ? inst.students.length : 0) : 0;
  };

  const getTotalCoursesAssigned = (): number => {
    return instructors.reduce((total, inst) => total + getCourseCount(inst), 0);
  };

  const getTotalStudentsAssigned = (): number => {
    return instructors.reduce((total, inst) => total + getStudentCount(inst), 0);
  };

  const handleRefreshCourses = async () => {
    await fetchInstructors();
  };

  const handleAssignCourses = (inst: Instructor) => {
    const instId = inst.instructorID ?? inst.id;
    navigate(`/dashboard/instructor-enrollment?instructor=${instId}`);
  };

  const openAssignModal = async (inst: Instructor) => {
    setAssignError(null);
    setAssignInstructor(inst);
    setSelectedCourseId('');
    setAvailableCourses([]);
    setAssignOpen(true);
    try {
      const res = await fetch(API(`/api/instructors/${inst.instructorID}/available-courses`), { headers: { Accept: 'application/json' }});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAvailableCourses(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (err: unknown) {
      console.error('Error loading available courses:', err);
      setAssignError(err instanceof Error ? err.message : 'Failed to load available courses');
    }
  };

  const submitAssign = async () => {
    if (!assignInstructor || !selectedCourseId) { setAssignError('Select a course'); return; }
    setAssignLoading(true);
    setAssignError(null);
    try {
      const res = await fetch(API('/api/instructor-courses/assign'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructorID: Number(assignInstructor.instructorID), courseID: Number(selectedCourseId) }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      setAssignOpen(false);
      setAssignInstructor(null);
      setSelectedCourseId('');
      // Reload all instructors to update course counts
      await fetchInstructors();
    } catch (err: unknown) {
      console.error('Assign error:', err);
      setAssignError(err instanceof Error ? err.message : 'Failed to assign');
    } finally {
      setAssignLoading(false);
    }
  };

  const API = (path: string) => {
    const base = import.meta.env.VITE_API_BASE ?? 'http://localhost:52103';
    return `${base}${path}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading instructors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p className="font-semibold">Error Loading Instructors</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Instructors</h2>
          <p className="text-muted-foreground">Manage teaching staff</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-destructive/10 text-destructive hover:bg-destructive/20" onClick={handleBulkDelete} disabled={selectedIds.length === 0 || bulkDeleting}>
            {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
          </Button>
          <Button variant="outline" onClick={handleRefreshCourses}>
            Refresh
          </Button>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Instructor
          </Button>
        </div>
      </div>

      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Instructor</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="space-y-2"><Label>First name</Label><Input value={addFirstName} onChange={(e) => setAddFirstName(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Last name</Label><Input value={addLastName} onChange={(e) => setAddLastName(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Password (min 6)</Label><Input type="password" minLength={6} value={addPassword} onChange={(e) => setAddPassword(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} /></div>
            <div className="space-y-2"><Label>Hire date</Label><Input type="date" value={addHireDate} onChange={(e) => setAddHireDate(e.target.value)} required /></div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={addDepartmentId} onChange={(e) => setAddDepartmentId(e.target.value)}>
                <option value="">— None —</option>
                {departments.map((d: Department) => (
                  <option key={d.departmentID ?? d.departmentId ?? d.id} value={d.departmentID ?? d.departmentId ?? d.id}>{d.name ?? d.departmentName ?? ''}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAddDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditDialog} onOpenChange={(open) => { if (!open) { setOpenEditDialog(false); setEditingInst(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Instructor</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="space-y-2"><Label>First name</Label><Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Last name</Label><Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} /></div>
            <div className="space-y-2"><Label>Hire date</Label><Input type="date" value={editHireDate} onChange={(e) => setEditHireDate(e.target.value)} required /></div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={editDepartmentId} onChange={(e) => setEditDepartmentId(e.target.value)}>
                <option value="">— None —</option>
                {departments.map((d: Department) => (
                  <option key={d.departmentID ?? d.departmentId ?? d.id} value={d.departmentID ?? d.departmentId ?? d.id}>{d.name ?? d.departmentName ?? ''}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <UserCheck className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{instructors.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <UserCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{instructors.length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{getTotalCoursesAssigned()}</p>
              <p className="text-sm text-muted-foreground">Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <UserCheck className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{getTotalStudentsAssigned()}</p>
              <p className="text-sm text-muted-foreground">Students</p>
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
              placeholder="Search instructors..."
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
                    <input type="checkbox" aria-label="Select all" onChange={toggleSelectAll} checked={filteredInstructors.length > 0 && filteredInstructors.every(i => selectedIds.includes(i.instructorID ?? i.id ?? -1))} />
                  </TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">Courses</TableHead>
                  <TableHead className="text-center">Students</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstructors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No instructors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInstructors.map((inst) => (
                    <TableRow key={inst.instructorID ?? inst.id ?? ''} className="hover:bg-muted/50">
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          aria-label={`Select instructor ${inst.firstMidName ?? inst.firstName}`}
                          checked={selectedIds.includes((inst.instructorID ?? inst.id) as number)}
                          onChange={() => { const id = inst.instructorID ?? inst.id; if (id) toggleSelect(id); }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-accent">
                              {(inst.firstName ?? inst.firstMidName ?? 'U')[0]}{(inst.lastName ?? 'K')[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{inst.firstName ?? inst.firstMidName} {inst.lastName}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {inst.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getDepartmentName(inst.departmentID ?? inst.departmentId)}</TableCell>
                      <TableCell className="text-center">{getCourseCount(inst)}</TableCell>
                      <TableCell className="text-center">{getStudentCount(inst)}</TableCell>
                      <TableCell className="text-center">★ 0</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor('Active')}>Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(inst)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignCourses(inst)}>
                              <BookOpen className="w-4 h-4 mr-2" />
                              Assign Courses
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const instId = inst.instructorID ?? inst.id;
                              navigate(`/dashboard/assign-instructor?instructor=${instId}`);
                            }}>
                              <LinkIcon className="w-4 h-4 mr-2" />
                              Quick Assign
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(inst)} disabled={deletingId === (inst.instructorID ?? inst.id)}>
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

export default Instructors;
