import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import '../styles/StudentJobPosting.css';

const StudentJobPosting = () => {
  const [postings, setPostings] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const fetchUser = () => {
      const user = firebase.auth().currentUser;
      if (user) setLoggedInUser(user.uid);
    };

    const fetchRecruiterPostings = async () => {
      try {
        const snapshot = await firebase.database().ref('Recruiters').once('value');
        const recruiters = snapshot.val() || {};
        const jobs = [];

        Object.entries(recruiters).forEach(([recruiterId, recruiterData]) => {
          Object.entries(recruiterData).forEach(([jd_id, jdData]) => {
            if (jdData.postRecruitmentStatus === true) {
              // Placement
              if (jdData.placement) {
                jobs.push({
                  recruiterId,
                  jd_id,
                  type: "Placement",
                  company: jdData.company_name,
                  job_title: jdData.placement.job_title,
                  salary: jdData.placement.ctcAndBreakup?.salary,
                  location: jdData.placement.jobLocation,
                  applicationDeadline: jdData.placement.selection_process?.expected_timeline || 'N/A',
                  logo: jdData.logoUrl || '',
                  jdFiles: jdData.placement.jdFiles || [],
                  fullDetails: jdData,
                });
              }

              // Internship
              if (jdData.internship) {
                jobs.push({
                  recruiterId,
                  jd_id,
                  type: "Internship",
                  company: jdData.company_name,
                  job_title: jdData.internship.internship_title,
                  stipend: jdData.internship.ctcAndBreakup?.stipend,
                  location: jdData.internship.remote_on_site,
                  applicationDeadline: jdData.internship.selection_process?.expected_timeline || 'N/A',
                  logo: jdData.logoUrl || '',
                  jdFiles: jdData.internship.jdFiles || [],
                  fullDetails: jdData,
                });
              }
            }
          });
        });

        setPostings(jobs);
      } catch (error) {
        console.error('Error fetching recruiters:', error);
      }
    };

    fetchUser();
    fetchRecruiterPostings();
  }, []);

  const handleApply = async (recruiterId, jd_id, recruiterDetails) => {
    if (!loggedInUser) {
      alert("Please log in to apply.");
      return;
    }

    try {
      // Step 1: Fetch user info
      const userRef = firebase.database().ref(`users/Student/${loggedInUser}`);
      const userSnap = await userRef.once("value");
      const userData = userSnap.val();
      if (!userData) {
        alert("User details not found.");
        return;
      }
      const { branch, graduationYear } = userData;

      // Step 2: Fetch student academic data
      const studentRef = firebase
        .database()
        .ref(`Students/${graduationYear}/${branch}/${loggedInUser}`);
      const studentSnap = await studentRef.once("value");
      const studentData = studentSnap.val();
      if (!studentData) {
        alert("Student academic record not found.");
        return;
      }

      const {
        cgpa,
        avgPercent,
        classXPercent,
        classXIIPercent,
        diplomaPercent,
        backlog,
        hasDiploma,
      } = studentData;

      // Step 3: Fetch job data
      const jobRef = firebase
        .database()
        .ref(`Recruiters/${recruiterId}/${jd_id}`);
      const jobSnap = await jobRef.once("value");
      const jobData = jobSnap.val();
      if (!jobData) {
        alert("Job details not found.");
        return;
      }

      const eligibility =
        (jobData.placement && jobData.placement.eligibility_criteria) ||
        (jobData.internship && jobData.internship.eligibility_criteria) ||
        {};
      const minCgpa = parseFloat(eligibility.minimum_cgpa_grade);
      const minPercent = parseFloat(eligibility.minimum_percentage);

      // Step 4: Eligibility checks
      // --- CGPA ---
      if (!cgpa || isNaN(parseFloat(cgpa))) {
        alert("CGPA is missing. Please update your profile.");
        return;
      }
      if (parseFloat(cgpa) < minCgpa) {
        alert(
          `You cannot apply. Required CGPA: ${minCgpa}, Your CGPA: ${cgpa}`
        );
        return;
      }

      // --- 10th ---
      if (!classXPercent || isNaN(parseFloat(classXPercent))) {
        alert("10th percentage is missing. Please update your profile.");
        return;
      }
      if (parseFloat(classXPercent) < minPercent) {
        alert(
          `You cannot apply. Required Percentage: ${minPercent}%. Your 10th: ${classXPercent}%`
        );
        return;
      }

      // --- 12th or Diploma ---
      if (hasDiploma === "Yes") {
        if (!diplomaPercent || isNaN(parseFloat(diplomaPercent))) {
          alert("Diploma percentage is missing. Please update your profile.");
          return;
        }
        if (parseFloat(diplomaPercent) < minPercent) {
          alert(
            `You cannot apply. Required Percentage: ${minPercent}%. Your Diploma: ${diplomaPercent}%`
          );
          return;
        }
      } else {
        if (!classXIIPercent || isNaN(parseFloat(classXIIPercent))) {
          alert("12th percentage is missing. Please update your profile.");
          return;
        }
        if (parseFloat(classXIIPercent) < minPercent) {
          alert(
            `You cannot apply. Required Percentage: ${minPercent}%. Your 12th: ${classXIIPercent}%`
          );
          return;
        }
      }

      // --- Backlogs ---
      if (backlog && backlog.toLowerCase() === "yes") {
        alert("You cannot apply. You have an active backlog.");
        return;
      }

      // Step 5: Save application in Recruiter tree
      const appliedRef = firebase
        .database()
        .ref(`Recruiters/${recruiterId}/${jd_id}/appliedstudents`);
      const appliedSnap = await appliedRef.once("value");
      const appliedList = appliedSnap.val() || [];

      if (appliedList.includes(loggedInUser)) {
        alert("You have already applied to this job.");
        return;
      }

      await appliedRef.set([...appliedList, loggedInUser]);


      // Step 6: Save in Student’s appliedJobs
      const statusRef = firebase
        .database()
        .ref(
          `Students/${graduationYear}/${branch}/${loggedInUser}/applications/${jd_id}`
        );

      await statusRef.set({
        company: recruiterDetails.company_name || "",
        jobTitle: jobData.placement?.job_title || jobData.internship?.internship_title || "",
        status: "Applied", // Initial stage
        oaInviteSent: false,
        interviewStatus: "Pending",
        offer: {
          isActive: false,
          accepted: false,
          declined: false,
        },
        timeline: [
          { stage: "Applied", date: new Date().toISOString().split("T")[0] }
        ]
      });

      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Application failed:", err);
      alert("Something went wrong while applying.");
    }
  };

  return (
    <div className='student-job-posting-container'>
      <h2>PPO and Internship</h2>
      <div className="job-listings">
        {postings.length === 0 && <p>No postings available currently.</p>}
        {postings.map((job, idx) => (
          <div key={idx} className="job-card">
            {job.logo && <img src={job.logo} alt={`${job.company} logo`} className="company-logo" />}
            <div className='job-header flex flex-row align-center gap-1'>
              <h3>{job.company}</h3>
              (<p>{job.type}</p>)
            </div>
            <p><b>Title:</b> {job.job_title}</p>
            <p><b>Location:</b> {job.location}</p>
            <p>
              <b>{job.type === 'Internship' ? 'Stipend' : 'Salary'}:</b> {job.stipend || job.salary || 'N/A'}
            </p>
            <p><b>Application Deadline:</b> {job.applicationDeadline}</p>
            <button onClick={() => setSelectedJob(job)}>View Details</button>
          </div>
        ))}
      </div>

      {selectedJob && (
        <div className="modal-overlay">
          <div className="job-details-modal">
            <button onClick={() => setSelectedJob(null)} className="close-btn">X</button>
            <div className="modal-header">
              {selectedJob.logo && (
                <img src={selectedJob.logo} alt={`${selectedJob.company} logo`} className="modal-logo" />
              )}
              <h2>{selectedJob.company}</h2>
            </div>

            {/* ==================== Common Details ==================== */}
            <div className="company-common">
              <h3>Company Information</h3>
              <p><b>Overview:</b> {selectedJob.fullDetails.company_overview}</p>
              <p><b>Industry Sector:</b> {selectedJob.fullDetails.industry_sector}</p>
              <p><b>Contact:</b> {selectedJob.fullDetails.companyContact}</p>
              <p><b>Alternate Contact:</b> {selectedJob.fullDetails.alternateContact}</p>
              <p><b>Website:</b> <a href={selectedJob.fullDetails.website} target="_blank" rel="noreferrer">{selectedJob.fullDetails.website}</a></p>
            </div>

            {/* ==================== Placement Details ==================== */}
            {selectedJob.type === "Placement" && (
              <div className="placement-details">
                <h3>Placement Details</h3>
                <p><b>Job Title:</b> {selectedJob.fullDetails.placement.job_title}</p>
                <p><b>Job Description:</b> {selectedJob.fullDetails.placement.job_desc}</p>
                <p><b>Location:</b> {selectedJob.fullDetails.placement.jobLocation}</p>
                <p><b>Employment Type:</b> {selectedJob.fullDetails.placement.type_of_employment}</p>
                <p><b>Expected Hires:</b> {selectedJob.fullDetails.placement.noOfExpectedHires}</p>
                <p><b>Salary:</b> {selectedJob.fullDetails.placement.ctcAndBreakup.salary}</p>
                <p><b>Bonus:</b> {selectedJob.fullDetails.placement.ctcAndBreakup.bonus}</p>
                <p><b>Additional Benefits:</b> {selectedJob.fullDetails.placement.ctcAndBreakup.additional_benefits}</p>

                <h4>Eligibility Criteria</h4>
                <p><b>Batch:</b> {selectedJob.fullDetails.placement.eligibility_criteria.batch_year_of_study}</p>
                <p><b>Minimum CGPA:</b> {selectedJob.fullDetails.placement.eligibility_criteria.minimum_cgpa_grade}</p>
                <p><b>Qualifications:</b> {selectedJob.fullDetails.placement.eligibility_criteria.required_qualifications}</p>
                <p><b>Skills:</b> {selectedJob.fullDetails.placement.eligibility_criteria.skill_requirements}</p>
                <p><b>Other:</b> {selectedJob.fullDetails.placement.eligibility_criteria.other_criteria}</p>

                <h4>Selection Process</h4>
                <p><b>Timeline:</b> {selectedJob.fullDetails.placement.selection_process.expected_timeline}</p>
                <p><b>Assessment:</b> {selectedJob.fullDetails.placement.selection_process.assessment_details}</p>
                <p><b>Stages:</b> {selectedJob.fullDetails.placement.selection_process.recruitment_stages?.join(", ")}</p>
              </div>
            )}

            {/* ==================== Internship Details ==================== */}
            {selectedJob.type === "Internship" && (
              <div className="internship-details">
                <h3>Internship Details</h3>
                <p><b>Internship Title:</b> {selectedJob.fullDetails.internship.internship_title}</p>
                <p><b>Description:</b> {selectedJob.fullDetails.internship.internship_description}</p>
                <p><b>Duration:</b> {selectedJob.fullDetails.internship.duration.start_date}
                  to {selectedJob.fullDetails.internship.duration.end_date}</p>
                <p><b>Employment Type:</b> {selectedJob.fullDetails.internship.type_of_employment}</p>
                <p><b>Location:</b> {selectedJob.fullDetails.internship.remote_on_site}</p>
                <p><b>Stipend:</b> {selectedJob.fullDetails.internship.ctcAndBreakup.stipend}</p>
                <p><b>Bonus:</b> {selectedJob.fullDetails.internship.ctcAndBreakup.bonus}</p>
                <p><b>Additional Benefits:</b> {selectedJob.fullDetails.internship.ctcAndBreakup.additional_benefits}</p>

                <h4>Eligibility Criteria</h4>
                <p><b>Batch:</b> {selectedJob.fullDetails.internship.eligibility_criteria.batch_year_of_study}</p>
                <p><b>Minimum CGPA:</b> {selectedJob.fullDetails.internship.eligibility_criteria.minimum_cgpa_grade}</p>
                <p><b>Qualifications:</b> {selectedJob.fullDetails.internship.eligibility_criteria.required_qualifications}</p>
                <p><b>Skills:</b> {selectedJob.fullDetails.internship.eligibility_criteria.skill_requirements}</p>
                <p><b>Other:</b> {selectedJob.fullDetails.internship.eligibility_criteria.other_criteria}</p>
              </div>
            )}

            <div className="modal-apply-btn-container">
              <button
                onClick={() => handleApply(selectedJob.recruiterId, selectedJob.jd_id, selectedJob.fullDetails)}
                className="apply-btn"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentJobPosting;
