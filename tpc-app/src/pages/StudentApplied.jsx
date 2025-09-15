import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { Modal } from 'react-bootstrap';
import { DownloadTableExcel } from 'react-export-table-to-excel';

const StudentsApplied = () => {
  const { jd_id } = useParams();
  const userId = firebase.auth().currentUser?.uid;

  const [appliedStudentIds, setAppliedStudentIds] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [activeResume, setActiveResume] = useState(null);
  const [skillFilter, setSkillFilter] = useState('');

  const tableRef = useRef(null);

  // Fetch applied student IDs for this job
  useEffect(() => {
    if (!userId || !jd_id) return;
    const ref = firebase.database().ref(`Recruiters/${userId}/${jd_id}/appliedstudents`);
    ref.on('value', snapshot => {
      const ids = snapshot.val() || [];
      setAppliedStudentIds(ids);
    });
    return () => ref.off();
  }, [userId, jd_id]);

  // Fetch student details using appliedStudentIds
  useEffect(() => {
    // For each student_id, fetch branch/year then student data
    async function fetchStudents() {
      const allStudents = [];
      for (const studentId of appliedStudentIds) {
        try {
          // First fetch branch and graduation year from `users/{studentId}`
          const userSnapshot = await firebase.database().ref(`users/${studentId}`).once('value');
          const userData = userSnapshot.val();
          if (!userData) continue;
          const { branch, graduationYear } = userData; // Adjust keys as per database structure
          if (!branch || !graduationYear) continue;

          // Then fetch student details from students/{gradYear}/{branch}/{studentId}
          const studentSnapshot = await firebase.database().ref(`students/${graduationYear}/${branch}/${studentId}`).once('value');
          const studentData = studentSnapshot.val();
          if (!studentData) continue;

          allStudents.push({ studentId, branch, graduationYear, ...studentData });
        } catch (error) {
          console.error('Error fetching student data:', error);
        }
      }
      setStudents(allStudents);
      setFilteredStudents(allStudents); // Initialize filtered
    }
    if (appliedStudentIds.length > 0) {
      fetchStudents();
    } else {
      setStudents([]);
      setFilteredStudents([]);
    }
  }, [appliedStudentIds]);

  // Handle view resume modal
  const openResumeModal = student => {
    setActiveResume(student);
    setShowResumeModal(true);
  };
  const closeResumeModal = () => {
    setShowResumeModal(false);
    setActiveResume(null);
  };

  // Checkbox change handlers
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.studentId));
    }
  };

  // Filter by recruiter-student skill matching
  useEffect(() => {
    if (!skillFilter.trim()) {
      setFilteredStudents(students);
    } else {
      const lowerFilter = skillFilter.toLowerCase();
      setFilteredStudents(students.filter(s => {
        // Adjust property names for skills as per your data schema
        const studentSkills = (s.skills || []).map(skill => skill.name.toLowerCase());
        return studentSkills.some(skill => skill.includes(lowerFilter));
      }));
      setSelectedStudents([]); // reset selection when filters change
    }
  }, [skillFilter, students]);

  // Placeholder for email sending and Excel export logic...

  return (
    <div>
      <h2>Students Applied for Job {jd_id}</h2>

      <input 
        type="text" 
        placeholder="Filter by skill"
        value={skillFilter}
        onChange={(e) => setSkillFilter(e.target.value)}
        style={{marginBottom: '10px'}}
      />

      <button onClick={toggleSelectAll}>
        {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
      </button>

      {/* Add buttons for Send Email (selected), Export Excel */}
      {/* Below simplified export example uses react-export-table-to-excel */}
      <DownloadTableExcel
        filename={`selected_students_${jd_id}`}
        sheet="students"
        currentTableRef={tableRef.current}
      >
        <button disabled={selectedStudents.length === 0}>Export Selected to Excel</button>
      </DownloadTableExcel>

      <table ref={tableRef} border="1" cellPadding="5" style={{width: '100%', marginTop: '10px'}}>
        <thead>
          <tr>
            <th><input type="checkbox" 
              checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
              onChange={toggleSelectAll} /></th>
            <th>Name</th>
            <th>Email</th>
            <th>Branch</th>
            <th>Year</th>
            <th>Average CGPA</th>
            <th>View Resume</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(student => (
            <tr key={student.studentId}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedStudents.includes(student.studentId)} 
                  onChange={() => toggleStudentSelection(student.studentId)} 
                />
              </td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.branch}</td>
              <td>{student.graduationYear}</td>
              <td>{student.averageCGPA || student.gpa}</td>
              <td>
                <button onClick={() => openResumeModal(student)}>View Resume</button>
              </td>
            </tr>
          ))}
          {filteredStudents.length === 0 &&
            <tr><td colSpan="7">No students found</td></tr>
          }
        </tbody>
      </table>

      {/* Resume Modal */}
      <Modal show={showResumeModal} onHide={closeResumeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Resume: {activeResume?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeResume ? (
            <div>
              <h3>{activeResume.name}</h3>
              <p>Email: {activeResume.email}</p>
              <p>Branch: {activeResume.branch}</p>
              <p>Year: {activeResume.graduationYear}</p>
              <p>CGPA: {activeResume.averageCGPA || activeResume.gpa}</p>
              {/* Other resume details */}
              <h4>Skills</h4>
              <ul>{(activeResume.skills || []).map(skill => (
                <li key={skill.name}>{skill.name} - {skill.level}</li>
              ))}</ul>
              <h4>Education</h4>
              <ul>{(activeResume.education || []).map(edu => (
                <li key={edu.degree}>{edu.degree} from {edu.institution} ({edu.startDate} - {edu.endDate})</li>
              ))}</ul>
              <h4>Projects</h4>
              <ul>{(activeResume.projects || []).map(proj => (
                <li key={proj.title}>{proj.title}: {proj.description}</li>
              ))}</ul>
              <h4>Work Experience</h4>
              <ul>{(activeResume.experience || []).map(exp => (
                <li key={exp.position}>{exp.position} at {exp.company} ({exp.startDate} - {exp.endDate})</li>
              ))}</ul>
              {/* Add more details if needed */}
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StudentsApplied;
