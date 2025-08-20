import React, { useState, useEffect, useCallback } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import { saveAs } from "file-saver"; // for Excel download
import * as XLSX from "xlsx";
import "../styles/ManageStudent.css";

const StudentDetails = () => {
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [years, setYears] = useState([]);
  const [yearFilter, setYearFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [searchName, setSearchName] = useState(""); // Search by name
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for Excel download
  const [selectedFields, setSelectedFields] = useState({
    name: true,
    branch: true,
    year: true,
    cgpa: true,
    email: true,
    linkedinLink: false,
    githubLink: false,
    address: false,
    dob: false,
    photograph: false,
  }); // Store selected fields for Excel export

  const fetchStudentData = useCallback(async () => {
    const studentRef = firebase.database().ref("Students");
    studentRef.once("value", (snapshot) => {
      if (snapshot.exists()) {
        const studentData = snapshot.val();
        const studentsList = [];
        const yearSet = new Set();
        const branchSet = new Set();

        Object.keys(studentData).forEach((year) => {
          yearSet.add(year);
          Object.keys(studentData[year]).forEach((branch) => {
            branchSet.add(branch);
            Object.keys(studentData[year][branch]).forEach((studentId) => {
              const studentInfo = studentData[year][branch][studentId];
              studentsList.push({
                year,
                branch,
                ...studentInfo,
              });
            });
          });
        });
        setStudents(studentsList);
        setYears([...yearSet]);
        setBranches([...branchSet]);
      }
    });
  }, []);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const filteredStudents = students
    .filter((student) => (yearFilter ? student.year === yearFilter : true))
    .filter((student) => (branchFilter ? student.branch === branchFilter : true))
    .filter((student) =>
      student.name.toLowerCase().includes(searchName.toLowerCase())
    ); // Search by name filter

  const handleFieldSelection = (e) => {
    const { name, checked } = e.target;
    setSelectedFields((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const exportToExcel = () => {
    const filteredData = filteredStudents.map((student) => {
      const result = {};
      Object.keys(selectedFields).forEach((field) => {
        if (selectedFields[field]) {
          result[field] = student[field] || "N/A";
        }
      });
      return result;
    });

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    const excelFile = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelFile]), "students.xlsx");
    setIsModalOpen(false); // Close modal after download
  };

  return (
    <div className="Manage-Student-Container">
      <h3>Manage Students</h3>
      <div className="filter-container">
      <input
          type="text"
          placeholder="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <label>
          Year:
          <select onChange={(e) => setYearFilter(e.target.value)}>
            <option value="">All Years</option>
            {years.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label>
          Branch:
          <select onChange={(e) => setBranchFilter(e.target.value)}>
            <option value="">All Branches</option>
            {branches.map((branch, index) => (
              <option key={index} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Branch</th>
            <th>Year</th>
            <th>CGPA</th>
            <th>Email</th>
            <th>LinkedIn</th>
            <th>GitHub</th>
            <th>Address</th>
            <th>DOB</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, index) => (
            <tr key={index}>
              <td>{student.name}</td>
              <td>{student.branch}</td>
              <td>{student.year}</td>
              <td>{student.cgpa || "N/A"}</td>
              <td>{student.email || "N/A"}</td>
              <td>
                {student.linkedinLink ? (
                  <a
                    href={student.linkedinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
              <td>
                {student.githubLink ? (
                  <a
                    href={student.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
              <td>{student.address || "N/A"}</td>
              <td>{student.dob || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => setIsModalOpen(true)}>Download Excel</button>

      {/* Modal for field selection */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h4>Select Fields for Excel Download</h4>
            <form>
              {Object.keys(selectedFields).map((field) => (
                <label key={field}>
                  <input
                    type="checkbox"
                    name={field}
                    checked={selectedFields[field]}
                    onChange={handleFieldSelection}
                  />
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
              ))}
              <div className="modal-buttons">
                <button type="button" onClick={exportToExcel}>
                  Download
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <br/><br/><br/>
    </div>
  );
};

export default StudentDetails;
