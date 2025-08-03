import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import '../styles/StudentProfile.css';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

const getAcademicYear = (graduationYear) => {
  const currentMonth = new Date().getMonth() + 1; // Month is zero-indexed
  const currentYear = new Date().getFullYear();

  if (graduationYear === currentYear + 1) return currentMonth >= 7 ? '4th' : '3rd';
  if (graduationYear === currentYear + 2) return currentMonth >= 7 ? '3rd' : '2nd';
  if (graduationYear === currentYear + 3) return currentMonth >= 7 ? '2nd' : '1st';
  if (graduationYear === currentYear + 4) return '1st';

  return '';
};

function StudentProfile({ loggedInUser }) {
  const [studentData, setStudentData] = useState({
    name: '',
    branch: '',
    prn: '',
    rollNo: '',
    sex: 'Female',
    dob: '',
    nationality: '',
    email: '',
    phone: '',
    address: '',
    graduationMonth: '',
    graduationYear: '',
    year: '',
    skills: '',
    languages: '',
    certifications: '',
    technicalSkills: '',
    cgpa: '',
    sgpa: Array(6).fill(''),
    percentage: Array(6).fill(''),
    avgCgpa: '',
    avgPercent: '',
    experiences: [],
    projects: [],
    certificates: [],
    resume: null,
    githubLink: '',
    linkedinLink: '',
    backlog: 'No',
    backlogCount: '',
    clearedKT: '',
    classXBoard: '',
    classXPercent: '',
    classXYear: '',
    hasDiploma: 'No',
    classXIIBoard: '',
    classXIIPercent: '',
    classXIIYear: '',
    diplomaPercent: '',
    diplomaYear: '',
    diplomaDegree: '',
    description: '',
  });
  const [certInput, setCertInput] = useState('');
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    const year = getAcademicYear(studentData.graduationYear);
    setStudentData((prevData) => ({ ...prevData, year }));
  }, [studentData.graduationYear]);

  const handleChange = (event) => {
    const { name, value, files } = event.target; // removed 'type'
    if (name === 'certificates') {
      const newFiles = Array.from(files);
      setStudentData((prevData) => ({
        ...prevData,
        certificates: [...prevData.certificates, ...newFiles],
      }));
    } else if (name.startsWith('sgpa')) {
      const idx = parseInt(name.replace('sgpa', '')) - 1;
      const updatedSgpa = [...studentData.sgpa];
      updatedSgpa[idx] = value;
      setStudentData((prevData) => ({ ...prevData, sgpa: updatedSgpa }));
    } else if (name.startsWith('percentage')) {
      const idx = parseInt(name.replace('percentage', '')) - 1;
      const updatedPercent = [...studentData.percentage];
      updatedPercent[idx] = value;
      setStudentData((prevData) => ({ ...prevData, percentage: updatedPercent }));
    } else {
      setStudentData((prevData) => ({
        ...prevData,
        [name]: files ? files[0] : value,
      }));
    }
  };

  const handleExperienceChange = (idx, field, value) => {
    const updated = [...studentData.experiences];
    updated[idx][field] = value;
    setStudentData((prevData) => ({
      ...prevData,
      experiences: updated,
    }));
  };

  const addExperience = () => {
    setStudentData((prevData) => ({
      ...prevData,
      experiences: [...prevData.experiences, { company: '', months: '', description: '' }],
    }));
  };

  const addProject = () => {
    setStudentData((prevData) => ({
      ...prevData,
      projects: [...prevData.projects, { title: '', description: '' }],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dbPath = `Students/${studentData.graduationYear}/${studentData.branch}/${loggedInUser}`;

    try {
      // Assuming firebase is already imported and initialized
      await firebase.database().ref(dbPath).set(studentData);
      console.log('Student Data:', studentData);
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Error saving data to Firebase:', error);
      alert('Error submitting form.');
    }
  };

  // Add certification on Enter
  const handleCertInputKeyDown = (e) => {
    if (e.key === 'Enter' && certInput.trim()) {
      e.preventDefault();
      setStudentData(prev => ({
        ...prev,
        certifications: prev.certifications
          ? Array.isArray(prev.certifications)
            ? [...prev.certifications, certInput.trim()]
            : [prev.certifications, certInput.trim()]
          : [certInput.trim()]
      }));
      setCertInput('');
    }
  };

  // Add technical skill on Enter
  const handleTechInputKeyDown = (e) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      setStudentData(prev => ({
        ...prev,
        technicalSkills: prev.technicalSkills
          ? Array.isArray(prev.technicalSkills)
            ? [...prev.technicalSkills, techInput.trim()]
            : [prev.technicalSkills, techInput.trim()]
          : [techInput.trim()]
      }));
      setTechInput('');
    }
  };

  // Remove chip helper
  const removeChip = (type, idx) => {
    setStudentData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="student-page">
      <h2>Student Profile</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group">
          <label>Name:</label>
          <input type="text" name="name" value={studentData.name} onChange={handleChange} required />
        </div>

        {/* PRN and Roll No. in same row */}
        <div className="form-row">
          <div className="form-group">
            <label>PRN No.:</label>
            <input type="text" name="prn" value={studentData.prn} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Roll No.:</label>
            <input type="text" name="rollNo" value={studentData.rollNo} onChange={handleChange} required />
          </div>
        </div>

        {/* Gender, DOB */}
        <div className="form-row">
          <div className="form-group">
            <label>Gender:</label>
            <select name="sex" value={studentData.sex} onChange={handleChange}>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>DOB:</label>
            <input type="date" name="dob" value={studentData.dob} onChange={handleChange} required />
          </div>
        </div>

        {/* Address and Nationality in same row */}
        <div className="form-row">
          <div className="form-group">
            <label>Address (city):</label>
            <input type="text" name="address" value={studentData.address} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Nationality:</label>
            <input type="text" name="nationality" value={studentData.nationality} onChange={handleChange} required />
          </div>
        </div>

        {/* Email and Phone in same row */}
        <div className="form-row">
          <div className="form-group">
            <label>Email Id:</label>
            <input type="email" name="email" value={studentData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mobile No.:</label>
            <input type="tel" name="phone" value={studentData.phone} onChange={handleChange} required />
          </div>
        </div>

        {/* Branch */}
        <div className="form-group">
          <label>Branch:</label>
          <select name="branch" value={studentData.branch} onChange={handleChange} required>
            <option value="">Select Branch</option>
            <option value="CST">CST (Computer Science Technology)</option>
            <option value="ENC">ENC (Electronics and Communication)</option>
            <option value="DS">DS (Data Science)</option>
            <option value="AI">AI (Artificial Intelligence)</option>
            <option value="CE">CE (Civil Engineering)</option>
            <option value="IT">IT (Information Technology)</option>
          </select>
        </div>

        {/* Graduation Month and Year in same row */}
        <div className="form-row">
          <div className="form-group">
            <label>Graduation Month:</label>
            <select name="graduationMonth" value={studentData.graduationMonth} onChange={handleChange} required>
              <option value="">Select Month</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Graduation Year:</label>
            <select name="graduationYear" value={studentData.graduationYear} onChange={handleChange} required>
              <option value="">Select Year</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Year of Study */}
        <div className="form-group">
          <label>Year of Study:</label>
          <select name="year" value={studentData.year} onChange={handleChange} required>
            <option value="">Select Year</option>
            <option value="1st">1st</option>
            <option value="2nd">2nd</option>
            <option value="3rd">3rd</option>
            <option value="4th">4th</option>
          </select>
        </div>

        {/* Class X */}
        <div className="form-row">
          <div className="form-group">
            <label>Class X Board:</label>
            <input type="text" name="classXBoard" value={studentData.classXBoard} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Class X %:</label>
            <input type="number" name="classXPercent" value={studentData.classXPercent} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Class X Year of Passing:</label>
            <input type="number" name="classXYear" value={studentData.classXYear} onChange={handleChange} />
          </div>
        </div>

        {/* Diploma or Class XII */}
        <div className="form-group">
          <label>Have you completed Diploma?</label>
          <select name="hasDiploma" value={studentData.hasDiploma} onChange={handleChange}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        {studentData.hasDiploma === 'Yes' ? (
          <div className="form-row">
            <div className="form-group">
              <label>Diploma %:</label>
              <input type="number" name="diplomaPercent" value={studentData.diplomaPercent} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Diploma Year of Passing:</label>
              <input type="number" name="diplomaYear" value={studentData.diplomaYear} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Diploma Degree:</label>
              <input type="text" name="diplomaDegree" value={studentData.diplomaDegree} onChange={handleChange} />
            </div>
          </div>
        ) : (
          <div className="form-row">
            <div className="form-group">
              <label>Class XII Board:</label>
              <input type="text" name="classXIIBoard" value={studentData.classXIIBoard} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Class XII %:</label>
              <input type="number" name="classXIIPercent" value={studentData.classXIIPercent} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Class XII Year of Passing:</label>
              <input type="number" name="classXIIYear" value={studentData.classXIIYear} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* SGPA and Percentage for each sem: each in its own row like average CGPA/% */}
        {[...Array(6)].map((_, idx) => (
          <div className="form-row" key={idx}>
            <div className="form-group">
              <label>{idx + 1} Sem SGPA:</label>
              <input
                type="number"
                name={`sgpa${idx + 1}`}
                value={studentData.sgpa[idx]}
                onChange={handleChange}
                min="0"
                max="10"
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group">
              <label>{idx + 1} Sem %:</label>
              <input
                type="number"
                name={`percentage${idx + 1}`}
                value={studentData.percentage[idx]}
                onChange={handleChange}
                min="0"
                max="100"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        ))}
        {/* Average CGPA and % in same row */}
        <div className="form-row">
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
          {/* Use htmlFor and unique ids for labels and checkboxes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>


            {/* <input
              id="hasBacklog"
              type="checkbox"
              checked={studentData.backlog === "Yes" || !!studentData.clearedKT}
              onChange={e => {
                if (e.target.checked) {
                  setStudentData(prev => ({
                    ...prev,
                    backlog: prev.backlog === "Yes" ? "Yes" : "No"
                  }));
                } else {
                  setStudentData(prev => ({
                    ...prev,
                    backlog: "No",
                    backlogCount: '',
                    clearedKT: ''
                  }));
                }
              }}
            /> */}

            <input
  id="hasBacklog"
  type="checkbox"
  checked={studentData.backlog === "Yes" || !!studentData.clearedKT}
  onChange={e => {
    if (e.target.checked) {
      setStudentData(prev => ({
        ...prev,
        backlog: "Yes",
      }));
    } else {
      setStudentData(prev => ({
        ...prev,
        backlog: "No",
        backlogCount: '',
        clearedKT: ''
      }));
    }
  }}
/>



            <label htmlFor="hasBacklog" style={{ margin: 0, fontWeight: 'bold', cursor: 'pointer', fontSize: '16px'}}>
              Have you ever had a backlog?
            </label>
          </div>
          {(studentData.backlog === "Yes" || !!studentData.clearedKT) && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="activeBacklog"
                type="checkbox"
                checked={studentData.backlog === "Yes"}
                onChange={e => {
                  setStudentData(prev => ({
                    ...prev,
                    backlog: e.target.checked ? "Yes" : "No",
                    backlogCount: e.target.checked ? prev.backlogCount : '',
                  }));
                }}
              />
              <label htmlFor="activeBacklog" style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>
                Active Backlog
              </label>
              {studentData.backlog === "Yes" ? (
                <input
                  type="number"
                  name="backlogCount"
                  value={studentData.backlogCount}
                  onChange={handleChange}
                  placeholder="How many active?"
                  style={{ marginLeft: '12px' }}
                />
              ) : (
                <input
                  type="number"
                  name="clearedKT"
                  value={studentData.clearedKT}
                  onChange={handleChange}
                  placeholder="How many cleared?"
                  style={{ marginLeft: '12px' }}
                />
              )}
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="form-group">
          <div className="form-row" style={{ flexDirection: 'row', gap: '1rem', justifyContent: 'space-between' }}>
            <label>Experience:</label>
            <button
              type="button"
              onClick={addExperience}
              className="form-submit"
              style={{ width: '120px'}}
            >
              + Add
            </button>
          </div>
          {studentData.experiences.map((exp, idx) => (
            <div key={idx} className="form-row" style={{ flexDirection: 'row', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Company Name"
                value={exp.company}
                onChange={e => handleExperienceChange(idx, 'company', e.target.value)}
              />
              <input
                type="number"
                placeholder="Work Experience (months)"
                value={exp.months}
                onChange={e => handleExperienceChange(idx, 'months', e.target.value)}
              />
              <textarea
                placeholder="Description"
                value={exp.description}
                onChange={e => handleExperienceChange(idx, 'description', e.target.value)}
                style={{ minWidth: '180px', flex: 1 }}
              />
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="form-group">
          <div className='form-row' style={{ flexDirection: 'row', gap: '1rem', justifyContent: 'space-between' }}>
          <label>Projects:</label>
          <button
            type="button"
            onClick={addProject}
            className="form-submit"
            style={{ width: '120px' }}
          >
            + Add
          </button>
          </div>
          {studentData.projects.map((project, index) => (
            <div className="form-row" key={index} style={{ flexDirection: 'row', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Project Title"
                value={project.title}
                onChange={(e) => {
                  const updatedProjects = [...studentData.projects];
                  updatedProjects[index].title = e.target.value;
                  setStudentData({ ...studentData, projects: updatedProjects });
                }}
              />
              <textarea
                placeholder="Project Description"
                value={project.description}
                onChange={(e) => {
                  const updatedProjects = [...studentData.projects];
                  updatedProjects[index].description = e.target.value;
                  setStudentData({ ...studentData, projects: updatedProjects });
                }}
                style={{ minWidth: '180px', flex: 1 }}
              />
            </div>
          ))}
        </div>

        {/* Resume */}
        <div className="form-group">
          <label>Resume Drive Link:</label>
          <input type="text" name="resume" value={studentData.resume || ''} onChange={handleChange} placeholder="Resume Drive Link" />
        </div>

        {/* Certifications with chips */}
        <div className="form-group">
          <label>Certifications:</label>
          <input
            type="text"
            name="certifications"
            value={certInput}
            onChange={e => setCertInput(e.target.value)}
            onKeyDown={handleCertInputKeyDown}
            placeholder="Type and press Enter"
            autoComplete="off"
          />
          {Array.isArray(studentData.certifications) && studentData.certifications.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {studentData.certifications.map((cert, idx) => (
                <span
                  key={idx}
                  className="chip"
                  style={{
                    background: '#333',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '2px 10px',
                    fontSize: '0.95em',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {cert}
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      marginLeft: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1em',
                      lineHeight: 1,
                      padding: 0,
                    }}
                    onClick={() => removeChip('certifications', idx)}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Technical Skills with chips */}
        <div className="form-group">
          <label>Technical Skills:</label>
          <input
            type="text"
            name="technicalSkills"
            value={techInput}
            onChange={e => setTechInput(e.target.value)}
            onKeyDown={handleTechInputKeyDown}
            placeholder="Type and press Enter"
            autoComplete="off"
          />
          {Array.isArray(studentData.technicalSkills) && studentData.technicalSkills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {studentData.technicalSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="chip"
                  style={{
                    background: '#333',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '2px 10px',
                    fontSize: '0.95em',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {skill}
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      marginLeft: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1em',
                      lineHeight: 1,
                      padding: 0,
                    }}
                    onClick={() => removeChip('technicalSkills', idx)}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* LinkedIn and GitHub in same row */}
        <div className="form-row">
          <div className="form-group">
            <label>GitHub Link:</label>
            <input type="text" name="githubLink" value={studentData.githubLink} onChange={handleChange} placeholder="GitHub Link" />
          </div>
          <div className="form-group">
            <label>LinkedIn Link:</label>
            <input type="text" name="linkedinLink" value={studentData.linkedinLink} onChange={handleChange} placeholder="LinkedIn Link" />
          </div>
        </div>

        {/* Upload Certificates (Optional) */}
        {/* <div className="form-group">
          <label>Upload Certificates (Optional):</label>
          <input type="file" name="certificates" onChange={handleChange} accept=".pdf,.jpg,.png,.doc,.docx" multiple />
          {studentData.certificates.length > 0 && (
            <ul>
              {studentData.certificates.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
        </div> */}

        <div className="form-submit">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default StudentProfile;
