import { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

import Home from './pages/LandingPage.jsx';
import Team from './pages/TeamPage.jsx';
import Login from './pages/LoginPage.jsx';
import Signup from './pages/RecruiterSignup.jsx';
import Events from './pages/Event.jsx';
import PageNotFound from './pages/PageNotFound.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Settings from './pages/Settings.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

import RecruiterHome from './pages/RecruiterHome.jsx';
import RecruiterDashboard from './pages/RecruiterDashboard.jsx';
import RecruiterPage from './pages/RecruiterPage.jsx';
import RecruiterJDManager from './pages/RecruiterJDManager.jsx';
import RecruiterEditJD from './pages/RecruiterEditJD.jsx';
// import RecruiterProfile from './pages/RecruiterProfile.jsx';
import StudentApplied from './pages/RecruiterStudentApplied.jsx';

import StudentHome from './pages/StudentHome.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import Resume from './pages/StudentResume.jsx';
import Resources from './pages/StudentResources.jsx';
import  MockTests from './pages/StudentMockTests.jsx';
import JobPosting from './pages/StudentJobPosting.jsx';
import ApplicationStatus from './pages/StudentApplicationStatus.jsx';
import PlacementGuidelines from './pages/PlacementGuidelines.jsx';

import TPOHome from './pages/TPOHome.jsx';
import TPODashboard from './pages/TPODashboard.jsx';
import Blog from './pages/TPOBlog.jsx'
import ManageStudents  from './pages/TPOManageStudent.jsx';
import ManageRecruiters from './pages/TPOManageRecruiter.jsx';
import ManageUsers from './pages/TPOManageUsers.jsx';
import Announcements from './pages/TPOAnnouncements.jsx'
import EventDashboard from './pages/TPOEvent.jsx';

import './chartSetup';
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [loggedInUser, setLoggedInUser] = useState(null); // Store logged-in user ID
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null); // Store role of logged-in user

  // New: indicate when Firebase auth initialization completed
  const [authReady, setAuthReady] = useState(false);

  console.log(loggedInUser)
  console.log(role)

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const userId = user.uid;
        setLoggedInUser(userId);
        try {
          // Check each role database separately
          const roles = ["Student", "Recruiter", "Coordinator"];
          let found = false;
          let foundUserData = null;
          let foundRole = null;
          for (const roleName of roles) {
            const userRef = await firebase.database().ref(`users/${roleName}/${userId}`).once("value");
            if (userRef.exists()) {
              found = true;
              foundRole = roleName;
              foundUserData = userRef.val();
              break; // Exit loop once user is found in one of the roles
            }
          }
 
          if (found) {
            setRole(foundRole);
            setUserData({ ...foundUserData, role: foundRole });
          } else {
            setRole(null);
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setRole(null);
          setUserData(null);
        }
        setAuthReady(true);
      } else {
        setLoggedInUser(null);
        setRole(null);
        setUserData(null);
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // While auth state is being determined, avoid rendering routes that redirect
  if (!authReady) {
    return <div style={{padding:20}}>Loading...</div>;
  }

  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Team" element={<Team />} />
        <Route path="/Login" element={<Login setLoggedInUser={setLoggedInUser} setRole={setRole} role={role} />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Events" element={<Events />} />
        <Route path="/StudentDashboard" element={<StudentDashboard userData={userData} />} />
        <Route path="/Forgot-Password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
       
        {/* Role-based routes */}
        <Route
          path="/Student"
          element={
            loggedInUser ? (
              <StudentDashboard role={role} />
            ) : (
              <Navigate to="/Login" />
            )
          }>
          <Route path="Dashboard" element={<StudentHome role={role} loggedInUser={loggedInUser} />} />
          <Route path="Profile" element={<StudentProfile role={role} loggedInUser={loggedInUser}/>} />
          <Route path="Resume" element={<Resume role={role} loggedInUser={loggedInUser}  />} />
          <Route path="Blogs" element={<Resources role={role} />} />
          <Route path="JobPosting" element={<JobPosting role={role} />} />
          <Route path="MockTests" element={<MockTests role={role} loggedInUser={loggedInUser}/>} />
          <Route path="ApplicationStatus" element={<ApplicationStatus role={role} loggedInUser={loggedInUser} />} />
          <Route path="EventDashboard" element={<EventDashboard role={role} />} />
          <Route path="PlacementGuidelines" element={<PlacementGuidelines role={role} />} /> 
           <Route path="Settings" element={ loggedInUser ? <Settings /> : <Navigate to="/Login" /> } />
        </Route>

        <Route
          path="/Recruiter"
          element={
            loggedInUser ? (
              <RecruiterDashboard role={role} />
            ) : (
              <Navigate to="/Login" />
            )
          }
        >
          <Route path="EditJD/:jd_id" element={<RecruiterEditJD />} />
          <Route path="Dashboard" element={<RecruiterHome role={role} userData={userData} />} />
          <Route path="JobDescription" element={<RecruiterPage role={role} loggedInUser={loggedInUser}  />} />
          <Route path="RecruiterJDManager" element={<RecruiterJDManager role={role} />} />
          <Route path="StudentsApplied/:jd_id" element={<StudentApplied role={role} loggedInUser={loggedInUser}/>} />
        </Route>

        <Route path="/TPOPage" element={
          loggedInUser ? (
            <TPODashboard role={role} />
          ) : (
            <Navigate to="/Login" />
          )
        }>
          <Route path="Home" element={<TPOHome />} />
          <Route path="ManageUsers" element={<ManageUsers role={role} />} />
          <Route path="ManageStudents" element={<ManageStudents role={role} />} />
          <Route path="ManageRecruiters" element={<ManageRecruiters role={role} />} />
          <Route path="Blog" element={<Blog role={role} />} />
          <Route path="Announcements" element={<Announcements role={role} />} />
          <Route path="EventDashboard" element={<EventDashboard role={role} />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
  );
};

export default App;
