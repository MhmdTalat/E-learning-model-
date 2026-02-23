import { useState, useEffect } from 'react';
import { BookOpen, Code, Palette, TrendingUp, Users, Database, Globe, Briefcase } from "lucide-react";
import { departmentsAPI, coursesAPI } from '@/lib/api';

interface Department {
  departmentID: string;
  departmentName: string;
  budget?: number;
}

interface Course {
  courseID?: string;
  title?: string;
  departmentID?: string;
  [key: string]: unknown;
}

const iconMap = [
  Code,
  Palette,
  TrendingUp,
  Users,
  Database,
  Globe,
  Briefcase,
  BookOpen,
];

const colorMap = [
  "bg-blue-500/10 text-blue-600",
  "bg-pink-500/10 text-pink-600",
  "bg-green-500/10 text-green-600",
  "bg-purple-500/10 text-purple-600",
  "bg-orange-500/10 text-orange-600",
  "bg-indigo-500/10 text-indigo-600",
  "bg-cyan-500/10 text-cyan-600",
  "bg-rose-500/10 text-rose-600",
];

const CategoriesSection = () => {
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    courseCount: number;
    icon: React.ElementType;
    color: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, coursesRes] = await Promise.all([
          departmentsAPI.getAll().catch(() => ({ data: [] })),
          coursesAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const departments: Department[] = Array.isArray(deptRes?.data) ? deptRes.data : [];
        const courses: Course[] = Array.isArray(coursesRes?.data) ? coursesRes.data : [];

        const categoryList = departments.map((dept, index) => {
          const deptCourses = courses.filter(
            (course) => course.departmentID === dept.departmentID
          );
          return {
            id: dept.departmentID,
            name: dept.departmentName,
            courseCount: deptCourses.length,
            icon: iconMap[index % iconMap.length],
            color: colorMap[index % colorMap.length],
          };
        });

        setCategories(categoryList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
            Departments
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
            Explore Academic Departments
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse courses across all our departments and find the perfect learning path for your goals.
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading departments...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No departments found.</p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${category.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <category.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.courseCount} {category.courseCount === 1 ? 'Course' : 'Courses'}
              </p>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
