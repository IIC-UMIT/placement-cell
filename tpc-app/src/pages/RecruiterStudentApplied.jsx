import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { Modal } from 'react-bootstrap';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import '../styles/StudentApplied.css';

const StudentsApplied = ({ loggedInUser }) => {
  const { jd_id } = useParams();

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
    if (!jd_id) return;

    let listenerRef = null;

    const setupListenerForPath = (path) => {
      if (listenerRef) listenerRef.off();
      listenerRef = firebase.database().ref(path);
      console.log('[StudentsApplied] listening to', path);
      listenerRef.on('value', snapshot => {
        const raw = snapshot.val();
        console.log('[StudentsApplied] raw appliedstudents', raw);
        let ids = [];
        if (!raw) ids = [];
        else if (Array.isArray(raw)) ids = raw.filter(Boolean);
        else if (typeof raw === 'object') ids = Object.values(raw).filter(Boolean);
        else ids = [raw];
        setAppliedStudentIds(ids);
      });
    };

    (async () => {
      try {
        // First try current user path (fast)
        if (loggedInUser) {
          const existsSnap = await firebase.database().ref(`Recruiters/${loggedInUser}/${jd_id}`).once('value');
          if (existsSnap.exists()) {
            setupListenerForPath(`Recruiters/${loggedInUser}/${jd_id}/appliedstudents`);
            return;
          }
        }

        // Fallback: scan all recruiters to find jd_id node
        const recsSnap = await firebase.database().ref('Recruiters').once('value');
        const recs = recsSnap.val() || {};
        for (const recId of Object.keys(recs)) {
          const recNode = recs[recId] || {};
          if (recNode[jd_id]) {
            setupListenerForPath(`Recruiters/${recId}/${jd_id}/appliedstudents`);
            return;
          }
        }

        // If none found, set empty
        console.log('[StudentsApplied] no JD node found under Recruiters for', jd_id);
        setAppliedStudentIds([]);
      } catch (err) {
        console.error('[StudentsApplied] error locating JD:', err);
        setAppliedStudentIds([]);
      }
    })();

    return () => { if (listenerRef) listenerRef.off(); };
  }, [loggedInUser, jd_id]);

  // Fetch student details using appliedStudentIds
  useEffect(() => {
    // For each student_id, fetch branch/year then student data
    async function fetchStudents() {
      const allStudents = [];
      for (const studentId of appliedStudentIds) {
        try {
          // Try multiple places for user metadata
          let userSnapshot = await firebase.database().ref(`users/Student/${studentId}`).once('value');
          if (!userSnapshot.exists()) {
            userSnapshot = await firebase.database().ref(`users/${studentId}`).once('value');
          }
          const userData = userSnapshot.val() || {};

          let branch = userData.branch || userData?.profile?.branch;
          let graduationYear = userData.graduationYear || userData?.profile?.graduationYear || userData?.graduation_year;

          let studentData = null;

          if (branch && graduationYear) {
            const studentSnapshot = await firebase.database().ref(`Students/${graduationYear}/${branch}/${studentId}`).once('value');
            if (studentSnapshot.exists()) studentData = studentSnapshot.val();
          }

          // Fallback: search students tree for the studentId (expensive but useful when DB shape varies)
          if (!studentData) {
            const studentsRoot = await firebase.database().ref('Students').once('value');
            const studentsVal = studentsRoot.val() || {};
            outer: for (const yearKey of Object.keys(studentsVal)) {
              const branches = studentsVal[yearKey] || {};
              for (const branchKey of Object.keys(branches)) {
                const branchNode = branches[branchKey] || {};
                if (branchNode[studentId]) {
                  studentData = branchNode[studentId];
                  graduationYear = yearKey;
                  branch = branchKey;
                  break outer;
                }
              }
            }
          }

          // If we couldn't find the detailed student profile, still push a fallback
          // using whatever user metadata we have. This ensures applied students show even
          // if the full students/{year}/{branch}/{id} entry is missing.
          const record = {
            studentId,
            branch: branch || null,
            graduationYear: graduationYear || null,
            // prefer detailed studentData fields, fall back to userData
            ...(studentData || {}),
            ...userData,
          };
          allStudents.push(record);
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
    <div className="students-applied-container">
      <div className="students-applied-header">
        <h2>Students Applied for Job {jd_id}</h2>
      </div>

      <div className="students-applied-controls">
        <input
          type="text"
          className="skill-filter"
          placeholder="Filter by skill"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
        />

        <button onClick={toggleSelectAll}>
          {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
        </button>

        <DownloadTableExcel
          filename={`selected_students_${jd_id}`}
          sheet="students"
          currentTableRef={tableRef.current}
        >
          <button disabled={selectedStudents.length === 0}>Export Selected to Excel</button>
        </DownloadTableExcel>
      </div>

      <table ref={tableRef} className="students-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                onChange={toggleSelectAll}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Branch</th>
            <th>Year</th>
            <th>Average CGPA</th>
            <th>View Resume</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 && (
            <tr>
              <td colSpan={7} className="no-results">No students found</td>
            </tr>
          )}

          {filteredStudents.map(student => (
            <tr key={student.studentId}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.studentId)}
                  onChange={() => toggleStudentSelection(student.studentId)}
                />
              </td>
              <td>{student.name || student.fullName || student.studentId}</td>
              <td>{student.email || student.emailId || ''}</td>
              <td>{student.branch || ''}</td>
              <td>{student.graduationYear || student.year || ''}</td>
              <td>{student.averageCGPA || student.gpa || ''}</td>
              <td>
                <button onClick={() => openResumeModal(student)}>View Resume</button>
              </td>
            </tr>
          ))}
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
              <h3>{activeResume.name || activeResume.studentId}</h3>
              <p>Email: {activeResume.email || activeResume.emailId}</p>
              <p>Branch: {activeResume.branch}</p>
              <p>Year: {activeResume.graduationYear || activeResume.year}</p>
              <p>CGPA: {activeResume.averageCGPA || activeResume.gpa}</p>
              {/* Other resume details */}
              <h4>Skills</h4>
              <ul>{(activeResume.skills || []).map(skill => (
                <li key={skill.name || skill}>{(skill.name || skill)}{skill.level ? ` - ${skill.level}` : ''}</li>
              ))}</ul>
              <h4>Education</h4>
              <ul>{(activeResume.education || []).map(edu => (
                <li key={edu.degree || edu.title}>{edu.degree || edu.title} from {edu.institution} ({edu.startDate} - {edu.endDate})</li>
              ))}</ul>
              <h4>Projects</h4>
              <ul>{(activeResume.projects || []).map(proj => (
                <li key={proj.title || proj.name}>{proj.title || proj.name}: {proj.description}</li>
              ))}</ul>
              <h4>Work Experience</h4>
              <ul>{(activeResume.experience || []).map(exp => (
                <li key={exp.position || exp.role}>{exp.position || exp.role} at {exp.company} ({exp.startDate} - {exp.endDate})</li>
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
