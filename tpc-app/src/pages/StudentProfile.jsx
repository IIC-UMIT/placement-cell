import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import '../styles/StudentProfile.css';

function StudentProfile({ loggedInUser }) {
  const [studentData, setStudentData] = useState({
    name: '',
    prn: '',
    rollNo: '',
    sex: 'Female',
    dob: '',
    nationality: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    branch: '',
    gradMonth: '',
    gradYear: '',
    yearOfStudy: '',
    tenthBoard: '',
    tenthPercent: '',
    tenthYear: '',
    twelfthPercent: '',
    twelfthYear: '',
    diplomaPercent: '',
    diplomaPointer: '',
    sgpa: Array(6).fill(''),
    avgCgpa: '',
    semPercent: Array(6).fill(''),
    avgPercent: '',
    activeBacklog: 'No',
    backlogCount: '',
    clearedKT: '',
    skills: '',
    experiences: [],
    projects: [],
    resumeLink: '',
    certifications: '',
    githubLink: '',
    linkedinLink: '',
  });

  // Graduation year/month options
  const currentYear = new Date().getFullYear();
  const gradYears = Array.from({ length: 6 }, (_, i) => currentYear + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const [hasDiploma, setHasDiploma] = useState('No');

  // Move getAcademicYear inside the component to fix the no-undef error
  const getAcademicYear = (graduationYear) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    if (graduationYear === currentYear + 1) return currentMonth >= 7 ? '4th' : '3rd';
    if (graduationYear === currentYear + 2) return currentMonth >= 7 ? '3rd' : '2nd';
    if (graduationYear === currentYear + 3) return currentMonth >= 7 ? '2nd' : '1st';
    if (graduationYear === currentYear + 4) return '1st';

    return '';
  };

  useEffect(() => {
    const year = getAcademicYear(studentData.graduationYear);
    setStudentData((prevData) => ({ ...prevData, year }));
  }, [studentData.graduationYear]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === 'certificates') {
      const newFiles = Array.from(files);
      setStudentData((prevData) => ({
        ...prevData,
        certificates: [...prevData.certificates, ...newFiles],
      }));
    } else {
      setStudentData((prevData) => ({
        ...prevData,
        [name]: files ? files[0] : value,
      }));
    }
  };

  const handleSgpaChange = (index, value) => {
    const updatedSgpa = [...studentData.sgpa];
    updatedSgpa[index] = value;
    setStudentData((prevData) => ({ ...prevData, sgpa: updatedSgpa }));
  };

  const handleSemPercentChange = (index, value) => {
    const updatedSemPercent = [...studentData.semPercent];
    updatedSemPercent[index] = value;
    setStudentData((prevData) => ({ ...prevData, semPercent: updatedSemPercent }));
  };

  const addExperience = () => {
    setStudentData((prevData) => ({
      ...prevData,
      experiences: [...prevData.experiences, { company: '', months: '', description: '' }],
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...studentData.experiences];
    if (!updated[index]) updated[index] = { company: '', months: '', description: '' };
    updated[index][field] = value;
    setStudentData((prevData) => ({ ...prevData, experiences: updated }));
  };

  const addProject = () => {
    setStudentData((prevData) => ({
      ...prevData,
      projects: [...prevData.projects, { title: '', description: '' }],
    }));
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...studentData.projects];
    updated[index][field] = value;
    setStudentData((prevData) => ({ ...prevData, projects: updated }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const dbPath = `Students/${studentData.prn}`;
    try {
      await firebase.database().ref(dbPath).set(studentData);
      alert('Form submitted successfully!');
    } catch (error) {
      alert('Error submitting form.');
    }
  };

  return (
    <div className="student-page">
      <h1>Student Information</h1>
      <form onSubmit={handleSubmit}>
        {/* Personal Details */}
        <h2>Personal Details</h2>
        <div className="form-group">
          <label>Full Name:</label>
          <input type="text" name="name" value={studentData.name} onChange={handleChange} required />
        </div>
        {/* PRN and Roll No. in one row */}
        <div className="flex-row">
          <div className="form-group">
            <label>PRN No.:</label>
            <input type="text" name="prn" value={studentData.prn} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Roll No.:</label>
            <input type="text" name="rollNo" value={studentData.rollNo} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <label>Gender:</label>
          <input type="text" name="sex" value={studentData.sex} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>DOB:</label>
          <input type="text" name="dob" value={studentData.dob} onChange={handleChange} required />
        </div>
        {/* Address and Nationality in one row */}
        <div className="flex-row">
          <div className="form-group">
            <label>Address (city):</label>
            <input type="text" name="city" value={studentData.city} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Nationality:</label>
            <input type="text" name="nationality" value={studentData.nationality} onChange={handleChange} required />
          </div>
        </div>
        {/* Email and Phone in one row */}
        <div className="flex-row">
          <div className="form-group">
            <label>Email Id:</label>
            <input type="email" name="email" value={studentData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mobile No.:</label>
            <input type="tel" name="phone" value={studentData.phone} onChange={handleChange} required />
          </div>
        </div>
        {/* Graduation Month and Year in one row */}
        <div className="flex-row">
          <div className="form-group">
            <label>Graduation Month:</label>
            <select name="gradMonth" value={studentData.gradMonth} onChange={handleChange} required>
              <option value="">Select Month</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Graduation Year:</label>
            <select name="gradYear" value={studentData.gradYear} onChange={handleChange} required>
              <option value="">Select Year</option>
              {gradYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        {/* Year of Study */}
        <div className="form-group">
          <label>Year of Study:</label>
          <select name="yearOfStudy" value={studentData.yearOfStudy} onChange={handleChange} required>
            <option value="">Select Year</option>
            <option value="1st">1st</option>
            <option value="2nd">2nd</option>
            <option value="3rd">3rd</option>
            <option value="4th">4th</option>
          </select>
        </div>
        {/* Class X */}
        <div className="flex-row">
          <div className="form-group">
            <label>Class X Board:</label>
            <input type="text" name="tenthBoard" value={studentData.tenthBoard} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Class X %:</label>
            <input type="number" name="tenthPercent" value={studentData.tenthPercent} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Class X Year of Passing:</label>
            <input type="number" name="tenthYear" value={studentData.tenthYear} onChange={handleChange} required />
          </div>
        </div>
        {/* Diploma/12th */}
        <div className="form-group">
          <label>Diploma:</label>
          <select value={hasDiploma} onChange={e => setHasDiploma(e.target.value)}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        {hasDiploma === 'No' && (
          <div className="flex-row">
            <div className="form-group">
              <label>Class XII Board:</label>
              <input type="text" name="twelfthBoard" value={studentData.twelfthBoard} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Class XII %:</label>
              <input type="number" name="twelfthPercent" value={studentData.twelfthPercent} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Class XII Year of Passing:</label>
              <input type="number" name="twelfthYear" value={studentData.twelfthYear} onChange={handleChange} />
            </div>
          </div>
        )}
        {hasDiploma === 'Yes' && (
          <div className="flex-row">
            <div className="form-group">
              <label>Diploma %:</label>
              <input type="number" name="diplomaPercent" value={studentData.diplomaPercent} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Diploma Pointer:</label>
              <input type="number" name="diplomaPointer" value={studentData.diplomaPointer} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Diploma Year of Passing:</label>
              <input type="number" name="diplomaYear" value={studentData.diplomaYear} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Diploma Degree:</label>
              <input type="text" name="diplomaDegree" value={studentData.diplomaDegree} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Diploma Stream:</label>
              <input type="text" name="diplomaStream" value={studentData.diplomaStream} onChange={handleChange} />
            </div>
          </div>
        )}
        {/* SGPA and Percentage for each sem */}
        {[...Array(6)].map((_, i) => (
          <div className="flex-row" key={i}>
            <div className="form-group">
              <label>{i + 1}st sem SGPA:</label>
              <input
                type="number"
                value={studentData.sgpa[i]}
                onChange={e => handleSgpaChange(i, e.target.value)}
                min="0"
                max="10"
              />
            </div>
            <div className="form-group">
              <label>Sem {i + 1} %:</label>
              <input
                type="number"
                value={studentData.semPercent[i]}
                onChange={e => handleSemPercentChange(i, e.target.value)}
                min="0"
                max="100"
              />
            </div>
          </div>
        ))}
        <div className="flex-row">
          <div className="form-group">
            <label>Average CGPA:</label>
            <input type="number" name="avgCgpa" value={studentData.avgCgpa} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Average %:</label>
            <input type="number" name="avgPercent" value={studentData.avgPercent} onChange={handleChange} />
          </div>
        </div>
        {/* Backlog */}
        <div className="form-group">
          <label>Active backlog yes/No:</label>
          <select name="activeBacklog" value={studentData.activeBacklog} onChange={handleChange}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        {studentData.activeBacklog === 'Yes' && (
          <div className="form-group">
            <label>How many?</label>
            <input
              type="number"
              name="backlogCount"
              value={studentData.backlogCount}
              onChange={handleChange}
              min="0"
            />
          </div>
        )}
        {studentData.activeBacklog === 'No' && (
          <div className="form-group">
            <label>How many cleared KTs?</label>
            <input
              type="number"
              name="clearedKT"
              value={studentData.clearedKT}
              onChange={handleChange}
              min="0"
            />
          </div>
        )}
        {/* Skills */}
        <div className="form-group">
          <label>Skill Set (Programming Languages):</label>
          <input type="text" name="skills" value={studentData.skills} onChange={handleChange} />
        </div>
        {/* Experience */}
        <button type="button" onClick={addExperience}>Add Experience</button>
        {studentData.experiences.map((exp, index) => (
          <div className="form-group" key={index}>
            <label>Company Name:</label>
            <input
              type="text"
              value={exp.company || ''}
              onChange={e => handleExperienceChange(index, 'company', e.target.value)}
              placeholder="Company Name"
            />
            <label>Work Experience (months):</label>
            <input
              type="number"
              value={exp.months || ''}
              onChange={e => handleExperienceChange(index, 'months', e.target.value)}
              placeholder="Months"
              min="0"
            />
            <label>Description:</label>
            <input
              type="text"
              value={exp.description || ''}
              onChange={e => handleExperienceChange(index, 'description', e.target.value)}
              placeholder="Description"
            />
          </div>
        ))}
        {/* Projects */}
        <button type="button" onClick={addProject}>Add Project</button>
        {studentData.projects.map((project, index) => (
          <div className="form-group" key={index}>
            <label>Project {index + 1}:</label>
            <input
              type="text"
              placeholder="Project Title"
              value={project.title}
              onChange={e => handleProjectChange(index, 'title', e.target.value)}
            />
            <textarea
              placeholder="Project Description"
              value={project.description}
              onChange={e => handleProjectChange(index, 'description', e.target.value)}
            />
          </div>
        ))}
        {/* Resume Link */}
        <div className="form-group">
          <label>Resume Drive Link:</label>
          <input type="text" name="resumeLink" value={studentData.resumeLink} onChange={handleChange} />
        </div>
        {/* Certifications */}
        <div className="form-group">
          <label>Certifications:</label>
          <input type="text" name="certifications" value={studentData.certifications} onChange={handleChange} />
        </div>
        {/* Github/Linkedin */}
        <div className="flex-row">
          <div className="form-group">
            <label>GitHub Link:</label>
            <input type="text" name="githubLink" value={studentData.githubLink} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>LinkedIn Link:</label>
            <input type="text" name="linkedinLink" value={studentData.linkedinLink} onChange={handleChange} />
          </div>
        </div>
        <div className="form-submit">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default StudentProfile;
