import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { studentsAPI, coursesAPI } from '@/lib/api';

const HeroSection = () => {
  const [stats, setStats] = useState({
    totalStudents: 50000,
    totalCourses: 500,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          studentsAPI.getAll().catch(() => ({ data: [] })),
          coursesAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const studentCount = Array.isArray(studentsRes?.data) ? studentsRes.data.length : 0;
        const courseCount = Array.isArray(coursesRes?.data) ? coursesRes.data.length : 0;

        setStats({
          totalStudents: studentCount > 0 ? studentCount * 100 : 50000,
          totalCourses: courseCount > 0 ? courseCount : 500,
        });
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  return (
    <section className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/50 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-accent mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">New courses added weekly</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 font-serif leading-tight">
              Unlock Your
              <span className="block text-gradient">Learning Potential</span>
            </h1>
            
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Access world-class education from industry experts. Build real-world skills with hands-on projects and earn recognized certifications.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl">
                Explore Courses
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="hero-outline" size="xl">
                Start Free Trial
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/40?img=${i + 10}`}
                    alt="Student"
                    className="w-10 h-10 rounded-full border-2 border-primary-foreground"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="text-primary-foreground font-semibold">{stats.totalStudents.toLocaleString()}+ Students</div>
                <div className="text-primary-foreground/70 text-sm">Join our community</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=500&fit=crop"
                alt="Students learning"
                className="rounded-2xl shadow-2xl"
              />
              
              {/* Floating Card 1 */}
              <div className="absolute -left-8 top-1/4 bg-card p-4 rounded-xl shadow-xl animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{stats.totalCourses}+ Courses</div>
                    <div className="text-xs text-muted-foreground">Expert-led content</div>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div className="absolute -right-4 bottom-1/4 bg-card p-4 rounded-xl shadow-xl animate-bounce-slow" style={{ animationDelay: "500ms" }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{stats.totalStudents.toLocaleString()}+ Students</div>
                    <div className="text-xs text-muted-foreground">Active learners</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
