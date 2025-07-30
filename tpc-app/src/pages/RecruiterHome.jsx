// RecruiterDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/RecruiterHome.css'; // Import the new CSS file

const RecruiterHome = () => {
  const [activeJobs, setActiveJobs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [candidateStats, setCandidateStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  
  // Mock data fetch (replace with actual API calls)
  useEffect(() => {
    // Fetch data from your API
    setActiveJobs([
      { id: 1, title: 'Software Engineer', department: 'Engineering', applicants: 24, deadline: '2025-05-15' },
      { id: 2, title: 'Product Manager', department: 'Product', applicants: 18, deadline: '2025-05-20' },
      { id: 3, title: 'UX Designer', department: 'Design', applicants: 12, deadline: '2025-05-10' },
    ]);

    setUpcomingEvents([
      { id: 1, title: 'Technical Interview', candidate: 'Alex Johnson', position: 'Software Engineer', date: '2025-04-23', time: '10:00 AM' },
      { id: 2, title: 'Campus Recruitment Drive', location: 'MIT', date: '2025-04-28', time: '09:00 AM' },
    ]);

    setCandidateStats({
      total: 54,
      new: 12,
      screening: 18,
      interview: 15,
      offered: 6,
      rejected: 3
    });

    setNotifications([
      { id: 1, message: 'New application for Software Engineer position', time: '2 hours ago' },
      { id: 2, message: 'Interview scheduled with Taylor Smith', time: '5 hours ago' },
      { id: 3, message: 'Deadline approaching for Product Manager JD', time: '1 day ago' },
    ]);
  }, []);

  return (
    <div className="main-content">
      <div className="LeftDashboard">
        <div className="Welcome-message">
          <h2>Welcome! Recruiter Name</h2>
        </div>
        
        {/* Stats Cards */}
        <div className="card-box">
          <div className="card-item">
            <h5>Active Jobs</h5>
            <p>{activeJobs.length}</p>
          </div>
          <div className="card-item">
            <h5>Total Candidates</h5>
            <p>{candidateStats.total || 0}</p>
          </div>
          <div className="card-item">
            <h5>Upcoming Events</h5>
            <p>{upcomingEvents.length}</p>
          </div>
        </div>

        {/* Active Jobs Section */}
        <div className="jobs-section">
          <div className="section-title">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Active Job Postings</h2>
              <Link to="/recruiter/jobs/new" className="custom-button">
                <Plus size={16} />
                <span>New Job</span>
              </Link>
            </div>
          </div>
          
          {activeJobs.length > 0 ? (
            <div className="jobs-container">
              {activeJobs.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-image">
                    <img src="/api/placeholder/80/80" alt={job.title} />
                  </div>
                  <div className="job-details">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-info">Department: {job.department}</p>
                    <p className="job-info">Deadline: {job.deadline}</p>
                  </div>
                  <div className="job-applicants">
                    <p>{job.applicants} Applicants</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-jobs">No active jobs available.</p>
          )}
        </div>

        {/* Candidate Pipeline */}
        <div className="pipeline-container">
          <div className="pipeline-title">
            <h5>Candidate Pipeline</h5>
            <button className="view-all" onClick={() => console.log('View All clicked')}>View All</button>
          </div>
          <div className="pipeline-stages">
            <div className="pipeline-stage stage-new">
              <h3>New Applications</h3>
              <p>{candidateStats.new || 0}</p>
            </div>
            <div className="pipeline-stage stage-screening">
              <h3>Screening</h3>
              <p>{candidateStats.screening || 0}</p>
            </div>
            <div className="pipeline-stage stage-interview">
              <h3>Interview</h3>
              <p>{candidateStats.interview || 0}</p>
            </div>
            <div className="pipeline-stage stage-offer">
              <h3>Offer</h3>
              <p>{candidateStats.offered || 0}</p>
            </div>
            <div className="pipeline-stage stage-rejected">
              <h3>Rejected</h3>
              <p>{candidateStats.rejected || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="RightBarDashboard">
        {/* Profile Card */}
        <div className="profile-card">
          <img src="/api/placeholder/80/80" alt="Profile" />
          <h5>Recruiter Name</h5>
          <p>recruiter@company.com</p>
        </div>

        {/* Upcoming Events */}
        <div className="announcement-card">
          <h5>Upcoming Events</h5>
          <div className="announcement-list">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div key={event.id} className="announcement">
                  <div className="profile">
                    <img src="/api/placeholder/40/40" alt="Event" />
                    <div>
                      <p className="mb-0">{event.title}</p>
                      <small>{event.candidate ? `Candidate: ${event.candidate}` : event.location}</small>
                    </div>
                  </div>
                  <div className="timestamp">{event.date} • {event.time}</div>
                </div>
              ))
            ) : (
              <p>No upcoming events.</p>
            )}
          </div>
        </div>
        
        {/* Notifications */}
        <div className="announcement-card">
          <h5>{notifications.length} Notifications</h5>
          <div className="announcement-list">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div key={notification.id} className="announcement">
                  <div className="profile">
                    <img src="/api/placeholder/40/40" alt="Notification" />
                    <div>
                      <p className="mb-0">{notification.message}</p>
                      <small>System Notification</small>
                    </div>
                  </div>
                  <div className="timestamp">{notification.time}</div>
                </div>
              ))
            ) : (
              <p>No notifications available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterHome;