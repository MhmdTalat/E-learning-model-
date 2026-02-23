import { useState, useEffect, FC, ReactNode, ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { User as UserIcon, Mail, Shield, Calendar, AlertCircle, Loader2, Edit, Save, X, CheckCircle } from "lucide-react";
import type { User } from "@/types";

interface UserFormData {
  userName: string;
  email: string;
  role: number;
}

const ROLES: { value: number; label: User["role"] }[] = [
  { value: 1, label: "Student" },
  { value: 2, label: "Instructor" },
  { value: 3, label: "Admin" },
];

const UserProfilePage: FC = (): ReactNode => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    userName: "",
    email: "",
    role: 1
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setProfile(user as any);
        const roleValue = user.role === "Student" ? 1 : user.role === "Instructor" ? 2 : user.role === "Admin" ? 3 : 1;
        setFormData({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userName: (user as any).userName || user.email?.split("@")[0] || "",
          email: user.email || "",
          role: roleValue
        });
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (): void => {
    setIsEditing(true);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  const handleCancel = (): void => {
    if (profile) {
      const roleValue = profile.role === "Student" ? 1 : profile.role === "Instructor" ? 2 : profile.role === "Admin" ? 3 : 1;
      setFormData({
        userName: profile.userName || "",
        email: profile.email || "",
        role: roleValue
      });
    }
    setIsEditing(false);
    setUpdateError(null);
  };

  const handleSave = async (): Promise<void> => {
    if (!formData.userName.trim() || !formData.email.trim()) {
      setUpdateError("Username and email are required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setUpdateError("Please enter a valid email address");
      return;
    }

    setUpdating(true);
    setUpdateError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedProfile: User = {
        ...profile!,
        userName: formData.userName,
        email: formData.email,
        role: ROLES.find(r => r.value === formData.role)?.label || "Student"
      };

      setProfile(updatedProfile);
      setIsEditing(false);
      setUpdateSuccess(true);

      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch {
      setUpdateError("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem" }}>
        <Loader2 style={{ width: "32px", height: "32px", animation: "spin 1s linear infinite", marginBottom: "1rem" }} />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", padding: "3rem 1rem" }}>
        <div style={{ maxWidth: "40rem", margin: "0 auto", background: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: "0.5rem", padding: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
            <div>
              <strong>Profile Not Found</strong>
              <p>Unable to load your profile information. Please try logging in again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom right, #f5f5f5, #e8e8e8)", padding: "3rem 1rem" }}>
      <div style={{ maxWidth: "45rem", margin: "0 auto" }}>
        <div style={{ background: "white", borderRadius: "1rem", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "2rem", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "80px", height: "80px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", marginBottom: "1rem" }}>
              <UserIcon style={{ width: "40px", height: "40px", color: "white" }} />
            </div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "white", margin: "0.5rem 0 0 0" }}>
              {profile.userName}
            </h1>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", color: "white", padding: "0.25rem 1rem", borderRadius: "9999px", marginTop: "0.5rem" }}>
              <Shield style={{ width: "16px", height: "16px", marginRight: "0.25rem", display: "inline" }} />
              {profile.role}
            </div>
          </div>

          <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Profile Information</h2>
                <p style={{ color: "#666", marginTop: "0.25rem" }}>Your account details and membership information</p>
              </div>
              {!isEditing ? (
                <button onClick={handleEdit} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", border: "1px solid #ddd", borderRadius: "0.375rem", backgroundColor: "white", cursor: "pointer" }}>
                  <Edit style={{ width: "16px", height: "16px" }} />
                  Edit Profile
                </button>
              ) : (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={handleCancel} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", border: "1px solid #ddd", borderRadius: "0.375rem", backgroundColor: "white", cursor: "pointer" }} disabled={updating}>
                    <X style={{ width: "16px", height: "16px" }} />
                    Cancel
                  </button>
                  <button onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#667eea", color: "white", borderRadius: "0.375rem", border: "none", cursor: "pointer" }} disabled={updating}>
                    {updating ? (
                      <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                    ) : (
                      <Save style={{ width: "16px", height: "16px" }} />
                    )}
                    Save
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              {updateSuccess && (
                <div style={{ background: "#d4edda", border: "1px solid #c3e6cb", borderRadius: "0.375rem", padding: "1rem", marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", color: "#155724" }}>
                  <CheckCircle style={{ width: "16px", height: "16px"}} />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {updateError && (
                <div style={{ background: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: "0.375rem", padding: "1rem", marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", color: "#721c24" }}>
                  <AlertCircle style={{ width: "16px", height: "16px" }} />
                  <span>{updateError}</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "1rem", padding: "1rem",  background: "#f5f5f5", borderRadius: "0.5rem", marginBottom: "1rem" }}>
              <UserIcon style={{ width: "20px", height: "20px", color: "#667eea", marginTop: "0.125rem", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Username</label>
                {isEditing ? (
                  <input
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    disabled={updating}
                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "0.375rem" }}
                  />
                ) : (
                  <p style={{ color: "#666" }}>{profile.userName}</p>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", padding: "1rem",  background: "#f5f5f5", borderRadius: "0.5rem", marginBottom: "1rem" }}>
              <Mail style={{ width: "20px", height: "20px", color: "#667eea", marginTop: "0.125rem", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Email Address</label>
                {isEditing ? (
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    disabled={updating}
                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "0.375rem" }}
                  />
                ) : (
                  <p style={{ color: "#666" }}>{profile.email}</p>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", padding: "1rem",  background: "#f5f5f5", borderRadius: "0.5rem", marginBottom: "1rem" }}>
              <Shield style={{ width: "20px", height: "20px", color: "#667eea", marginTop: "0.125rem", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Role</label>
                {isEditing ?  (
                  <select
                    value={formData.role}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, role: parseInt(e.target.value) }))}
                    disabled={updating}
                    style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "0.375rem" }}
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: "inline-block", background: "#e3f2fd", color: "#1976d2", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.875rem" }}>
                    {profile.role}
                  </div>
                )}
              </div>
            </div>

            {profile.enrollmentDate && (
              <div style={{ display: "flex", gap: "1rem", padding: "1rem",  background: "#f5f5f5", borderRadius: "0.5rem" }}>
                <Calendar style={{ width: "20px", height: "20px", color: "#667eea", marginTop: "0.125rem", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 600, margin: "0 0 0.25rem 0" }}>Member Since</h3>
                  <p style={{ color: "#666", margin: 0 }}>
                    {new Date(profile.enrollmentDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
