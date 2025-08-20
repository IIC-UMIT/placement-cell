import React, { useState, useEffect } from 'react';
import "firebase/compat/auth";
import firebase from 'firebase/compat/app';
import { saveAs } from 'file-saver'; // for Excel download
import * as XLSX from 'xlsx';
import '../styles/ManageStudent.css';

const sendEmail = async (to, subject, body) => {
  try {
    const response = await fetch("http://localhost:5000/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: to, subject, body }), // Ensure correct payload keys
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to send email");
    }
    return true;
  } catch (error) {
    console.error("❌ Error in sendEmail:", error.message);
    return false;
  }
};

const ExcelUserUploader = ({ sendEmail }) => {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");

  // Read Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Validate and format rows
      const formatted = worksheet.map((row) => {
        const email = row["Email Id"]?.trim();
        const name = row["Full name"]?.trim();
        const rollNo = row["Roll No."]?.toString().trim();

        if (!email || !name || !rollNo) {
          console.warn("⚠️ Skipping invalid row:", row);
          return null; // Skip invalid rows
        }

        return { email, name, rollNo };
      }).filter(Boolean); // Remove null entries

      setUsers(formatted);
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
      if (!user.email || !user.name || !user.rollNo) {
        console.warn("⚠️ Skipping invalid row:", user);
        continue;
      }

      const password = generatePassword(user.name, user.rollNo);

      try {
        const response = await fetch("http://localhost:5000/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            password,
            name: user.name,
            rollNo: user.rollNo,
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log(`✅ User created: ${user.email}`);
          // Send email with credentials
          const emailSent = await sendEmail(
            user.email,
            "Your IIIC Account Credentials",
            `Hello ${user.name},\n\nYour account has been created.\nEmail: ${user.email}\nPassword: ${password}\n\nRegards,\nIIIC Team`
          );

          if (emailSent) {
            results.push({ email: user.email, status: "Created + Email Sent" });
          } else {
            results.push({ email: user.email, status: "Created but Email Failed" });
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
      <h2>📥 Excel User Uploader</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <button onClick={handleCreateUsers} disabled={!users.length}>
        Create Users
      </button>
      <p>{status}</p>
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

  // Fetch users from the database on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = firebase.database().ref('users/Student');
      const snapshot = await usersRef.get();
      if (snapshot.exists()) {
        const usersData = snapshot.val();

        // Convert usersData object to an array
        const usersList = Object.keys(usersData).map(key => ({
          ...usersData[key],
          userId: key, // Add userId for referencing
        }));

        // Set both users and filteredUsers
        setUsers(usersList);
        setFilteredUsers(usersList);
      }
    };

    fetchUsers();
  }, []);

  // Filter users as searchName changes (live search)
  useEffect(() => {
    if (!searchName) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name && user.name.toLowerCase().includes(searchName.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchName, users]);

  // Handle creating a user without logging them in
  const handleCreateUser = async () => {
    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Send request to Flask backend to create user and send email
      const response = await fetch("http://localhost:5000/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          rollNo: "N/A", // Add rollNo if applicable
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`User created successfully: ${email}`);
      } else {
        alert(`Failed to create user: ${data.error}`);
      }

      // Reset form fields
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('An error occurred while creating the user.');
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
        <button className="submit-button" onClick={handleCreateUser}>Create User</button>
      </div>

      <div className="search-container">
        <input
          className="search-field"
          type="text"
          placeholder="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Password</th>
            <th>Created On</th>
            <th>Created By</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <tr key={index}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.password || 'N/A'}</td>
                <td>{user.createdOn}</td>
                <td>{user.createdBy}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className='downloadbutton'>
      <button className="export-button" onClick={exportToExcel}>Download Excel</button>
    </div>

    {/* Integrate ExcelUserUploader */}
    <ExcelUserUploader sendEmail={sendEmail} />
    </div >
  );
};

export default ManageStudent;

