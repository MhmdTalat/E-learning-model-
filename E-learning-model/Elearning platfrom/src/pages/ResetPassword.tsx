import { FormEvent, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as authApi from "@/api/auth";
import "./Auth.css";

interface ResetState {
  email: string;
  token: string;
}

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetData, setResetData] = useState<ResetState | null>(null);

  useEffect(() => {
    const state = location.state as ResetState | null;
    if (!state || !state.email || !state.token) {
      setMessage("Invalid reset link. Please request a new password reset.");
    } else {
      setResetData(state);
    }
  }, [location]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!resetData) {
      setMessage("Reset data is missing. Please start over.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await authApi.resetPassword(
        resetData.email,    // email
        resetData.token,    // token
        password            // newPassword
      );
      setMessage("Your password has been reset successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: Error | unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setMessage(axiosError.response?.data?.message || "Failed to reset password. Please try again.");
      } else {
        setMessage("Failed to reset password. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!resetData) {
    return (
      <div className="auth-page animate-fade-in">
        <div className="auth-card">
          <h1>Reset password</h1>
          {message && <div className="auth-error">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card">
        <h1>Reset password</h1>
        <h2>Enter your new password below.</h2>

        {message && (
          <div className={message.includes("successfully") ? "auth-success" : "auth-error"}>
            {message}
          </div>
        )}

        {!message?.includes("successfully") && (
          <form onSubmit={handleSubmit}>
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />

            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />

            <button type="submit" disabled={submitting}>
              {submitting ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
