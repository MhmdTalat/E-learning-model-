import { useState, useEffect } from 'react';
import { Star, Quote } from "lucide-react";
import { studentsAPI } from '@/lib/api';

interface Student {
  studentID?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: unknown;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  content: string;
  rating: number;
}

const testimonialTemplates = [
  "This platform has been a game-changer for my learning journey. The quality of instruction is outstanding and the community support is incredible!",
  "I've taken many online courses, but the structured curriculum and hands-on projects here really stand out. Highly recommend!",
  "The flexibility to learn at my own pace while accessing world-class content is exactly what I needed. Thank you!",
  "From beginner to confident learner - this platform made it possible. The instructors genuinely care about student success.",
  "Excellent courses with real-world applications. I've already applied what I learned in my professional work.",
  "The best learning experience I've had. Clear explanations, practical examples, and a supportive learning environment.",
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await studentsAPI.getAll().catch(() => ({ data: [] }));
        const students: Student[] = Array.isArray(res?.data) ? res.data : [];

        const generated = students.slice(0, 3).map((student, index) => ({
          id: student.studentID || `student-${index}`,
          name: `${student.firstName || 'Student'} ${student.lastName || ''}`.trim(),
          role: 'Active Learner',
          image: `https://i.pravatar.cc/150?img=${Math.abs((student.firstName?.charCodeAt(0) || 0) + index * 7) % 70}`,
          content: testimonialTemplates[index % testimonialTemplates.length],
          rating: 5,
        }));

        setTestimonials(generated.length > 0 ? generated : getDefaults());
      } catch {
        setTestimonials(getDefaults());
      } finally {
        setLoading(false);
      }
    };

    const getDefaults = (): Testimonial[] => [
      {
        id: '1',
        name: 'Student One',
        role: 'Active Learner',
        image: 'https://i.pravatar.cc/150?img=10',
        content: 'This platform has been a game-changer for my learning journey. The quality of instruction is outstanding and the community support is incredible!',
        rating: 5,
      },
      {
        id: '2',
        name: 'Student Two',
        role: 'Active Learner',
        image: 'https://i.pravatar.cc/150?img=20',
        content: "I've taken many online courses, but the structured curriculum and hands-on projects here really stand out. Highly recommend!",
        rating: 5,
      },
      {
        id: '3',
        name: 'Student Three',
        role: 'Active Learner',
        image: 'https://i.pravatar.cc/150?img=30',
        content: 'The flexibility to learn at my own pace while accessing world-class content is exactly what I needed. Thank you!',
        rating: 5,
      },
    ];

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
            Student Success Stories
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from our active learners about their transformative learning experiences and achievements.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-up relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-accent/20" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-accent/20"
                />
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
