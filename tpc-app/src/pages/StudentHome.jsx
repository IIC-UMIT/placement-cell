import React, { useState, useEffect } from "react";
import "../styles/StudentDashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import vilasKharat from "../assets/images/vilasKharat.jpeg";
import profile from "../assets/images/profile.webp";

const Dashboard = ({ role, loggedInUser }) => {
  const [userData, setUserData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Function to calculate "X days ago"
  const getTimeAgo = (createdOn) => {
    const createdDate = new Date(createdOn);
    const currentDate = new Date();
    const diffTime = currentDate - createdDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  // Fetch user details and also try to load Students/<year>/<branch>/<uid> profile
  useEffect(() => {
    if (!loggedInUser || !role) return;
    const userRef = firebase.database().ref(`users/${role}/${loggedInUser}`);
    userRef.once("value").then(async (snapshot) => {
      if (snapshot.exists()) {
        const baseMeta = snapshot.val();
        let merged = { uid: loggedInUser, ...baseMeta };

        // If role is Student, try to load Students profile (prefer direct path if gradYear+branch present)
        if (role === "Student") {
          let gradYear = baseMeta.gradYear || baseMeta.graduationYear || baseMeta.grad_year;
          let branch = baseMeta.branch || baseMeta.dept || baseMeta.department;

          let studentKey = loggedInUser;
          let studentProfile = null;

          if (gradYear && branch) {
            const snap = await firebase.database().ref(`Students/${gradYear}/${branch}/${studentKey}`).get();
            if (snap.exists()) studentProfile = snap.val();
          }

          // Fallback: scan Students tree to find a matching record (by uid key, email or rollNo)
          if (!studentProfile) {
            const studentsSnap = await firebase.database().ref("Students").get();
            const students = studentsSnap.val() || {};
            const metaEmail = (baseMeta.email || "").toLowerCase();
            const metaRoll = baseMeta.rollNo || baseMeta.rollno || baseMeta.roll || "";

            let found = null;
            for (const yearKey of Object.keys(students)) {
              const yearObj = students[yearKey] || {};
              for (const branchKey of Object.keys(yearObj)) {
                const branchObj = yearObj[branchKey] || {};
                // direct uid match
                if (branchObj.hasOwnProperty(loggedInUser)) {
                  found = { yearKey, branchKey, key: loggedInUser, data: branchObj[loggedInUser] };
                  break;
                }
                // match by email or rollNo
                for (const candidateKey of Object.keys(branchObj)) {
                  const candidate = branchObj[candidateKey] || {};
                  const candEmail = (candidate.email || "").toLowerCase();
                  const candRoll = candidate.rollNo || candidate.rollno || candidate.roll || "";
                  if (metaEmail && candEmail === metaEmail) {
                    found = { yearKey, branchKey, key: candidateKey, data: candidate };
                    break;
                  }
                  if (metaRoll && String(candRoll) === String(metaRoll)) {
                    found = { yearKey, branchKey, key: candidateKey, data: candidate };
                    break;
                  }
                }
                if (found) break;
              }
              if (found) break;
            }

            if (found) {
              gradYear = gradYear || found.yearKey;
              branch = branch || found.branchKey;
              studentKey = found.key;
              studentProfile = found.data || null;
            }
          }

          if (studentProfile) {
            // merge student profile fields (photo, applications etc.) into userData
            merged = { ...merged, ...studentProfile, graduationYear: gradYear, branch, studentKey };
            // If applications exist, normalize as object
            const apps = studentProfile.applications || {};
            // convert array/object to object map for consistent UI
            if (Array.isArray(apps)) {
              // array: convert to map with indices
              const map = {};
              apps.forEach((val, idx) => { if (val) map[String(idx)] = val; });
              merged.applications = map;
            } else {
              merged.applications = apps;
            }
          }
        }

        setUserData(merged);
      }
    });
  }, [loggedInUser, role]);

  // Fetch announcements
  useEffect(() => {
    const announcementsRef = firebase.database().ref("Announcements");
    announcementsRef.on("value", (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const fetchedAnnouncements = Object.values(data)
          .map((item) => ({
            text: item.announcementText,
            author: item.author || "IIC Co-ordinator Dr. Vilas Kharat",
            createdOn: item.createdOn || new Date().toString(),
            timestamp: new Date(item.createdOn).getTime(),
            avatar: item.avatar || vilasKharat,
          }))
          .filter((a) => a.text.trim() !== "")
          .sort((a, b) => b.timestamp - a.timestamp);
        setAnnouncements(fetchedAnnouncements);
      } else {
        setAnnouncements([]);
      }
    });
    return () => announcementsRef.off();
  }, []);

  // Fetch events
  useEffect(() => {
    const eventRef = firebase.database().ref("Events");
    eventRef.on("value", (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const currentDate = new Date();
        const upcomingEvents = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .filter((event) => new Date(event.date) > currentDate);
        setEvents(upcomingEvents);
      } else setEvents([]);
    });
    return () => eventRef.off();
  }, []);

  // Fetch applied jobs from Students profile (prefer the merged student data)
  useEffect(() => {
    if (!userData) return;
    // Determine correct gradYear/branch/uid to read applications
    const graduationYear = userData.graduationYear || userData.graduationYear || userData.graduationYear;
    const branch = userData.branch;
    const studentKey = userData.studentKey || userData.uid;

    if (!graduationYear || !branch || !studentKey) {
      setAppliedJobs({});
      return;
    }

    const appliedRef = firebase
      .database()
      .ref(`Students/${graduationYear}/${branch}/${studentKey}/applications`);

    const handleSnapshot = (snapshot) => {
      const data = snapshot.val() || {};
      // Normalize structure (object or array) and filter
      let normalized = {};
      if (Array.isArray(data)) {
        data.forEach((v, i) => { if (v) normalized[String(i)] = v; });
      } else {
        normalized = Object.fromEntries(
          Object.entries(data).filter(([key, job]) => key !== "undefined" && job && job.company)
        );
      }
      setAppliedJobs(normalized);
    };

    appliedRef.on("value", handleSnapshot);
    return () => appliedRef.off();
  }, [userData]);

  // Upload photo handler — uploads to Storage and updates Students + users/Student
  const handlePhotoChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!userData) {
      alert("User data not loaded yet.");
      return;
    }
    const graduationYear = userData.graduationYear;
    const branch = userData.branch;
    const studentKey = userData.studentKey || userData.uid;
    if (!graduationYear || !branch || !studentKey) {
      alert("Missing grad year / branch; cannot upload photo.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB.");
      return;
    }

    try {
      setUploadingPhoto(true);
      const timestamp = Date.now();
      const ext = file.name.split(".").pop();
      const destPath = `Students/${graduationYear}/${branch}/${studentKey}/photo_${timestamp}.${ext}`;
      const storageRef = firebase.storage().ref().child(destPath);
      const snap = await storageRef.put(file);
      const url = await snap.ref.getDownloadURL();

      // Update Students node
      await firebase.database().ref(`Students/${graduationYear}/${branch}/${studentKey}`).update({ photo: url });
      // Also update users/Student meta for faster lookup
      await firebase.database().ref(`users/Student/${userData.uid}`).update({ photo: url });

      // Refresh local state
      setUserData(prev => ({ ...prev, photo: url }));
      setUploadingPhoto(false);
      alert("Photo uploaded successfully.");
    } catch (err) {
      console.error("Photo upload failed:", err);
      setUploadingPhoto(false);
      alert("Photo upload failed. See console for details.");
    }
  };

  if (!userData) return <p>Loading dashboard...</p>;

  return (
    <div className="main-content d-flex">
      {/* Left Section */}
      <div className="LeftDashboard ">
        <div className="Welcome-message">
          <h2>Welcome! {userData.name}</h2>
        </div>

        {/* Stats Cards */}
        <div className="card-box d-flex">
          <div className="card-item">
            <h5>Total Applications</h5>
            <p>{Object.keys(appliedJobs).length}</p>
          </div>
          <div className="card-item">
            <h5>Offers</h5>
            <p>
              {Object.values(appliedJobs).filter(
                (job) =>
                  job.status === "Accepted" ||
                  job.interviewStatus === "Accepted" ||
                  job.offer?.accepted
              ).length}
            </p>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="homesection">
          <h2 className="section-title">Upcoming Events</h2>
          {events.length > 0 ? (
            <div className="events-container">
              {events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-image">
                    <img
                      src={(event.image && event.image[0]) || "default-event.jpg"}
                      alt={event.name}
                    />
                  </div>
                  <div className="event-details">
                    <h3>{event.name}</h3>
                    <p>
                      {event.date} | {event.time}
                    </p>
                    <p>{event.venue}</p>
                  </div>
                  <div className="event-speaker">
                    <p>{event.speaker}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events">No upcoming events.</p>
          )}
        </div>

        {/* Applied Jobs Table */}
        <div className="homesection">
          <h2 className="section-title">Applied Jobs</h2>
          {Object.keys(appliedJobs).length > 0 ? (
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(appliedJobs).map(([id, job]) => {
                  // Determine applied date
                  const appliedDate = job.appliedOn
                    ? new Date(job.appliedOn).toLocaleDateString()
                    : job.timeline && job.timeline[0]?.date
                      ? new Date(job.timeline[0].date).toLocaleDateString()
                      : "-";

                  // Determine status
                  const status =
                    job.status ||
                    job.interviewStatus ||
                    (job.offer?.accepted ? "Accepted" : "Pending");

                  return (
                    <tr key={id}>
                      <td>{job.company}</td>
                      <td>{appliedDate}</td>
                      <td>
                        <span
                          className={`status-badge ${status === "Rejected"
                              ? "rejected"
                              : status === "Accepted"
                                ? "accepted"
                                : "pending"
                            }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No applications yet.</p>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="RightBarDashboard">
        {/* Profile Card */}
        <div className="profile-card">
          <img src={userData.photo || profile} alt="Profile" />
          <h5>{userData.name}</h5>
          <p>{userData.email}</p>
        </div>

        {/* Announcements */}
        <div className="announcement-card">
          <h5>{announcements.length} Announcements</h5>
          <div className="announcement-list">
            {announcements.length > 0 ? (
              announcements.map((a, i) => (
                <div key={i} className="announcement">
                  <div className="profile">
                    <img src={a.avatar} alt="Profile" />
                    <div>
                      <p className="mb-0">{a.text}</p>
                      <small>{a.author}</small>
                    </div>
                  </div>
                  <div className="timestamp">{getTimeAgo(a.createdOn)}</div>
                </div>
              ))
            ) : (
              <p>No announcements available.</p>
            )}
          </div>
        </div>
      </div>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
    </div>
  );
};

export default Dashboard;
