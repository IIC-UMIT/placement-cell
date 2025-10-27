import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!email) {
      setStatus("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("https://tpc-app-1044941932147.asia-south1.run.app/send-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setStatus("Password reset email sent. Check your inbox (and spam).");
      } else {
        console.error("Backend responded with error:", data);
        setStatus(data.error || "Failed to send reset email.");
      }
    } catch (err) {
      console.error("Network error sending reset:", err);
      setStatus("Network error. Check console and backend availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body">
      <div className="container-forget">
        <div className="forget-section">
          <h2>Forgot Password</h2>
          <p>Enter your account email to receive a password reset link (sent to the website reset page).</p>
          <form onSubmit={handleSend}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div style={{ marginTop: 12 }}>
              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Email"}
              </button>
              <button
                type="submit"
                onClick={() => navigate("/Login")}
                style={{ marginLeft: 8 }}
                disabled={loading}
              >
                Back to Login
              </button>
            </div>
          </form>

          {status && (
            <div style={{ marginTop: 12, color: status.startsWith("Password reset email sent") ? "green" : "#b30000" }}>
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
