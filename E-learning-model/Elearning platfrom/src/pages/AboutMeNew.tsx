import { FC, ReactNode } from "react";
import { BookOpen, Users, BarChart3, Shield, Award, Target, Globe, TrendingUp } from "lucide-react";

const AboutMePage: FC = (): ReactNode => {
  return (
    <div style={{ background: "linear-gradient(to bottom right, #f9fafb, #e0e7ff)" }}>
      {/* Hero Section */}
      <section style={{ position: "relative", paddingTop: "6rem", paddingBottom: "6rem", paddingLeft: "1.5rem", paddingRight: "1.5rem", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(37, 99, 235, 0.05), rgba(79, 70, 229, 0.05))" }}></div>
        <div style={{ maxWidth: "80rem", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{display: "inline-flex", alignItems: "center", gap: "0.5rem", paddingLeft: "1rem", paddingRight: "1rem", paddingTop: "0.5rem", paddingBottom: "0.5rem", background: "#dbeafe", color: "#1e40af", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: 500, marginBottom: "2rem" }}>
            <BookOpen style={{ width: "16px", height: "16px" }} />
            <span>Educational Excellence</span>
          </div>

          <h1 style={{ fontSize: "3.5rem", fontWeight: "bold", color: "#111827", marginBottom: "1.5rem", lineHeight: 1.2 }}>
            Transforming Education Through
            <span style={{ display: "block", background: "linear-gradient(to right, #2563eb, #4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Digital Innovation
            </span>
          </h1>

          <p style={{ fontSize: "1.25rem", color: "#4b5563", maxWidth: "48rem", margin: "0 auto 2rem", lineHeight: 1.75 }}>
            Empowering learners worldwide with cutting-edge technology, comprehensive course offerings,
            and personalized learning experiences that drive academic and professional success.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "center", flexWrap: "wrap", gridAutoFlow: "column", columnGap: "1rem", marginTop: "2rem" }}>
            <button style={{ paddingLeft: "2rem", paddingRight: "2rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", background: "#2563eb", color: "white", fontWeight: 600, borderRadius: "0.5rem", border: "none", cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
              Start Learning Today
            </button>
            <button style={{ paddingLeft: "2rem", paddingRight: "2rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", border: "2px solid #2563eb", color: "#2563eb", fontWeight: 600, borderRadius: "0.5rem", background: "white", cursor: "pointer" }}>
              Become an Instructor
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{ paddingTop: "4rem", paddingBottom: "4rem", paddingLeft: "1.5rem", paddingRight: "1.5rem", background: "white" }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#2563eb", marginBottom: "0.5rem" }}>50K+</div>
              <div style={{ color: "#4b5563", fontWeight: 500 }}>Active Learners</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#4f46e5", marginBottom: "0.5rem" }}>1,200+</div>
              <div style={{ color: "#4b5563", fontWeight: 500 }}>Expert Instructors</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#7c3aed", marginBottom: "0.5rem" }}>500+</div>
              <div style={{ color: "#4b5563", fontWeight: 500 }}>Quality Courses</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#16a34a", marginBottom: "0.5rem" }}>98%</div>
              <div style={{ color: "#4b5563", fontWeight: 500 }}>Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section style={{ paddingTop: "5rem", paddingBottom: "5rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827", marginBottom: "1rem" }}>
              Our Core Values
            </h2>
            <p style={{ fontSize: "1.25rem", color: "#4b5563", maxWidth: "48rem", margin: "0 auto" }}>
              Built on principles that ensure quality education, innovation, and accessibility for everyone
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            {[
              { icon: Target, title: "Excellence", color: "#2563eb", bgColor: "#dbeafe", text: "We maintain the highest standards in educational content, platform reliability, and user experience." },
              { icon: Award, title: "Innovation", color: "#16a34a", bgColor: "#dcfce7", text: "Continuously evolving our platform with cutting-edge technology and modern teaching methodologies." },
              { icon: Globe, title: "Accessibility", color: "#7c3aed", bgColor: "#f3e8ff", text: "Making quality education accessible to learners worldwide, regardless of location or background." },
              { icon: Users, title: "Community", color: "#4f46e5", bgColor: "#e0e7ff", text: "Fostering a supportive learning community where students and instructors collaborate." },
              { icon: TrendingUp, title: "Growth", color: "#ea580c", bgColor: "#fed7aa", text: "Providing tools and insights that enable continuous learning and professional development." },
              { icon: Shield, title: "Security", color: "#dc2626", bgColor: "#fee2e2", text: "Implementing enterprise-grade security measures to protect user data and ensure privacy." }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} style={{ background: "white", border: "none", borderRadius: "0.75rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", padding: "1.5rem", transition: "all 0.3s ease" }}>
                  <div style={{ paddingBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                      <div style={{ padding: "0.75rem", background: item.bgColor, borderRadius: "0.75rem" }}>
                        <Icon style={{ width: "32px", height: "32px", color: item.color }} />
                      </div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827", margin: 0 }}>{item.title}</h3>
                    </div>
                  </div>
                  <p style={{ color: "#4b5563", lineHeight: 1.5, margin: 0 }}>
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ paddingTop: "5rem", paddingBottom: "5rem", paddingLeft: "1.5rem", paddingRight: "1.5rem", background: "linear-gradient(to right, #2563eb, #4f46e5)", color: "white" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
            Ready to Transform Your Learning Experience?
          </h2>
          <p style={{ fontSize: "1.25rem", marginBottom: "2rem", opacity: 0.9 }}>
            Join thousands of learners who have already discovered the power of our platform.
          </p>

          <button style={{ paddingLeft: "2rem", paddingRight: "2rem", paddingTop: "1rem", paddingBottom: "1rem", background: "white", color: "#2563eb", fontWeight: 600, borderRadius: "0.5rem", border: "none", cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)" }}>
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutMePage;
