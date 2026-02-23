import { Menu, X, Search, BookOpen, LayoutDashboard, Building2, Users, FileText, Briefcase } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/#courses" },
    { name: "Categories", href: "/#categories" },
    { name: "Analytics", href: "/analytics" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Assign Instructor", href: "/dashboard/assign-instructor" },
    { name: "Instructor Enrollment", href: "/dashboard/instructor-enrollment" },
  ];

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Building2, label: "Departments", href: "/dashboard/departments" },
    { icon: BookOpen, label: "Courses", href: "/dashboard/courses" },
    { icon: Users, label: "Instructors", href: "/dashboard/instructors" },
    { icon: Users, label: "Students", href: "/dashboard/students" },
    { icon: FileText, label: "Enrollments", href: "/dashboard/enrollments" },
    { icon: Briefcase, label: "Assign Instructor", href: "/dashboard/assign-instructor" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">CourseHub</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="accent">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors font-medium text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}

              {/* Dashboard Menu Items */}
              <div className="px-4 py-3 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">DASHBOARD</p>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
