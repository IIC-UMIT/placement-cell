import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "../styles/StudentResume.css";

const calcAverage = (arr) => {
  if (!Array.isArray(arr)) return "";
  const nums = arr
    .map((v) => (v === null || v === undefined ? "" : String(v).trim()))
    .filter((v) => v !== "" && !isNaN(v))
    .map(Number);
  if (nums.length === 0) return "";
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
};

const normalizeProjects = (projects) => {
  if (!projects) return [];
  if (Array.isArray(projects)) return projects.filter(p => {
    const title = p && (p.title || p.name) ? String(p.title || p.name).trim() : '';
    const desc = p && (p.description || p.summary) ? String(p.description || p.summary).trim() : '';
    return title !== '' || desc !== '';
  });
  // If object keyed by id
  return Object.keys(projects).map((k) => projects[k]).filter(p => {
    const title = p && (p.title || p.name) ? String(p.title || p.name).trim() : '';
    const desc = p && (p.description || p.summary) ? String(p.description || p.summary).trim() : '';
    return title !== '' || desc !== '';
  });
};

const normalizeExperiences = (experiences) => {
  if (!experiences) return [];
  if (Array.isArray(experiences)) return experiences.filter(e => {
    const company = e && (e.company || e.organization) ? String(e.company || e.organization).trim() : '';
    const months = e && e.months ? String(e.months).trim() : '';
    const desc = e && e.description ? String(e.description).trim() : '';
    return company !== '' || months !== '' || desc !== '';
  });
  return Object.keys(experiences).map((k) => experiences[k]).filter(e => {
    const company = e && (e.company || e.organization) ? String(e.company || e.organization).trim() : '';
    const months = e && e.months ? String(e.months).trim() : '';
    const desc = e && e.description ? String(e.description).trim() : '';
    return company !== '' || months !== '' || desc !== '';
  });
};

const StudentResume = ({ loggedInUser }) => {
  const [userMeta, setUserMeta] = useState(null);
  // prevent eslint no-unused-vars if userMeta is only sometimes used:
  /* istanbul ignore next */ void userMeta;
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // new loading state
  const navigate = useNavigate();

  // Consolidated lookup:
  useEffect(() => {
    if (!loggedInUser) return;
    setIsLoading(true);

    const userRef = firebase.database().ref(`users/Student/${loggedInUser}`);
    userRef.once("value").then((snap) => {
      const data = snap.val();

      // If we have branch and grad year in user metadata, fetch directly
      const branchFromMeta = data && data.branch;
      const gradFromMeta = data && (data.gradYear || data.graduationYear);
      if (branchFromMeta && gradFromMeta) {
        const ref = firebase.database().ref(`Students/${gradFromMeta}/${branchFromMeta}/${loggedInUser}`);
        return ref.once("value").then((s) => {
          setUserMeta({ branch: branchFromMeta, gradYear: gradFromMeta });
          setStudentData(s.val() || {});
          setIsLoading(false);
        });
      }

      // Fallback: search the Students tree to find the user under any year/branch
      return firebase.database().ref('Students').once('value').then((studentsSnap) => {
        const students = studentsSnap.val() || {};
        let found = null;
        for (const yearKey of Object.keys(students)) {
          const yearObj = students[yearKey] || {};
          for (const branchKey of Object.keys(yearObj)) {
            const branchObj = yearObj[branchKey] || {};
            if (branchObj.hasOwnProperty(loggedInUser)) {
              found = {
                gradYear: yearKey,
                branch: branchKey,
                data: branchObj[loggedInUser],
              };
              break;
            }
          }
          if (found) break;
        }

        if (found) {
          setUserMeta({ branch: found.branch, gradYear: found.gradYear });
          setStudentData(found.data || {});
        } else {
          // No record found anywhere
          setStudentData({});
        }
        setIsLoading(false);
      });
    }).catch((e) => {
      console.error(e);
      setStudentData({});
      setIsLoading(false);
    });
  }, [loggedInUser]);

  // Show loading indicator while we are resolving the correct path
  if (isLoading) return <div className="resume-loading">Loading resume...</div>;

  // If we explicitly determined there's no student data, show the incomplete-application card
  const isEmptyStudent = !studentData || (studentData && Object.keys(studentData).length === 0);
  if (isEmptyStudent) {
    return (
      <div className="resume-wrapper">
        <div className="resume-card">
          <div style={{ padding: 24 }}>
            <h2>Your application is incomplete</h2>
            <p>We couldn't find your profile details. Please complete your application to view your resume.</p>
            <div style={{ marginTop: 16 }}>
              <button className="submit-button" onClick={() => navigate('/Student/Profile')}>Complete your application</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const avgCgpa = studentData.cgpa || calcAverage(studentData.sgpa);
  const avgPercent = studentData.avgPercent || calcAverage(studentData.percentage);

  const projects = normalizeProjects(studentData.projects);
  const experiences = normalizeExperiences(studentData.experiences);

  const photoSrc = (() => {
    const p = studentData.photo;
    if (!p) return null;
    if (typeof p === "string") return p;
    // If it's a Firebase storage url object or File-like, try to createObjectURL if running in browser and it's a File
    try {
      if (p instanceof File) return URL.createObjectURL(p);
    } catch (e) {
      // ignore
    }
    return null;
  })();

  return (
    <div className="resume-wrapper">
      <div className="resume-card">
        <aside className="left-col">
          <div className="photo-wrap">
            {photoSrc ? (
              <img src={photoSrc} alt={studentData.name || "photo"} />
            ) : (
              <div className="photo-placeholder">{(studentData.name || "").split(" ")[0] || "S"}</div>
            )}
          </div>
          <div className="contact">
            <h3>Contact</h3>
            <p><strong>Email:</strong> {studentData.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {studentData.phone || 'N/A'}</p>
            <p><strong>Location:</strong> {studentData.address || 'N/A'}</p>
            <p><strong>LinkedIn:</strong> {studentData.linkedinLink ? <a href={studentData.linkedinLink} target="_blank" rel="noreferrer">Profile</a> : 'N/A'}</p>
            <p><strong>GitHub:</strong> {studentData.githubLink ? <a href={studentData.githubLink} target="_blank" rel="noreferrer">Profile</a> : 'N/A'}</p>
          </div>

          <div className="education-summary">
            <h3>Education</h3>
            <p><strong>Institute:</strong> {studentData.institute || 'Usha Mittal Institute of Technology'}</p>
            <p><strong>Branch:</strong> {studentData.branch || 'N/A'}</p>
            <p><strong>Graduation:</strong> {studentData.graduationMonth ? `${studentData.graduationMonth} ` : ''}{studentData.graduationYear || 'N/A'}</p>
            <p><strong>Avg CGPA:</strong> {avgCgpa || 'N/A'}</p>
            <p><strong>Avg %:</strong> {avgPercent || 'N/A'}</p>
            <p><strong>Backlogs:</strong> {studentData.backlog || 'No'}</p>
          </div>

          {/* skills moved to right column for better resume layout */}

          <div className="certs">
            <h3>Certifications</h3>
            <ul>
              {(Array.isArray(studentData.certifications) ? studentData.certifications : []).slice(0, 10).map((c, i) => (
                <li key={i}>{c}</li>
              ))}
              {(!studentData.certifications || studentData.certifications.length === 0) && <li>N/A</li>}
            </ul>
          </div>
        </aside>

        <main className="right-col">
          <header className="top">
            <h1 className="name">{studentData.name || 'Student Name'}</h1>
            <div className="sub">{studentData.description || studentData.summary || 'Aspiring professional with strong technical background and hands-on project experience.'}</div>
          </header>

          <section className="section">
            <h2>Skills</h2>
            <div className="skill-list">
              {(Array.isArray(studentData.technicalSkills) ? studentData.technicalSkills : (studentData.technicalSkills ? [studentData.technicalSkills] : [])).map((s, i) => (
                <span key={i} className="skill-chip">{s}</span>
              ))}
            </div>
          </section>

          <section className="section">
            <h2>Experience</h2>
            {experiences.length === 0 ? <p>N/A</p> : (
              <div className="timeline">
                {experiences.map((exp, i) => (
                  <div key={i} className="timeline-item">
                    <div className="ti-left">
                      <strong>{exp.company || exp.organization}</strong>
                      <div className="ti-right">{exp.description || ''}</div>
                    </div>
                    <div className="muted">{exp.months ? `${exp.months} months` : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="section">
            <h2>Projects</h2>
            {projects.length === 0 ? <p>N/A</p> : (
              <div className="projects">
                {projects.map((p, i) => (
                  <div className="project" key={i}>
                    <h4>{p.title || p.name}</h4>
                    <p>{p.description || p.summary || 'No description provided.'}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="section">
            <h2>Education Details</h2>
            <div className="edu-grid">
              <div>
                <strong>Class X:</strong>
                <div>{studentData.classXBoard || 'N/A'} • {studentData.classXPercent || 'N/A'}%</div>
              </div>
              <div>
                <strong>Class XII / Diploma:</strong>
                <div>{studentData.hasDiploma === 'Yes' ? `${studentData.diplomaDegree || ''} • ${studentData.diplomaPercent || 'N/A'}%` : `${studentData.classXIIBoard || ''} • ${studentData.classXIIPercent || 'N/A'}%`}</div>
              </div>
              <div>
                <strong>PRN / Roll:</strong>
                <div>{studentData.prn || 'N/A'} • {studentData.rollNo || 'N/A'}</div>
              </div>
              <div>
                <strong>Nationality / DOB:</strong>
                <div>{studentData.nationality || 'N/A'} • {studentData.dob || 'N/A'}</div>
              </div>
            </div>
          </section>

          <section className="section small">
            <h2>Links</h2>
            <p>LinkedIn: {studentData.linkedinLink ? <a href={studentData.linkedinLink} target="_blank" rel="noreferrer">View</a> : 'N/A'}</p>
            <p>GitHub: {studentData.githubLink ? <a href={studentData.githubLink} target="_blank" rel="noreferrer">View</a> : 'N/A'}</p>
            <p>Resume: {studentData.resume ? (typeof studentData.resume === 'string' ? (<a href={studentData.resume} target="_blank" rel="noreferrer">Download</a>) : studentData.resume.name || 'Uploaded') : 'N/A'}</p>
          </section>

        </main>
      </div>
       <br></br>
      <br></br>
    </div>
  );
};

export default StudentResume;
