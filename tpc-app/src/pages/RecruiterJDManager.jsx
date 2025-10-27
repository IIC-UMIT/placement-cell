import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, Edit, Trash2 } from 'lucide-react';
import '../styles/RecruiterJDManager.css';

const RecruiterJDManager = () => {
  const [placements, setPlacements] = useState([]);
  const [internships, setInternships] = useState([]);
  const navigate = useNavigate();
  const userId = firebase.auth().currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    const ref = firebase.database().ref(`Recruiters/${userId}`);
    ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const jdList = Object.keys(data).map(jd_id => ({ ...data[jd_id], jd_id }));

      setPlacements(jdList.filter(job => job.placement));
      setInternships(jdList.filter(job => job.internship));
    });
    return () => ref.off();
  }, [userId]);

  const handleViewApplicants = jd_id => {
    navigate(`/Recruiter/StudentsApplied/${jd_id}`);
  };

  const handleEdit = jd_id => {
    navigate(`/Recruiter/EditJD/${jd_id}`);
  };

  const handleDelete = async jd_id => {
    if (window.confirm("Are you sure you want to delete this JD?")) {
      await firebase.database().ref(`Recruiters/${userId}/${jd_id}`).remove();
    }
  };

  const formatDate = jd_id => {
    const date = new Date(jd_id * 1000);
    return date.toLocaleDateString();
  };

  const renderJobCard = (job, type) => {
    const isInternship = type === "internship";
    const details = isInternship ? job.internship : job.placement;

    return (
      <div key={job.jd_id} className="job-card">
        {/* Left Section */}
        <div className="job-details">
          <h2 className="job-title">
            {isInternship ? details.internship_title : details.job_title}
          </h2>
          <p className="company-name">{job.company_name}</p>
          <p className="job-description">
            {isInternship ? details.internship_description : details.job_desc}
          </p>

          <div className="job-meta">
            <p><b>Location:</b> {isInternship ? details.remote_on_site : details.jobLocation}</p>
            <p><b>{isInternship ? "Stipend" : "CTC"}:</b> {isInternship ? details.ctcAndBreakup?.stipend : details.ctcAndBreakup?.salary}</p>
            <p><b>Website:</b> {job.website}</p>
            <p><b>Eligibility:</b> {details.eligibility_criteria?.required_qualifications}, CGPA: {details.eligibility_criteria?.minimum_cgpa_grade}, Batch: {details.eligibility_criteria?.batch_year_of_study}</p>
          </div>

          <span className="posted-date">Posted: {formatDate(job.jd_id)}</span>
        </div>

        {/* Right Section */}
        <div className="job-actions">
          <img
            src="https://via.placeholder.com/80"
            alt="Company Logo"
            className="company-logo"
          />

          <div className="action-buttons">
            <button className="view" onClick={() => handleViewApplicants(job.jd_id)}>
              <Eye size={18} />
            </button>
            <button className="edit" onClick={() => handleEdit(job.jd_id)}>
              <Edit size={18} />
            </button>
            <button className="delete" onClick={() => handleDelete(job.jd_id)}>
              <Trash2 size={18} />
            </button>
          </div>

          <div className="applicants-badge">
            <Users size={14} className="mr-1" />{" "}
            {job.appliedstudents ? Object.keys(job.appliedstudents).length : 0} Applicants
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="recruiter-container">
      <main>
        {/* Header */}
        <div className="recruiter-header">
          <h1>Job Descriptions</h1>
            <button
              onClick={() => navigate('/Recruiter/JobDescription')}
              className="apply-btn"
            >
              + Create New JD
            </button>
        </div>

        {/* Placements */}
        <h2 className="section-title">Placements</h2>
        {placements.length > 0 ? (
          <div className="job-list">
            {placements.map(job => renderJobCard(job, "placement"))}
          </div>
        ) : (
          <p className="text-gray-500 mb-6">No placement JDs found.</p>
        )}

        {/* Internships */}
        <h2 className="section-title">Internships</h2>
        {internships.length > 0 ? (
          <div className="job-list">
            {internships.map(job => renderJobCard(job, "internship"))}
          </div>
        ) : (
          <p className="text-gray-500">No internship JDs found.</p>
        )}

      </main>
    </div>
  );
};

export default RecruiterJDManager;
