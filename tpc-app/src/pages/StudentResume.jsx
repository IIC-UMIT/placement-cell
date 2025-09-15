import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
// import "../styles/MockTests.css"; // Optional CSS

const StudentResume = ({ loggedInUser }) => {
  const [userMeta, setUserMeta] = useState(null); // branch & gradYear
  const [studentData, setStudentData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // 1️⃣ Fetch logged-in user's metadata
  useEffect(() => {
    const userRef = firebase.database().ref(`users/Student/${loggedInUser}`);
    userRef.on("value", (snapshot) => {
      const data = snapshot.val();
      console.log("User meta fetched:", data); // DEBUG
      if (data) {
        setUserMeta({ branch: data.branch, gradYear: data.gradYear || data.graduationYear });
      }
    });
    return () => userRef.off();
  }, [loggedInUser]);

  // 2️⃣ Fetch student data once metadata is available
  useEffect(() => {
    if (!userMeta) return;

    const { branch, gradYear } = userMeta;
    if (!branch || !gradYear) return;

    const studentRef = firebase
      .database()
      .ref(`Students/${gradYear}/${branch}/${loggedInUser}`);

    studentRef.on("value", (snapshot) => {
      const data = snapshot.val();
      console.log("Student data fetched:", data); // DEBUG
      setStudentData(data);
    });

    return () => studentRef.off();
  }, [userMeta, loggedInUser]);

  if (!studentData) return <p>Loading student data...</p>;

  return (
    <div className="resume-container">
      {/* Header */}
      <div className="header">
        <h1>{studentData.name || "N/A"}</h1>
        <p>
          {studentData.email || "N/A"} |{" "}
          {studentData.linkedinLink ? (
            <a href={studentData.linkedinLink} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          ) : (
            "LinkedIn"
          )}{" "}
          | {studentData.phone || "N/A"}
        </p>
      </div>

      {/* Skills */}
      <div className="section">
        <h2>Skills</h2>
        <p>{studentData.skills || studentData.technicalSkills || "N/A"}</p>
      </div>

      {/* Experience */}
      <div className="section">
        <h2>Experience</h2>
        <p>{studentData.professionalExperience || "N/A"}</p>
      </div>

      {/* Projects */}
      <div className="section">
        <h2>Projects</h2>
        <ul>
          {studentData.projects
            ? Object.keys(studentData.projects).map((key) => (
                <li key={key}>
                  <strong>{studentData.projects[key].name}</strong> -{" "}
                  {studentData.projects[key].description}
                </li>
              ))
            : "N/A"}
        </ul>
      </div>

      {/* Education */}
      <div className="section">
        <h2>Education</h2>
        <p>
          <strong>Usha Mittal Institute of Technology</strong>
          <br />
          CGPA: {studentData.cgpa || "N/A"} | Avg SGPA:{" "}
          {studentData.sgpa
            ? studentData.sgpa.filter((v) => v !== "" && v !== "0").join(", ")
            : "N/A"}
        </p>
      </div>

      {/* Edit Button */}
      <button onClick={() => setIsEditing(true)}>Edit</button>

      {/* Edit Form Placeholder */}
      {isEditing && (
        <div className="edit-form">
          <p>Edit form will go here...</p>
        </div>
      )}
    </div>
  );
};

export default StudentResume;
