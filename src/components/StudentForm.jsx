import React, { useState } from 'react';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() + i);

function StudentForm() {
  const [experience, setExperience] = useState([{ company: '', months: '', description: '' }]);
  const [backlog, setBacklog] = useState('No');

  const handleExperienceChange = (idx, field, value) => {
    const updated = [...experience];
    updated[idx][field] = value;
    setExperience(updated);
  };

  const addExperience = () => {
    setExperience([...experience, { company: '', months: '', description: '' }]);
  };

  return (
    <form>
      <input name="fullName" placeholder="Full Name" />
      <input name="prn" placeholder="PRN No." />
      <input name="rollNo" placeholder="Roll No." />
      <select name="gender">
        <option value="FEMALE">FEMALE</option>
      </select>
      <input name="dob" type="date" placeholder="DOB" />
      <input name="nationality" placeholder="Nationality" />
      <input name="email" type="email" placeholder="Email Id" />
      <input name="mobile" placeholder="Mobile No." />
      <input name="address" placeholder="Address (city)" />
      <input name="branch" placeholder="Branch" />
      <div>
        Graduation Year:
        <select name="gradMonth">
          {months.map(m => <option key={m}>{m}</option>)}
        </select>
        <select name="gradYear">
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
      </div>
      <div>
        Year of Study:
        <select name="yearOfStudy">
          <option>1st</option>
          <option>2nd</option>
          <option>3rd</option>
          <option>4th</option>
        </select>
      </div>
      <input name="tenthPercent" placeholder="10th %" />
      <input name="twelfthPercent" placeholder="12th %" />
      <input name="diplomaPercent" placeholder="Diploma %" />
      <input name="diplomaPointer" placeholder="Diploma Pointer" />
      <input name="sgpa1" placeholder="1st Sem SGPA" />
      <input name="sgpa2" placeholder="2nd Sem SGPA" />
      <input name="sgpa3" placeholder="3rd Sem SGPA" />
      <input name="sgpa4" placeholder="4th Sem SGPA" />
      <input name="sgpa5" placeholder="5th Sem SGPA" />
      <input name="sgpa6" placeholder="6th Sem SGPA" />
      <input name="avgCgpa" placeholder="Average CGPA" />
      <input name="sem1Percent" placeholder="Sem 1 %" />
      <input name="sem2Percent" placeholder="Sem 2 %" />
      <input name="sem3Percent" placeholder="Sem 3 %" />
      <input name="sem4Percent" placeholder="Sem 4 %" />
      <input name="sem5Percent" placeholder="Sem 5 %" />
      <input name="sem6Percent" placeholder="Sem 6 %" />
      <input name="avgPercent" placeholder="Average %" />
      <div>
        Active Backlog:
        <select name="backlog" value={backlog} onChange={e => setBacklog(e.target.value)}>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        {backlog === "Yes" ? (
          <input name="backlogCount" placeholder="How many?" />
        ) : (
          <input name="clearedKT" placeholder="How many cleared KT?" />
        )}
      </div>
      <input name="skills" placeholder="Skill Set (Programming Languages)" />
      <div>
        Experience:
        {experience.map((exp, idx) => (
          <div key={idx}>
            <input placeholder="Company Name" value={exp.company} onChange={e => handleExperienceChange(idx, 'company', e.target.value)} />
            <input placeholder="Work Experience (months)" value={exp.months} onChange={e => handleExperienceChange(idx, 'months', e.target.value)} />
            <input placeholder="Description" value={exp.description} onChange={e => handleExperienceChange(idx, 'description', e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={addExperience}>Add Experience</button>
      </div>
      <input name="projects" placeholder="Projects" />
      <input name="resumeLink" placeholder="Resume Drive Link" />
      <input name="certifications" placeholder="Certifications" />
      <input name="github" placeholder="GitHub Link" />
      <input name="linkedin" placeholder="LinkedIn" />
      <div>
        Class X:
        <input name="classXBoard" placeholder="Board" />
        <input name="classXPercent" placeholder="%" />
        <input name="classXYear" placeholder="Year of Passing" />
      </div>
    </form>
  );
}

export default StudentForm;