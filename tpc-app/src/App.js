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

import RecruiterHome from './pages/RecruiterHome.jsx';
import RecruiterDashboard from './pages/RecruiterDashboard.jsx';
import RecruiterPage from './pages/RecruiterPage.jsx';
import RecruiterJDManager from './pages/RecruiterJDManager.jsx';
// import RecruiterProfile from './pages/RecruiterProfile.jsx';
import StudentApplied from './pages/StudentApplied.jsx';

import StudentHome from './pages/StudentHome.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
// import Resume from './pages/Resume.jsx';
import Resources from './pages/StudentResources.jsx';
import JobPosting from './pages/StudentJobPosting.jsx'
import PlacementGuidelines from './pages/PlacementGuidelines.jsx';

import TPOHome from './pages/TPOHome.jsx';
import TPODashboard from './pages/TPODashboard.jsx';
import Blog from './pages/TPOBlog.jsx'
import StudentDetails  from './pages/TPOManageStudent.jsx';
import ManageRecruiter from './pages/TPOManageRecruiter.jsx';
import ManageStudents from './pages/TPOManageUsers.jsx'
import Announcements from './pages/TPOAnnouncements.jsx'
import EventDashboard from './pages/TPOEvent.jsx';

import './chartSetup';
import "bootstrap/dist/css/bootstrap.min.css";


const App = () => {
  const [loggedInUser, setLoggedInUser] = useState(null); // Store logged-in user ID
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null); // Store role of logged-in user

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
          let found = false
          for (const role of roles) {
            const userRef = await firebase.database().ref(`users/${role}/${userId}`).once("value");
            if (userRef.exists()) {}
            setRole(role);
            setUserData({ ...userRef, role: role }); // Add role to user data
            found = true;
            break; // Exit loop once user is found in one of the roles
          }

          if (!found) {
            setRole(null);
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setRole(null);
          setUserData(null);
        }
      } else {
         setLoggedInUser(null);
        setRole(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Team" element={<Team />} />
        <Route path="/Login" element={<Login setLoggedInUser={setLoggedInUser} setRole={setRole} role={role} />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Events" element={<Events />} />
        <Route path="/StudentDashboard" element={<StudentDashboard userData={userData} />} />
       
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
          <Route path="Dashboard" element={<StudentHome role={role} userData={userData} />} />
          <Route path="Profile" element={<StudentProfile role={role} loggedInUser={loggedInUser}/>} />
          {/* <Route path="Resume" element={<Resume role={role} />} /> */}
          <Route path="Resources" element={<Resources role={role} />} />
          <Route path="JobPosting" element={<JobPosting role={role} />} />
          <Route path="EventDashboard" element={<EventDashboard role={role} />} />
          <Route path="PlacementGuidelines" element={<PlacementGuidelines role={role} />} /> 
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
          <Route path="Dashboard" element={<RecruiterHome role={role} userData={userData} />} />
          <Route path="JobDescription" element={<RecruiterPage role={role} />} />
          <Route path="RecruiterJDManager" element={<RecruiterJDManager role={role} />} />
          <Route path="StudentsApplied" element={<StudentApplied role={role} />} />
        </Route>

        <Route path="/TPOPage" element={
          loggedInUser ? (
            <TPODashboard role={role} />
          ) : (
            <Navigate to="/Login" />
          )
        }>
          <Route path="Home" element={<TPOHome />} />
          <Route path="ManageStudent" element={<ManageStudents role={role} />} />
          <Route path="StudentDetails" element={<StudentDetails role={role} />} />
          <Route path="ManageRecruiter" element={<ManageRecruiter role={role} />} />
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
