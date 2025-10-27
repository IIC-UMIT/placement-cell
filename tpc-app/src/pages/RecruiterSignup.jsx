import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import database from '../firebaseConfig';
import "../styles/LoginPage.css";

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState('Recruiter');
  const navigate = useNavigate();

  // Validate password complexity and match
  const validatePassword = () => {
    let isValid = true;
    const newErrors = {};
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!password.match(passwordRegex)) {
      isValid = false;
      newErrors.password =
        'Password must be 8+ characters with an uppercase, lowercase, number, and special character.';
    }

    if (password !== confirmPassword) {
      isValid = false;
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return isValid;
  };

  console.log(activeRole)

  // Handle role-based signup and save data in Realtime Database
  const register = (e) => {
    e.preventDefault();
    setLoading(true);
    const timestamp = new Date();

    if (!validatePassword()) {
      setLoading(false);
      return;
    }

    firebase
      .auth() 
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const userId = userCredential.user.uid;

        // Store user data in the database under the correct role
        database
          .ref(`users/${activeRole}/${userId}`)
          .set({
            name,
            email,
            role: activeRole,
            createdOn: timestamp.toLocaleString(),
          })
          .then(() => {
            setLoading(false);
            firebase.auth().signOut();
            navigate(`/login`);
          })
          .catch((err) => {
            setErrors({ general: 'Failed to sign up. Please try again.' });
            setLoading(false);
          });
      })
      .catch((err) => {
        setErrors({ general: err.message });
        setLoading(false);
      });
  };

  // Toggle password visibility
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="body">
      <div className="container-login">
        <div className="left-section">
          <div className="left-section-content">
            <h2>Welcome !</h2>
            <h3>{`${activeRole} Signup`}</h3>
            <p>
              {activeRole === "Student" && "Access your student dashboard and apply for jobs."}
              {activeRole === "Recruiter" && "Explore candidates and manage job applications."}
              {activeRole === "Coordinator" && "Manage placements and coordinate activities."}
            </p>
          </div>
        </div>
        <div className="right-section">
          <h2>Signup</h2>
            {/* Role Selection Tabs */}
            <div className="role-tabs">
              <button
                type="button"
                className={`tab ${activeRole === 'Recruiter' ? 'active' : ''}`}
                onClick={() => setActiveRole('Recruiter')}
              >
                Recruiter
              </button>
            </div>
            <form id="loginForm" onSubmit={register}>
              {/* Fullname Input */}
              <input
                type="text"
                id="fullname"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              {/* Email Input */}
              <input
                type="email"
                id="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}

              {/* Password Input */}
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Confirm Password Input */}
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {/* Toggle Password Visibility */}
              <button
                type="button"
                className="toggleShowPassword"
                onClick={toggleShowPassword}
              >
                {showPassword ? 'Hide Password' : 'Show Password'}
              </button>

              {/* General Errors */}
              {errors.name && <span className="error-message">{errors.name}</span>}
              {errors.password && <span className="error-message">{errors.password}</span>}
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
              {errors.general && <span className="error-message">{errors.general}</span>}

              {/* Submit Button */}
              <button type="submit" disabled={loading}>
                {loading ? 'Signing up...' : 'Sign up'}
              </button>
            </form>

            {/* Login Link */}
            <p className="login-link">
              Already have an account? <Link to="/Login">Login</Link>.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
