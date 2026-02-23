import { BookOpen, Users, Award, TrendingUp } from "lucide-react";

const stats = [
  { icon: BookOpen, value: "500+", label: "Expert Courses" },
  { icon: Users, value: "50K+", label: "Active Students" },
  { icon: Award, value: "200+", label: "Certified Instructors" },
  { icon: TrendingUp, value: "95%", label: "Success Rate" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/20 mb-4">
                <stat.icon className="w-7 h-7 text-accent" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-primary-foreground/70 text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
