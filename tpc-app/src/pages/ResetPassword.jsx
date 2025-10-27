import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "../styles/LoginPage.css";

const ResetPassword = () => {
  const [oobCode, setOobCode] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [mode, setMode] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOobCode(params.get("oobCode"));
    setApiKey(params.get("apiKey"));
    setMode(params.get("mode"));
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!oobCode) {
      setStatus("Invalid reset link (missing code).");
      return;
    }
    if (!password || password.length < 6) {
      setStatus("Enter a new password (at least 6 characters).");
      return;
    }
    if (password !== confirm) {
      setStatus("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Use Firebase client to confirm password reset with the oobCode
      await firebase.auth().confirmPasswordReset(oobCode, password);
      setStatus("Password changed successfully. You can now log in.");
      setTimeout(() => navigate("/Login"), 1800);
    } catch (err) {
      console.error("confirmPasswordReset error:", err);
      setStatus(err.message || "Failed to reset password. Try the reset link again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body">
      <div className="container-forget">
        <div className="forget-section">
          <h2>Reset Password</h2>
          <p>Enter a new password for your account.</p>
          <form onSubmit={handleReset}>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <div style={{ marginTop: 12 }}>
              <button type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button type="submit" onClick={() => navigate("/Login")} style={{ marginLeft: 8 }}>
                Back to Login
              </button>
            </div>
          </form>
          {status && <div style={{ marginTop: 12, color: status.includes("successfully") ? "green" : "#b30000" }}>{status}</div>}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
