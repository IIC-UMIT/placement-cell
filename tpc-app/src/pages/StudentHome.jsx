import React, { useState, useEffect } from "react";
import "../styles/StudentDashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import vilasKharat from "../assets/images/vilasKharat.jpeg";

const Dashboard = ({ role, loggedInUser }) => {
  const [userData, setUserData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState({});

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

  // Fetch user details
  useEffect(() => {
    if (!loggedInUser || !role) return;
    const userRef = firebase.database().ref(`users/${role}/${loggedInUser}`);
    userRef.once("value").then((snapshot) => {
      if (snapshot.exists()) {
        setUserData({ uid: loggedInUser, ...snapshot.val() });
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

  // Fetch applied jobs
  useEffect(() => {
    if (!userData) return;
    const { graduationYear, branch, uid } = userData;
    if (!graduationYear || !branch || !uid) return;

    const appliedRef = firebase
      .database()
      .ref(`Students/${graduationYear}/${branch}/${uid}/applications`);

    appliedRef.on("value", (snapshot) => {
      const data = snapshot.val() || {};
      // filter out undefined keys
      const validJobs = Object.fromEntries(
        Object.entries(data).filter(
          ([key, job]) => key !== "undefined" && job.company
        )
      );
      setAppliedJobs(validJobs);
    });

    return () => appliedRef.off();
  }, [userData]);

  if (!userData) return <p>Loading dashboard...</p>;

  return (
    <div className="main-content d-flex">
      {/* Left Section */}
      <div className="LeftDashboard flex-grow-1">
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
            <h5>Rejections</h5>
            <p>
              {Object.values(appliedJobs).filter(
                (job) =>
                  job.status === "Rejected" ||
                  job.interviewStatus === "Rejected"
              ).length}
            </p>
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
          <img src="https://via.placeholder.com/80" alt="Profile" />
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
    </div>
  );
};

export default Dashboard;
