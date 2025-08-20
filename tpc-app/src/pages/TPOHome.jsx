import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "../styles/StudentDashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import vilasKharat from '../assets/images/vilasKharat.jpeg';

const TPOHome = () => {
  const [stats, setStats] = useState({
    totalStudents: 462,
    totalRecruiters: 15,
    totalPlaced: 5,
    totalNotPlaced: 0,
    companies: [],
    interviewDates: [],
  });
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);

  // Function to calculate "X days ago"
  const getTimeAgo = (createdOn) => {
    const createdDate = new Date(createdOn);
    const currentDate = new Date();
    const differenceInTime = currentDate - createdDate;
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

    if (differenceInDays === 0) return "Today";
    if (differenceInDays === 1) return "1 day ago";
    return `${differenceInDays} days ago`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsRef = firebase.database().ref("students");
        const recruitersRef = firebase.database().ref("recruiters");
        const placedRef = firebase.database().ref("placed");
        const interviewsRef = firebase.database().ref("interviews");

        const [studentsSnapshot, recruitersSnapshot, placedSnapshot, interviewsSnapshot] = await Promise.all([
          studentsRef.once("value"),
          recruitersRef.once("value"),
          placedRef.once("value"),
          interviewsRef.once("value"),
        ]);

        const totalStudents = studentsSnapshot.numChildren();
        const totalRecruiters = recruitersSnapshot.numChildren();
        const totalPlaced = placedSnapshot.numChildren();
        const totalNotPlaced = totalStudents - totalPlaced;
        const companies = Object.values(recruitersSnapshot.val() || {});
        const interviewDates = Object.values(interviewsSnapshot.val() || {});

        setStats({
          totalStudents,
          totalRecruiters,
          totalPlaced,
          totalNotPlaced,
          companies,
          interviewDates,
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const announcementsRef = firebase.database().ref("Announcements");

        announcementsRef.on("value", (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const fetchedAnnouncements = Object.values(data)
              .map((item) => ({
                text: item.announcementText,
                author: item.author || "IIC Co-ordinator Dr. Vilas Kharat",
                createdOn: item.createdOn || new Date().toString(),
                timestamp: new Date(item.createdOn).getTime(), // Convert to timestamp
                avatar: item.avatar || vilasKharat,
              }))
              .filter((a) => a.text.trim() !== "")
              .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp DESC

            setAnnouncements(fetchedAnnouncements);
          } else {
            setAnnouncements([]);
          }
        });

        return () => announcementsRef.off();
      } catch (error) {
        console.error("Error fetching announcements: ", error);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const eventRef = firebase.database().ref("Events");

      eventRef.on("value", (snapshot) => {
        if (snapshot.exists()) {
          const eventData = snapshot.val();
          const eventList = Object.keys(eventData).map((key) => ({
            id: key,
            ...eventData[key],
          }));
          setEvents(eventList);
        } else {
          setEvents([]);
        }
      });

      return () => eventRef.off();
    };

    fetchEvents();
  }, []);

  return (
    <div className = "main-content" >
        <div className="LeftDashboard">
          <div className="Welcome-message">
            <h2>Welcome to TPO Dashboard</h2>
          </div>
          {/* Stats Cards */}
          <div className="card-box d-flex flex-wrap justify-content-between flex-row">
            <div className="card-item">
              <h5>Total Students</h5>
              <p>{stats.totalStudents}</p>
            </div>
            <div className="card-item">
              <h5>Total Recruiters</h5>
              <p>{stats.totalRecruiters}</p>
            </div>
            <div className="card-item">
              <h5>Total Placed</h5>
              <p>{stats.totalPlaced}</p>
            </div>
            <div className="card-item">
              <h5>Total Not Placed</h5>
              <p>{stats.totalNotPlaced}</p>
            </div>
          </div>

          {/* Graph */}
          {/* <div className="chart-container">
            <h5>Statistics</h5>
            <p>Progress Score</p>
            {/* Add chart here using Chart.js or other libraries */}
          {/* </div> */} 

          <div className="events-section">
            <h2 className="section-title">Upcoming Events</h2>
            {events.length > 0 ? (
              <div className="events-container">
                {events.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-image">
                      <img src={event.image || "default-event.jpg"} alt={event.name} />
                    </div>
                    <div className="event-details">
                      <h3 className="event-title">{event.name}</h3>
                      <p className="event-info">{event.date} | {event.time}</p>
                      <p className="event-info">{event.venue}</p>
                    </div>
                    <div className="event-speaker">
                      <img src={event.speakerImage || "default-avatar.jpg"} alt="Speaker" />
                      <p>{event.speaker}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-events">No upcoming events.</p>
            )}
          </div>

          {/* <div className="companies-section">
            <h2 className="section-title">Companies and Recruitment</h2>
            <ul>
              {stats.companies.map((company, index) => (
                <li key={index}>{company.name}</li>
              ))}
            </ul>
          </div> */}
        </div>

        <div className="RightBarDashboard">
          {/* Profile Card */}
          <div className="profile-card my-4">
            <img src="https://via.placeholder.com/80" alt="Profile" />
            <h5>TPO Officer</h5>
            <p>tpo@example.com</p>
          </div>

          <div className="announcement-card">
            <h5>{announcements.length} Announcements</h5>

            <div className="announcement-list">
              {announcements.length > 0 ? (
                announcements.map((announcement, index) => (
                  <div key={index} className="announcement">
                    <div className="profile">
                      <img src={announcement.avatar} alt="Profile" />
                      <div>
                        <p className="mb-0">{announcement.text}</p>
                        <small>{announcement.author}</small>
                      </div>
                    </div>
                    <div className="timestamp">{getTimeAgo(announcement.createdOn)}</div>
                  </div>
                ))
              ) : (
                <p>No announcements available.</p>
              )}
            </div>
          </div>

          {/* <div className="interview-dates-card">
            <h5>Interview Dates</h5>
            <ul>
              {stats.interviewDates.length > 0 ? (
                stats.interviewDates.map((date, index) => (
                  <li key={index}>
                    {date.date} - {date.company}
                  </li>   
                ))
              ) : (
                <li>No interview dates available.</li>  
              )}
            </ul>
          </div>   */}
        </div>
      </div>
  );
};

export default TPOHome;


