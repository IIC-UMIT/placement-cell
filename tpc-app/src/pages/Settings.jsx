import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "../styles/LoginPage.css";

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [showActions, setShowActions] = useState(false); // show reset/signout options when reauth fails
  const navigate = useNavigate();

  const reauthenticate = (email, currentPassword) => {
    const user = firebase.auth().currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(email, currentPassword);
    return user.reauthenticateWithCredential(credential);
  };

  const handleSendReset = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user || !user.email) {
        setStatus("No user signed in to send reset email.");
        return;
      }
      await firebase.auth().sendPasswordResetEmail(user.email);
      setStatus("Password reset email sent. Check your inbox.");
      setShowActions(false);
    } catch (err) {
      console.error("Reset email error:", err);
      setStatus(err.message || "Failed to send reset email.");
    }
  };

  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      navigate("/Login");
    } catch (err) {
      console.error("Sign out error:", err);
      setStatus("Failed to sign out. Check console for details.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatus("");
    setShowActions(false);
    const user = firebase.auth().currentUser;
    if (!user) { setStatus("You must be signed in."); return; }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatus("Fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("New password and confirm do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setStatus("New password must be at least 6 characters.");
      return;
    }

    try {
      // Try to reauthenticate with current password
      await reauthenticate(user.email, currentPassword);
      // If reauth succeeds, update password
      await user.updatePassword(newPassword);
      setStatus("Password updated successfully.");
      // Optionally force user to re-login:
      // await firebase.auth().signOut();
      // navigate("/Login");
    } catch (err) {
      console.error("Password change error:", err);
      const code = err.code || "";
      // Common cases: wrong password, invalid credential, requires recent login
      if (code === "auth/wrong-password" || code === "auth/invalid-credential" || code === "auth/internal-error") {
        setStatus("Current password is incorrect or credential is invalid. You can send a password reset email or sign out and sign in again.");
        setShowActions(true);
        return;
      }
      if (code === "auth/requires-recent-login") {
        setStatus("Your session is too old. Please sign in again to change your password.");
        setShowActions(true);
        return;
      }
      // Fallback message
      setStatus(err.message || "Failed to change password.");
    }
  };

  return (
    <div style={{padding:20, maxWidth:640, margin:'0 auto'}}>
      <h2>Account Settings</h2>
      <form onSubmit={handleChangePassword}>
        <div style={{marginBottom:8}}>
          <label>Current Password</label><br/>
          <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required />
        </div>
        <div style={{marginBottom:8}}>
          <label>New Password</label><br/>
          <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
        </div>
        <div style={{marginBottom:8}}>
          <label>Confirm New Password</label><br/>
          <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required />
        </div>
        {status && <div style={{marginBottom:8,color:'#b30000'}}>{status}</div>}
        <div style={{display:'flex',gap:8}}>
          <button type="submit">Change Password</button>
          <button type="submit" style={{backgroundColor: '#b30000' }} onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>

      {showActions && (
        <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 12 }}>
          <p>If reauthentication failed you can:</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSendReset}>Send Password Reset Email</button>
            <button onClick={handleSignOut}>Sign out & Sign in again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
