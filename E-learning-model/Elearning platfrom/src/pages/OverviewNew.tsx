import { Link } from "react-router-dom";
import "./Overview.css";
import { FC, ReactNode } from "react";

interface Card {
  to: string;
  label: string;
  desc: string;
}

const OverviewPage: FC = (): ReactNode => {
  const cards: Card[] = [
    { to: "/departments", label: "Departments", desc: "Manage departments" },
    { to: "/courses", label: "Courses", desc: "Manage courses" },
    { to: "/instructors", label: "Instructors", desc: "Manage instructors" },
    { to: "/students", label: "Students", desc: "Manage students" },
    { to: "/enrollments", label: "Enrollments", desc: "Manage course enrollments" },
    { to: "/analysis", label: "Analysis", desc: "System metrics & performance" },
  ];

  return (
    <div className="overview animate-fade-in">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>E-Learning management overview</p>
      </div>
      <div className="overview-grid">
        {cards.map(({ to, label, desc }, i) => (
          <Link key={to} to={to} className="overview-card animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <h3>{label}</h3>
            <p>{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OverviewPage;
