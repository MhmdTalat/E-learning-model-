import { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit, Trash2, MoreHorizontal, Clock, Users, Star } from 'lucide-react';
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
import { coursesAPI, departmentsAPI } from '@/lib/api';

interface Course {
  id?: number;
  courseID?: number;
  title?: string;
  courseName?: string;
  courseCode?: string;
  credits: number;
  departmentId?: number;
  departmentID?: number;
  description?: string;
}

interface Department {
  id?: number;
  departmentID?: number;
  departmentId?: number;
  name?: string;
  departmentName?: string;
}

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [addTitle, setAddTitle] = useState('');
  const [addCredits, setAddCredits] = useState(3);
  const [addDepartmentId, setAddDepartmentId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCredits, setEditCredits] = useState(3);
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.getAll();
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (openAddDialog || openEditDialog) {
      departmentsAPI.getAll()
        .then((res: { data: Department[] }) => setDepartments(Array.isArray(res?.data) ? res.data : []))
        .catch(() => setDepartments([]));
    }
  }, [openAddDialog, openEditDialog]);

  const handleOpenAdd = () => {
    setAddTitle('');
    setAddCredits(3);
    setAddDepartmentId('');
    setFormError(null);
    setOpenAddDialog(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle) {
      setFormError('Course name is required');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        Title: addTitle,
        Credits: addCredits,
      };
      if (addDepartmentId) {
        payload.DepartmentID = addDepartmentId;
      }
      await coursesAPI.create(payload);
      setOpenAddDialog(false);
      await fetchCourses();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err ? (err as AxiosError<{ message?: string }>).response?.data?.message ?? err.message : err instanceof Error ? err.message : 'Failed to create course';
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setEditTitle(course.courseName ?? course.title ?? '');
    setEditCredits(course.credits);
    setEditDepartmentId(course.departmentID != null ? String(course.departmentID) : (course.departmentId != null ? String(course.departmentId) : ''));
    setFormError(null);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingCourse?.courseID ?? editingCourse?.id;
    if (id == null) return;
    if (!editTitle) {
      setFormError('Course name is required');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        CourseID: id,
        Title: editTitle,
        Credits: editCredits,
      };
      if (editDepartmentId) {
        payload.DepartmentID = editDepartmentId;
      }
      await coursesAPI.update(payload);
      setOpenEditDialog(false);
      setEditingCourse(null);
      await fetchCourses();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err ? (err as AxiosError<{ message?: string }>).response?.data?.message ?? err.message : err instanceof Error ? err.message : 'Failed to update course';
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (course: Course) => {
    const id = course.courseID ?? course.id;
    if (id == null) return;
    if (!confirm(`Delete course "${course.courseName ?? course.title}"?`)) return;
    setDeletingId(id);
    try {
      await coursesAPI.delete(id);
      await fetchCourses();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err ? (err as AxiosError<{ message?: string }>).response?.data?.message ?? err.message : err instanceof Error ? err.message : 'Failed to delete';
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCourses = (Array.isArray(courses) ? courses : []).filter(course => {
    const title = (course.courseName ?? course.title ?? '').toLowerCase();
    const desc = (course.description ?? '').toLowerCase();
    return title.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p className="font-semibold">Error Loading Courses</p>
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
          <h2 className="text-2xl font-bold text-foreground">Courses</h2>
          <p className="text-muted-foreground">Manage and organize courses</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground button-hover" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 grid-item-stagger">
        <Card className="border-border card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{courses.length}</p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{courses.length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {courses.reduce((sum, c) => sum + c.credits, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Credits</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground">Completion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-item-stagger">
          {filteredCourses.map((course, i) => (
            <Card 
              key={course.courseID ?? course.id} 
              className="group border-border card-hover overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-primary/50" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                  {course.courseName ?? course.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{course.description || 'No description'}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.credits} Credits
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Badge className="bg-accent/10 text-accent">Active</Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(course)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(course)} disabled={deletingId === (course.courseID ?? course.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Course Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Course</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="space-y-2"><Label>Course Name</Label><Input value={addTitle} onChange={(e) => setAddTitle(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Credits</Label><Input type="number" min="0" max="10" value={addCredits} onChange={(e) => setAddCredits(parseInt(e.target.value, 10))} required /></div>
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

      {/* Edit Course Dialog */}
      <Dialog open={openEditDialog} onOpenChange={(open) => { if (!open) { setOpenEditDialog(false); setEditingCourse(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Course</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="space-y-2"><Label>Course Name</Label><Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Credits</Label><Input type="number" min="0" max="10" value={editCredits} onChange={(e) => setEditCredits(parseInt(e.target.value, 10))} required /></div>
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
    </div>
  );
};

export default Courses;
