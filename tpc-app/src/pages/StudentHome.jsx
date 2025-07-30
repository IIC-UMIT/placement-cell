import React, { useState, useEffect } from "react";
import "../styles/StudentDashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import vilasKharat from '../assets/images/vilasKharat.jpeg';

const Dashboard = ({ userData }) => {
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
    const fetchAnnouncements = async () => {
      try {
        const announcementsRef = firebase.database().ref("announcements");

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
          const currentDate = new Date();
          const eventList = Object.keys(eventData).map((key) => ({
            id: key,
            ...eventData[key],
          })).filter(event => new Date(event.date) > currentDate); // Filter upcoming events
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
      <div className="main-content">
        <div className="LeftDashboard">
          <div className="Welcome-message">
            <h2>Welcome! {userData.name}</h2>
          </div>
          {/* Stats Cards */}
          <div className="card-box d-flex">
            <div className="card-item">
              <h5>Profile Complete</h5>
              <p>40%</p>
            </div>
            <div className="card-item">
              <h5>Awards</h5>
              <p>60+</p>
            </div>
          </div>

          {/* Graph */}
          <div className="chart-containerp">
            <h5>Statistics</h5>
            <p>Progress Score</p>
            {/* Add chart here using Chart.js or other libraries */}
          </div>

          <div className="events-section">
            <h2 className="section-title">Upcoming Events</h2>
            {events.length > 0 ? (
              <div className="events-container">
                {events.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-image">
                      <img src={(event.image && event.image[0]) || "default-event.jpg"} alt={event.name} /> {/* Use the first image if defined */}
                    </div>
                    <div className="event-details">
                      <h3 className="event-title">{event.name}</h3>
                      <p className="event-info">{event.date} | {event.time}</p>
                      <p className="event-info">{event.venue}</p>
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

          {/* <div className="table-container">
            <h5>Star Students</h5>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>PRE2209</td>
                  <td><img src="https://via.placeholder.com/40" alt="Profile" /> John Smith</td>
                  <td>1165</td>
                  <td>97%</td>
                  <td>2023</td>
                </tr>
              </tbody>
            </table>
          </div>*/}
        </div> 

        <div className="RightBarDashboard">
          {/* Profile Card */}
          <div className="profile-card">
            <img src="https://via.placeholder.com/80" alt="Profile" />
            <h5>{userData.name}</h5>
            <p>{userData.email}</p>
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

          {/* Task List */}
          {/* <div className="task-box">
            <h5>Tasks</h5>
            <ul>
              <li>15% Listening - Speak 20 Minutes</li>
              <li>15% Grammar - Learn 5 new rules</li>
              <li>15% Pronunciation - Read 30 minutes</li>
            </ul>
          </div> */}
        </div>
      </div>
  );
};

export default Dashboard;