import { useState, useEffect } from 'react';
import { Star, Clock, Users, PlayCircle } from "lucide-react";
import { Button } from "./ui/button";
import { coursesAPI, studentsAPI } from '@/lib/api';

interface Course {
  courseID?: string;
  title?: string;
  courseName?: string;
  studentCount?: number;
  [key: string]: unknown;
}

interface DisplayCourse {
  id: string;
  title: string;
  instructor: string;
  image: string;
  rating: number;
  students: number;
  duration: string;
  price: number;
  originalPrice: number;
  category: string;
  bestseller: boolean;
}

const CoursesSection = () => {
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [coursesRes] = await Promise.all([
          coursesAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const coursesList: Course[] = Array.isArray(coursesRes?.data) ? coursesRes.data : [];

        const displayCourses = coursesList.slice(0, 4).map((course, index) => ({
          id: course.courseID || `course-${index}`,
          title: course.title || course.courseName || `Course ${index + 1}`,
          instructor: 'Expert Instructor',
          image: `https://images.unsplash.com/photo-${[
            '1498050108023-c5249f4df085',
            '1561070791-2526d30994b5',
            '1551288049-bebda4e38f71',
            '1432888622747-4eb9a8f2a002'
          ][index % 4]}?w=400&h=250&fit=crop`,
          rating: 4.5 + Math.random() * 0.5,
          students: course.studentCount || Math.floor(Math.random() * 10000) + 5000,
          duration: `${Math.floor(Math.random() * 40) + 20} hours`,
          price: Math.floor(Math.random() * 60) + 40,
          originalPrice: Math.floor(Math.random() * 100) + 100,
          category: 'Featured',
          bestseller: index < 2,
        }));

        setCourses(displayCourses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14">
          <div>
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
              Featured Courses
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
              Expand Your Knowledge
            </h2>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0">
            View All Courses
          </Button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {course.bestseller && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-warning text-warning-foreground text-xs font-bold rounded-full">
                    Bestseller
                  </span>
                )}
                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <PlayCircle className="w-14 h-14 text-primary-foreground" />
                </div>
              </div>

              <div className="p-5">
                <span className="text-xs font-medium text-accent">{course.category}</span>
                <h3 className="font-semibold text-foreground mt-1 mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-medium text-foreground">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <span className="text-xl font-bold text-foreground">${course.price}</span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${course.originalPrice}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses available at this time.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesSection;
