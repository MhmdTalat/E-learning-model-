import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { departmentsAPI, instructorsAPI, coursesAPI, enrollmentsAPI } from '@/lib/api';

interface ApiResponse<T> {
  data?: T;
}

type ApiResult<T> = T[] | ApiResponse<T[]>;

interface Department {
  departmentId?: number;
  id?: number;
  name?: string;
  budget?: number;
  startDate?: string;
  instructorId?: number | null;
  administratorName?: string | null;
  courseCount?: number;
  studentCount?: number;
  instructorCount?: number;
  administrator?: Record<string, unknown>;
  courses?: Record<string, unknown>[];
  instructors?: Record<string, unknown>[];
}

// Raw API shapes used for safer typing of responses
interface RawDept {
  departmentID?: number | string;
  departmentId?: number | string;
  id?: number | string;
  name?: string;
  budget?: number;
  startDate?: string;
  instructorID?: number | null;
  instructorId?: number | null;
  administrator?: Record<string, unknown> | null;
  administratorName?: string | null;
  courses?: unknown[];
  instructors?: unknown[];
}

interface RawCourse {
  courseID?: number | string;
  courseId?: number | string;
  id?: number | string;
  departmentID?: number | string;
  departmentId?: number | string;
}

interface RawEnrollment {
  enrollmentID?: number | string;
  enrollmentId?: number | string;
  id?: number | string;
  courseID?: number | string;
  courseId?: number | string;
  studentID?: number | string;
  studentId?: number | string;
}

interface RawInstructor {
  instructorID?: number | string;
  instructorId?: number | string;
  id?: number | string;
  departmentID?: number | string;
  departmentId?: number | string;
  firstMidName?: string;
  firstName?: string;
  lastName?: string;
}

// Helper to safely extract array from ApiResult<T>
function getResultArray<T>(res: ApiResult<T> | unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === 'object' && 'data' in res) {
    const r = res as { data?: unknown };
    const d = r.data;
    if (Array.isArray(d)) return d as T[];
  }
  return [];
}

const Departments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [instructors, setInstructors] = useState<{ instructorID?: number; id?: number; firstMidName?: string; firstName?: string; lastName?: string }[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('0');
  const [newStartDate, setNewStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState('0');
  const [editStartDate, setEditStartDate] = useState('');
  const [editInstructorId, setEditInstructorId] = useState<string>('');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all required data in parallel (responses can be arrays or { data: [...] })
      const [deptResponse, coursesData, enrollmentsData, instructorsData] = (await Promise.all([
        departmentsAPI.getAll(),
        coursesAPI.getAll(),
        enrollmentsAPI.getAll(),
        instructorsAPI.getAll(),
      ])) as [ApiResult<RawDept>, ApiResult<RawCourse>, ApiResult<RawEnrollment>, ApiResult<RawInstructor>];

      // Get department array
      let deptArray = getResultArray<RawDept>(deptResponse);
      if (typeof deptArray === 'string') {
        try {
          deptArray = JSON.parse(deptArray as unknown as string);
        } catch {
          deptArray = [];
        }
      }
      if (!Array.isArray(deptArray)) deptArray = [];

      // Create maps for aggregation
      const coursesMap: Record<string, number> = {}; // deptId -> course count
      const studentsPerDept: Record<string, Set<string>> = {}; // deptId -> Set of studentIds
      const instructorsPerDept: Record<string, Set<string>> = {}; // deptId -> Set of instructorIds

      // Process courses - map courses to departments
      const coursesList: RawCourse[] = getResultArray<RawCourse>(coursesData);
      coursesList.forEach((course: Record<string, unknown>) => {
        const deptId = (course.departmentID ?? course.departmentId)?.toString() || '';
        if (deptId) {
          coursesMap[deptId] = (coursesMap[deptId] || 0) + 1;
        }
      });

      // Process enrollments - count students per department
      const enrollmentsList: RawEnrollment[] = getResultArray<RawEnrollment>(enrollmentsData);
      enrollmentsList.forEach((enrollment: Record<string, unknown>) => {
        const courseId = (enrollment.courseID ?? enrollment.courseId)?.toString() || '';
        const studentId = (enrollment.studentID ?? enrollment.studentId)?.toString() || '';
        
        // Find which department this course belongs to
        const course = coursesList.find(
          (c: Record<string, unknown>) => (c.courseID ?? c.courseId ?? c.id)?.toString() === courseId
        );
        
        if (course && studentId) {
          const deptId = (course.departmentID ?? course.departmentId)?.toString() || '';
          if (deptId) {
            if (!studentsPerDept[deptId]) studentsPerDept[deptId] = new Set();
            studentsPerDept[deptId].add(studentId);
          }
        }
      });

      // Process instructors - count per department
      const instructorsList: RawInstructor[] = getResultArray<RawInstructor>(instructorsData);
      instructorsList.forEach((instructor: Record<string, unknown>) => {
        const deptId = (instructor.departmentID ?? instructor.departmentId)?.toString() || '';
        if (deptId) {
          if (!instructorsPerDept[deptId]) instructorsPerDept[deptId] = new Set();
          instructorsPerDept[deptId].add((instructor.instructorID ?? instructor.instructorId ?? instructor.id)?.toString() || '');
        }
      });

      // Map departments with aggregated counts
      const mappedDepts: Department[] = (deptArray as RawDept[]).map((dept: RawDept) => {
        const rawId = dept.departmentID ?? dept.departmentId ?? dept.id;
        const deptIdStr = rawId != null ? String(rawId) : '';
        const idNum = deptIdStr !== '' && !Number.isNaN(Number(deptIdStr)) ? Number(deptIdStr) : undefined;
        const admin = dept.administrator as Record<string, unknown> | undefined;
        const deptKey = idNum != null ? String(idNum) : (deptIdStr || '');
        return {
          departmentId: idNum,
          id: idNum,
          name: dept.name || '',
          budget: dept.budget,
          startDate: dept.startDate,
          instructorId: dept.instructorID ?? dept.instructorId,
          administratorName: dept.administratorName ?? (admin ? `${admin.firstMidName ?? ''} ${admin.lastName ?? ''}`.trim() : null),
          courseCount: coursesMap[deptKey] ?? 0,
          studentCount: studentsPerDept[deptKey]?.size ?? 0,
          instructorCount: instructorsPerDept[deptKey]?.size ?? 0,
          administrator: dept.administrator,
          courses: dept.courses,
          instructors: dept.instructors,
        } as Department;
      });
      
      setDepartments(mappedDepts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load departments');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (openEditDialog) {
      instructorsAPI.getAll()
        .then((res: ApiResult<RawInstructor>) => {
          const data = getResultArray<RawInstructor>(res);
          setInstructors(data as Array<{ instructorID?: number; id?: number; firstMidName?: string; firstName?: string; lastName?: string }>);
        })
        .catch(() => setInstructors([]));
    }
  }, [openEditDialog]);

  const handleOpenAdd = () => {
    setCreateError(null);
    setNewName('');
    setNewBudget('0');
    setNewStartDate(new Date().toISOString().slice(0, 10));
    setOpenAddDialog(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      const budget = parseFloat(newBudget);
      if (Number.isNaN(budget) || budget < 0) {
        setCreateError('Budget must be a non-negative number.');
        return;
      }
      await departmentsAPI.create({
        name: newName.trim(),
        budget: Number(budget),
        startDate: newStartDate || new Date().toISOString().slice(0, 10),
        instructorID: null,
      });
      setOpenAddDialog(false);
      await fetchDepartments();
    } catch (err: unknown) {
      const errObj = err as Record<string, unknown> & { message?: string; response?: Record<string, unknown> };
      const data = (errObj?.response as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
      const msg = (typeof data?.message === 'string' ? data.message : '') ?? (typeof data?.inner === 'string' ? data.inner : '') ?? (typeof errObj?.message === 'string' ? errObj.message : 'Failed to create department');
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setEditName(dept.name ?? '');
    setEditBudget(String(dept.budget ?? 0));
    setEditStartDate(dept.startDate ? dept.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setEditInstructorId(dept.instructorId != null ? String(dept.instructorId) : '');
    setEditError(null);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept?.departmentId && editingDept?.id == null) return;
    setEditError(null);
    setUpdating(true);
    const id = editingDept!.departmentId ?? editingDept!.id!;
    try {
      const budget = parseFloat(editBudget);
      if (Number.isNaN(budget) || budget < 0) {
        setEditError('Budget must be a non-negative number.');
        return;
      }
      await departmentsAPI.update({
        departmentID: id,
        name: editName.trim(),
        budget: Number(budget),
        startDate: editStartDate || new Date().toISOString().slice(0, 10),
        instructorID: editInstructorId ? parseInt(editInstructorId, 10) : null,
      });
      setOpenEditDialog(false);
      setEditingDept(null);
      await fetchDepartments();
    } catch (err: unknown) {
      const errObj = err as Record<string, unknown> & { message?: string; response?: Record<string, unknown> };
      const data = (errObj?.response as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
      const msg = (typeof data?.message === 'string' ? data.message : '') ?? (typeof data?.inner === 'string' ? data.inner : '') ?? (typeof errObj?.message === 'string' ? errObj.message : 'Failed to update department');
      setEditError(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    const id = dept.departmentId ?? dept.id;
    if (id == null) return;
    if (!confirm(`Delete department "${dept.name || 'N/A'}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await departmentsAPI.delete(id);
      await fetchDepartments();
      setSelectedIds(prev => prev.filter(x => x !== id));
    } catch (err: unknown) {
      const errObj = err as Record<string, unknown> & { message?: string; response?: Record<string, unknown> };
      const data = (errObj?.response as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
      const msg = (typeof data?.message === 'string' ? data.message : '') ?? (typeof errObj?.message === 'string' ? errObj.message : 'Failed to delete department');
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const allIds = filteredDepartments.map(d => d.departmentId ?? d.id).filter(Boolean) as number[];
    const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(allIds);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected department(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => departmentsAPI.delete(id)));
      await fetchDepartments();
      setSelectedIds([]);
    } catch (err: unknown) {
      const errObj = err as Record<string, unknown> & { message?: string; response?: Record<string, unknown> };
      const data = (errObj?.response as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
      const msg = (typeof data?.message === 'string' ? data.message : '') ?? (typeof errObj?.message === 'string' ? errObj.message : 'Failed to delete selected');
      alert(msg);
    } finally {
      setBulkDeleting(false);
    }
  };

  const filteredDepartments = (Array.isArray(departments) ? departments : [])
    .filter(dept => {
      const deptName = (dept.name || '').toLowerCase();
      return deptName.includes(searchTerm.toLowerCase());
    });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading departments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p className="font-semibold">Error Loading Departments</p>
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
          <h2 className="text-2xl font-bold text-foreground">Departments</h2>
          <p className="text-muted-foreground">Manage academic departments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-destructive/10 text-destructive hover:bg-destructive/20" onClick={handleBulkDelete} disabled={selectedIds.length === 0 || bulkDeleting}>
            {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
          </Button>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {createError && (
              <p className="text-sm text-destructive">{createError}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="dept-name">Name</Label>
              <Input
                id="dept-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Department name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-budget">Budget</Label>
              <Input
                id="dept-budget"
                type="number"
                min={0}
                step={1000}
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-start">Start Date</Label>
              <Input
                id="dept-start"
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditDialog} onOpenChange={(open) => { if (!open) { setOpenEditDialog(false); setEditingDept(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && <p className="text-sm text-destructive">{editError}</p>}
            <div className="space-y-2">
              <Label htmlFor="edit-dept-name">Name</Label>
              <Input id="edit-dept-name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Department name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept-budget">Budget</Label>
              <Input id="edit-dept-budget" type="number" min={0} step={1000} value={editBudget} onChange={(e) => setEditBudget(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept-start">Start Date</Label>
              <Input id="edit-dept-start" type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept-head">Head (Instructor)</Label>
              <select
                id="edit-dept-head"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={editInstructorId}
                onChange={(e) => setEditInstructorId(e.target.value)}
              >
                <option value="">— None —</option>
                {instructors.map((i) => (
                  <option key={i.instructorID ?? i.id ?? ''} value={i.instructorID ?? i.id ?? ''}>
                    {(i.firstMidName ?? i.firstName ?? '')} {(i.lastName ?? '')}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={updating}>{updating ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{departments.length}</p>
                <p className="text-sm text-muted-foreground">Total Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Building2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{departments.reduce((sum, dept) => sum + (dept.courseCount ?? 0), 0)}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{departments.reduce((sum, dept) => sum + (dept.studentCount ?? 0), 0)}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 text-center">
                      <input type="checkbox" aria-label="Select all" onChange={toggleSelectAll} checked={filteredDepartments.length > 0 && filteredDepartments.every(d => selectedIds.includes(d.departmentId ?? d.id ?? -1))} />
                    </TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Head</TableHead>
                    <TableHead className="text-center">Courses</TableHead>
                    <TableHead className="text-center">Instructors</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No departments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((dept) => (
                    <TableRow key={dept.departmentId ?? dept.id ?? dept.name ?? ''} className="hover:bg-muted/50">
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          aria-label={`Select department ${dept.name}`}
                          checked={selectedIds.includes((dept.departmentId ?? dept.id) as number)}
                          onChange={() => { const id = dept.departmentId ?? dept.id; if (id) toggleSelect(id); }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{dept.name || 'N/A'}</TableCell>
                      <TableCell>{dept.departmentId ?? dept.id ?? '—'}</TableCell>
                      <TableCell>{dept.administratorName || '—'}</TableCell>
                      <TableCell className="text-center">{dept.courseCount ?? 0}</TableCell>
                      <TableCell className="text-center">{dept.instructorCount ?? 0}</TableCell>
                      <TableCell className="text-center">{dept.studentCount ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(dept)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(dept)}
                              disabled={deletingId === (dept.departmentId ?? dept.id)}
                            >
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

export default Departments;
