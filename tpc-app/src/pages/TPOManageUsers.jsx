import React, { useState, useEffect } from 'react';
import "firebase/compat/auth";
import 'firebase/compat/storage';
import firebase from 'firebase/compat/app';
import { saveAs } from 'file-saver'; // for Excel download
import * as XLSX from 'xlsx';
import '../styles/ManageUsers.css';

const sendEmail = async (to, subject, body) => {
  try {
    const response = await fetch(" https://tpc-app-1044941932147.asia-south1.run.app/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: to, subject, body }), // Ensure correct payload keys
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("❌ sendEmail backend error", data);
      throw new Error(data.error || JSON.stringify(data) || "Failed to send email");
    }
    return true;
  } catch (error) {
    console.error("❌ Error in sendEmail:", error);
    return false;
  }
};

// New helper: determine status color from status text
const getStatusColor = (msg) => {
  if (!msg) return '#555';
  const s = String(msg).toLowerCase();
  if (s.includes('success') || s.includes('done') || s.includes('created')) return 'green';
  if (s.includes('fail') || s.includes('failed') || s.includes('error')) return 'red';
  return '#555';
};

const ExcelUserUploader = ({ sendEmail }) => {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");

  // Read Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Accept common header variants; normalize keys (trim + lowercase)
        const getCell = (row, names) => {
          const wanted = names.map(n => n.toLowerCase());
          for (const key of Object.keys(row)) {
            const k = String(key).trim().toLowerCase();
            if (wanted.includes(k)) return String(row[key]).trim();
          }
          return undefined;
        };

        const formatted = worksheet.map((row, idx) => {
          const email = getCell(row, ["Email Id", "Email", "email", "EmailId"]);
          const name = getCell(row, ["Full name", "Full Name", "Name", "name"]);
          const rollNoRaw = getCell(row, ["Roll No.", "Roll No", "RollNo", "rollNo"]);
          const role = getCell(row, ["Role", "role"]);
          // New: branch and gradYear (allow many header variants)
          const branch = getCell(row, ["Branch", "branch", "Dept", "Department"]);
          const gradYear = getCell(row, ["Grad Year", "GradYear", "Graduation Year", "graduation year", "grad_year", "gradyear"]);

          const rollNo = rollNoRaw ? String(rollNoRaw).trim() : undefined;

          const missing = [];
          if (!email) missing.push('Email');
          if (!name) missing.push('Name');
          if (!rollNo) missing.push('RollNo');
          if (!role) missing.push('Role');

          if (missing.length) {
            console.warn(`⚠️ Skipping invalid row #${idx + 1}: missing ${missing.join(', ')}`, row);
            return null;
          }

          // include branch/gradYear (may be undefined)
          return { email, name, rollNo, role, branch, gradYear };
        }).filter(Boolean);

        if (!formatted.length) setStatus('No valid rows found in the uploaded file.');
        else setStatus(`${formatted.length} valid user(s) parsed from file.`);

        setUsers(formatted);
      } catch (err) {
        console.error('Error parsing Excel file:', err);
        setStatus('Failed to parse the Excel file. Check file format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Generate password: firstname@rollNo
  const generatePassword = (name, rollNo) => {
    const firstName = name.split(" ")[0].toLowerCase();
    return `${firstName}@${rollNo}`;
  };

  // Create users + send email
  const handleCreateUsers = async () => {
    const results = [];
    console.log("📤 Starting user creation...");

    for (const user of users) {
      if (!user.email || !user.name || !user.rollNo || !user.role) {
        console.warn("⚠️ Skipping invalid row:", user);
        continue;
      }

      const password = generatePassword(user.name, user.rollNo);

      try {
        const response = await fetch(" https://tpc-app-1044941932147.asia-south1.run.app/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            password,
            name: user.name,
            rollNo: user.rollNo,
            role: user.role,
            branch: user.branch || null,      // include branch if provided
            gradYear: user.gradYear || null,  // include gradYear if provided
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log(`✅ User created: ${user.email}`);
          // still send email via /send-email (existing flow) if desired
          const emailSent = await sendEmail(
            user.email,
            "Your IIIC Account Credentials",
            `Hello ${user.name},\n\nYour account has been created.\nEmail: ${user.email}\nPassword: ${password}\n\nRegards,\nIIIC Team`
          );

          if (emailSent) {
            results.push({ email: user.email, status: "Created + Email Sent", uid: data.uid || null });
          } else {
            results.push({ email: user.email, status: "Created but Email Failed", uid: data.uid || null });
          }
        } else {
          console.error(`❌ Failed for ${user.email}:`, data.error);
          results.push({ email: user.email, status: "Failed" });
        }
      } catch (error) {
        console.error("🔥 Error creating user:", error);
        results.push({ email: user.email, status: "Error" });
      }
    }

    setStatus("Process complete! Check console for details.");
    console.table(results);
  };

  return (
    <div>
      <h2>Create Multiple User</h2>
      <p>
        Upload an Excel file with columns: Email Id, Full name, Roll No., Role, Branch, Grad Year. Ensure all fields are filled correctly. 
        <a href="https://docs.google.com/spreadsheets/d/1vhIwD_C_KxNI_kyjWrj1nHsBDSyC5sMaGK5Gluct13U/edit?usp=sharing" target="_blank" rel="noopener noreferrer" style={{ color: 'red', textDecoration: 'underline' }}>
          Link
        </a>
      </p>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <button className="submit-button" onClick={handleCreateUsers} disabled={!users.length}>
          Create Users
        </button>
      </div>
      <p style={{ color: getStatusColor(status) }}>{status}</p> {/* colored status */}
    </div>
  );
};

const ManageStudent = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [role, setRole] = useState(''); // State for selected role
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // New states for files
  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  // Fetch users from the database on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = firebase.database().ref('users');
      const snapshot = await usersRef.get();
      if (snapshot.exists()) {
        const usersData = snapshot.val();

        const usersList = Object.keys(usersData).flatMap(roleKey => {
          const roleUsers = usersData[roleKey];
          return Object.keys(roleUsers).map(userId => ({
            ...roleUsers[userId],
            userId,
            role: roleKey, // Add role dynamically
          }));
        });

        setUsers(usersList);
        setFilteredUsers(usersList);
      }
    };

    fetchUsers();
  }, []);

  // Filter users as searchName changes (live search)
  useEffect(() => {
    let filtered = users;

    if (searchName) {
      filtered = filtered.filter(user =>
        user.name && user.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchRole) {
      filtered = filtered.filter(user =>
        user.role && user.role.toLowerCase().includes(searchRole.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchName, searchRole, users]);

  // Helper: upload a file to Firebase Storage and return download URL
  const uploadFileToStorage = async (file, destPath) => {
    if (!file) return null;
    try {
      const storageRef = firebase.storage().ref().child(destPath);
      const snap = await storageRef.put(file);
      const url = await snap.ref.getDownloadURL();
      return url;
    } catch (err) {
      console.error('Upload to storage failed:', err);
      return null;
    }
  };

  // Handle creating a user without logging them in
  const handleCreateUser = async () => {
    if (!name || !email || !password || !role) { // Ensure role is selected
      alert('Please fill in all fields');
      return;
    }

    setStatus('Preparing to create user...');

    try {
      // Upload files first (if any) and capture URLs
      const timestamp = Date.now();
      let photoUrl = null;
      let resumeUrl = null;

      if (photoFile) {
        const photoPath = `uploads/${role}/photos/${timestamp}_${photoFile.name}`;
        setStatus('Uploading photo...');
        photoUrl = await uploadFileToStorage(photoFile, photoPath);
        if (!photoUrl) console.warn('Photo upload failed, continuing without photo URL');
      }

      if (resumeFile) {
        const resumePath = `uploads/${role}/resumes/${timestamp}_${resumeFile.name}`;
        setStatus('Uploading resume...');
        resumeUrl = await uploadFileToStorage(resumeFile, resumePath);
        if (!resumeUrl) console.warn('Resume upload failed, continuing without resume URL');
      }

      setStatus('Creating user in backend...');

      // Send request to Flask backend to create user and (optionally) send email
      const response = await fetch("http://localhost:5000/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          rollNo: "N/A", // Add rollNo if applicable
          role, // Include role in the payload
          photoUrl, // include links to uploaded files so backend (if needed) can store them too
          resumeUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Use returned uid if present; otherwise sanitize email to use as key
        const key = data.uid || email.replace(/\./g, ',');
        // Save user metadata in Realtime Database
        try {
          await firebase.database().ref(`users/${role}/${key}`).set({
            name,
            email,
            role,
            photo: photoUrl || null,
            resume: resumeUrl || null,
            createdOn: firebase.database.ServerValue.TIMESTAMP,
          });
        } catch (dbErr) {
          console.error('Failed to write to realtime DB:', dbErr);
        }

        alert(`User created successfully: ${email}`);
      } else {
        alert(`Failed to create user: ${data.error}`);
      }

      // Reset form fields
      setName('');
      setEmail('');
      setPassword('');
      setRole(''); // Reset role
      setPhotoFile(null);
      setResumeFile(null);
      setStatus('Done');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('An error occurred while creating the user.');
      setStatus('Error during creation');
    }
  };

  // Handle exporting to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredUsers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StudentEmailPassword');
    const excelFile = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelFile]), 'users.xlsx');
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="manage-student-container">
      <h2 className="header">Manage Users</h2>
      <div className="form-container">
        <input
          className="input-field"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="input-field"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="Student">Student</option>
          <option value="Recruiter">Recruiter</option>
          <option value="Coordinator">Coordinator</option>
        </select>

        <button className="submit-button" onClick={handleCreateUser}>Create User</button>
        <button className="export-button" onClick={exportToExcel}>Download Excel</button>
      </div>

      <div style={{ marginTop: 8, color: getStatusColor(status) }}>{status}</div> {/* colored status */}

      <div className="searchbar-container d-flex align-items-center" style={{ width: '100%', gap: '10px' }}>
        <input
          className="search-field"
          type="text"
          placeholder="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <select
          className="search-field"
          value={searchRole}
          onChange={(e) => setSearchRole(e.target.value)}
        >
          <option value="">All</option>
          <option value="Student">Student</option>
          <option value="Recruiter">Recruiter</option>
          <option value="Coordinator">Coordinator</option>
        </select>
        <span className="user-count" style={{ width: "200px" }}>
          Users: {filteredUsers.length}
        </span>
        <div className="pagination-container" style={{ width: "400px" }}>
          <button
            className="submit-button"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ◀
          </button>
          <span> {currentPage} of {totalPages}</span>
          <button
            className="submit-button"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            ▶
          </button>
        </div>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created On</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length > 0 ? (
            currentUsers.map((user, index) => (
              <tr key={index}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role || 'N/A'}</td>
                <td>{user.createdOn || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Integrate ExcelUserUploader */}
      <ExcelUserUploader sendEmail={sendEmail} />
    </div >
  );
};

export default ManageStudent;

