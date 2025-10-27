import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "../styles/LoginPage.css";

function LoginPage({ setLoggedInUser,setRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState("");
  const [activeRole, setActiveRole] = useState('Student'); // New state for role management
  const navigate = useNavigate();

  // Set the logged-in user if one exists when the component mounts
  useEffect(() => {
    const user = firebase.auth().currentUser;
    if (user) {
      setLoggedInUser(user.uid);
    }
  }, [setLoggedInUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors("");

    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const loggedInUserId = userCredential.user.uid;

      // Check in Firebase under the selected role
      const userRef = await firebase.database().ref(`users/${activeRole}/${loggedInUserId}`).once("value");

      if (userRef.exists()) {
        setLoggedInUser(loggedInUserId);
        setRole(activeRole); // Set the role here

        // Navigate to the respective page
        if (activeRole === "Student") navigate("/Student/Dashboard");
        else if (activeRole === "Recruiter") navigate("/Recruiter/Dashboard");
        else if (activeRole === "Coordinator") navigate("/TPOPage/Home");
      } else {
        // Logout user since they are not authorized for this role
        await firebase.auth().signOut();
        setErrors(`Unauthorized login! Please select the correct role or contact support.`);
      }
    } catch (error) {
      setErrors("Login failed! Please check your credentials.");
      console.error("Login Error:", error);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="body">
      <div className="container-login">
        <div className="left-section">
          <div className="left-section-content">
            <h2>Welcome Back!</h2>
            <h3>{`${activeRole} Login`}</h3>
            <p>
              {activeRole === "Student" && "Access your student dashboard and apply for jobs."}
              {activeRole === "Recruiter" && "Explore candidates and manage job applications."}
              {activeRole === "Coordinator" && "Manage placements and coordinate activities."}
            </p>
          </div>
        </div>
        <div className="right-section">
          <h2>Login</h2>
          <div className="role-tabs">
            <button
              type="button"
              className={`tab ${activeRole === 'Student' ? 'active' : ''}`}
              onClick={() => setActiveRole('Student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`tab ${activeRole === 'Recruiter' ? 'active' : ''}`}
              onClick={() => setActiveRole('Recruiter')}
            >
              Recruiter
            </button>
            <button
              type="button"
              className={`tab ${activeRole === 'Coordinator' ? 'active' : ''}`}
              onClick={() => setActiveRole('Coordinator')}
            >
              Coordinator
            </button>
          </div>
          <form id="loginForm" onSubmit={handleLogin}>
            <input
              className="col-10"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="col-10"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="toggleShowPassword" onClick={toggleShowPassword}>
              {showPassword ? "Hide Password" : "Show Password"}
            </div>

            <a href="/Forgot-Password" className="forgot-password-link" style={{display:'block', marginTop:8}}>
              Forgot your password?
            </a>
            {errors && <span className="error-message">{errors}</span>}
            <button type="submit">Login</button>

            <p className="signup-link">
              {activeRole === "Recruiter" && (
                <>
                  Don't have an account? <Link to={`/Signup`}>Sign up now.</Link>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </div >
  );
}

export default LoginPage;
