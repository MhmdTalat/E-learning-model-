import { useState, FC, FormEvent, ChangeEvent, ReactNode } from "react";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";

interface ConnectFormData {
  name: string;
  email: string;
  message: string;
}

const ConnectPage: FC = (): ReactNode => {
  const [formData, setFormData] = useState<ConnectFormData>({
    name: "",
    email: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Form submitted:", formData);
    setSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom right, #f9fafb, #e0e7ff)", paddingTop: "3rem", paddingBottom: "3rem", paddingLeft: "1rem", paddingRight: "1rem" }}>
      <div style={{ maxWidth: "40rem", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", paddingLeft: "1rem", paddingRight: "1rem", paddingTop: "0.5rem", paddingBottom: "0.5rem", background: "rgba(234, 88, 12, 0.2)", borderRadius: "9999px", color: "#ea580c", marginBottom: "1.5rem", fontSize: "0.875rem", fontWeight: 500 }}>
            <Mail style={{ width: "16px", height: "16px" }} />
            <span>Get In Touch</span>
          </div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#111827", marginBottom: "1rem", fontFamily: "serif" }}>
            We'd Love to Hear From You
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#4b5563", maxWidth: "42rem", margin: "0 auto" }}>
            Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div style={{ background: "white", borderRadius: "0.75rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1.5rem", paddingBottom: "0 " }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", fontFamily: "serif", margin: "0 0 0.5rem 0" }}>Contact Form</h2>
            <p style={{ color: "#666", fontSize: "0.875rem", margin: 0 }}>
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>
          <div style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
            {submitted && (
              <div style={{ display: "flex", gap: "0.75rem", padding: "1rem", background: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: "0.375rem", marginBottom: "1.5rem", alignItems: "center" }}>
                <CheckCircle style={{ width: "16px", height: "16px", color: "#059669", flexShrink: 0 }} />
                <p style={{ color: "#059669", fontWeight: 500, margin: 0 }}>
                  Thank you for your message! We'll get back to you soon.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label htmlFor="name" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "0.375rem", fontSize: "1rem" }}
                />
              </div>

              <div>
                <label htmlFor="email" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "0.375rem", fontSize: "1rem" }}
                />
                <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem" }}>
                  We'll never share your email with anyone else.
                </p>
              </div>

              <div>
                <label htmlFor="message" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  required
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "0.375rem", fontSize: "1rem", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{display: "flex", alignItems: "center", gap: "0.5rem", paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", background: "#2563eb", color: "white", borderRadius: "0.375rem", border: "none", fontWeight: 600, cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{ width: "16px", height: "16px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: "0.5rem" }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send style={{ width: "16px", height: "16px" }} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectPage;
