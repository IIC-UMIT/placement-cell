// // // import React, { useState, useEffect } from "react";
// // // import firebase from "firebase/compat/app";
// // // import "firebase/compat/auth";
// // // import "firebase/compat/database";

// // // const JobListings = () => {
// // //   const [loggedInUser, setLoggedInUser] = useState(null);
// // //   const [userYear, setUserYear] = useState(null);
// // //   const [postings, setPostings] = useState([]);
// // //   const [filteredPostings, setFilteredPostings] = useState([]);
// // //   const [searchQuery, setSearchQuery] = useState("");

// // //   useEffect(() => {
// // //     const fetchUserData = async () => {
// // //       const user = firebase.auth().currentUser;
// // //       if (!user) return;

// // //       const userId = user.uid;
// // //       setLoggedInUser(userId);

// // //       try {
// // //         const studentRef = await firebase.database().ref(`Students`).once("value");
// // //         const studentData = studentRef.val();

// // //         let foundUser = null;
// // //         let passOutYear = null;

// // //         // Search for the user in all pass-out years
// // //         Object.keys(studentData).forEach((year) => {
// // //           Object.keys(studentData[year]).forEach((branch) => {
// // //             if (studentData[year][branch][userId]) {
// // //               foundUser = studentData[year][branch][userId];
// // //               passOutYear = year;
// // //             }
// // //           });
// // //         });

// // //         if (!foundUser) return;

// // //         // Determine the student's current year
// // //         const currentAcademicYear = "2024-2025";
// // //         let studentYear = null;

// // //         if (passOutYear === "May 2026") {
// // //           studentYear = "3rd Year";
// // //         } else if (passOutYear === "May 2025") {
// // //           studentYear = "4th Year";
// // //         }

// // //         setUserYear(studentYear);
// // //         fetchJobPostings(studentYear);
// // //       } catch (error) {
// // //         console.error("Error fetching user data:", error);
// // //       }
// // //     };

// // //     fetchUserData();
// // //   }, []);

// // //   const fetchJobPostings = async (studentYear) => {
// // //     try {
// // //       const recruiterRef = await firebase.database().ref("Recruiters").once("value");
// // //       const recruiterData = recruiterRef.val();

// // //       if (!recruiterData) return;

// // //       let jobList = [];
// // //       Object.values(recruiterData).forEach((recruiter) => {
// // //         if (recruiter.postRecruitmentStatus === true) {
// // //           if (studentYear === "3rd Year" && recruiter.internship) {
// // //             jobList.push({
// // //               title: recruiter.internship.internship_title,
// // //               company: recruiter.company_name,
// // //               stipend: recruiter.internship.ctcAndBreakup.stipend,
// // //               location: recruiter.internship.remote_on_site,
// // //               type: "Internship",
// // //             });
// // //           } else if (studentYear === "4th Year" && recruiter.placement) {
// // //             jobList.push({
// // //               title: recruiter.placement.job_title,
// // //               company: recruiter.company_name,
// // //               salary: recruiter.placement.ctcAndBreakup.salary,
// // //               location: recruiter.placement.jobLocation,
// // //               type: "Placement",
// // //             });
// // //           }
// // //         }
// // //       });

// // //       setPostings(jobList);
// // //       setFilteredPostings(jobList);
// // //     } catch (error) {
// // //       console.error("Error fetching job postings:", error);
// // //     }
// // //   };

// // //   const handleSearch = (event) => {
// // //     const query = event.target.value.toLowerCase();
// // //     setSearchQuery(query);

// // //     const filtered = postings.filter((job) =>
// // //       job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query)
// // //     );
// // //     setFilteredPostings(filtered);
// // //   };

// // //   return (
// // //     <div>
// // //       <h2>Job Opportunities</h2>
// // //       {userYear ? <p>You are in {userYear}</p> : <p>Loading...</p>}

// // //       <input
// // //         type="text"
// // //         placeholder="Search jobs..."
// // //         value={searchQuery}
// // //         onChange={handleSearch}
// // //       />

// // //       {filteredPostings.length > 0 ? (
// // //         <div>
// // //           {filteredPostings.map((job, index) => (
// // //             <div key={index} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
// // //               <h3>{job.title} ({job.type})</h3>
// // //               <p>Company: {job.company}</p>
// // //               <p>Location: {job.location}</p>
// // //               <p>Salary/Stipend: {job.salary || job.stipend}</p>
// // //               <button>Apply</button>
// // //             </div>
// // //           ))}
// // //         </div>
// // //       ) : (
// // //         <p>No job postings available</p>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default JobListings;


// // import React, { useState, useEffect } from "react";
// // import firebase from "firebase/compat/app";
// // import "firebase/compat/auth";
// // import "firebase/compat/database";

// // const JobListings = () => {
// //   const [loggedInUser, setLoggedInUser] = useState(null);
// //   const [userYear, setUserYear] = useState(null);
// //   const [postings, setPostings] = useState([]);
// //   const [filteredPostings, setFilteredPostings] = useState([]);
// //   const [searchQuery, setSearchQuery] = useState("");

// //   useEffect(() => {
// //     const fetchUserData = async () => {
// //       const user = firebase.auth().currentUser;
// //       if (!user) return;

// //       const userId = user.uid;
// //       setLoggedInUser(userId);

// //       try {
// //         const studentRef = await firebase.database().ref("Students").once("value");
// //         const studentData = studentRef.val();

// //         let foundUser = null;
// //         let passOutYear = null;

// //         // Search for the user in all pass-out years
// //         Object.keys(studentData).forEach((year) => {
// //           Object.keys(studentData[year]).forEach((branch) => {
// //             if (studentData[year][branch][userId]) {
// //               foundUser = studentData[year][branch][userId];
// //               passOutYear = year;
// //             }
// //           });
// //         });

// //         if (!foundUser) return;

// //         // Determine the student's current year
// //         let studentYear = null;
// //         if (passOutYear === "May 2026") {
// //           studentYear = "3rd Year";
// //         } else if (passOutYear === "May 2025") {
// //           studentYear = "4th Year";
// //         }

// //         setUserYear(studentYear);
// //         fetchJobPostings(studentYear);
// //       } catch (error) {
// //         console.error("Error fetching user data:", error);
// //       }
// //     };

// //     fetchUserData();
// //     // eslint-disable-next-line
// //   }, []);

// //   const fetchJobPostings = async (studentYear) => {
// //     try {
// //       const recruiterRef = await firebase.database().ref("Recruiters").once("value");
// //       const recruiterData = recruiterRef.val();

// //       if (!recruiterData) return;

// //       let jobList = [];
// //       Object.values(recruiterData).forEach((recruiter) => {
// //         if (recruiter && recruiter.postRecruitmentStatus === true) {
// //           if (studentYear === "3rd Year" && recruiter.internship) {
// //             jobList.push({
// //               title: recruiter.internship.internship_title,
// //               company: recruiter.company_name,
// //               stipend: recruiter.internship.ctcAndBreakup && recruiter.internship.ctcAndBreakup.stipend,
// //               location: recruiter.internship.remote_on_site,
// //               type: "Internship",
// //             });
// //           } else if (studentYear === "4th Year" && recruiter.placement) {
// //             jobList.push({
// //               title: recruiter.placement.job_title,
// //               company: recruiter.company_name,
// //               salary: recruiter.placement.ctcAndBreakup && recruiter.placement.ctcAndBreakup.salary,
// //               location: recruiter.placement.jobLocation,
// //               type: "Placement",
// //             });
// //           }
// //         }
// //       });

// //       setPostings(jobList);
// //       setFilteredPostings(jobList);
// //     } catch (error) {
// //       console.error("Error fetching job postings:", error);
// //     }
// //   };

// //   const handleSearch = (event) => {
// //     const query = event.target.value.toLowerCase();
// //     setSearchQuery(query);

// //     const filtered = postings.filter((job) =>
// //       job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query)
// //     );
// //     setFilteredPostings(filtered);
// //   };

// //   return (
// //     <div>
// //       <h2>Job Opportunities</h2>
// //       {userYear ? <p>You are in {userYear}</p> : <p>Loading...</p>}

// //       <input
// //         type="text"
// //         placeholder="Search jobs..."
// //         value={searchQuery}
// //         onChange={handleSearch}
// //       />

// //       {filteredPostings.length > 0 ? (
// //         <div>
// //           {filteredPostings.map((job, index) => (
// //             <div key={index} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
// //               <h3>
// //                 {job.title} ({job.type})
// //               </h3>
// //               <p>Company: {job.company}</p>
// //               <p>Location: {job.location}</p>
// //               <p>Salary/Stipend: {job.salary || job.stipend}</p>
// //               <button>Apply</button>
// //             </div>
// //           ))}
// //         </div>
// //       ) : (
// //         <p>No job postings available</p>
// //       )}
// //     </div>
// //   );
// // };

// // export default JobListings;


// import React, { useState, useEffect } from "react";
// import firebase from "firebase/compat/app";
// import "firebase/compat/auth";
// import "firebase/compat/database";

// const JobListings = () => {
//   const [loggedInUser, setLoggedInUser] = useState(null);
//   const [userYear, setUserYear] = useState(null);
//   const [postings, setPostings] = useState([]);
//   const [filteredPostings, setFilteredPostings] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const user = firebase.auth().currentUser;
//       if (!user) return;

//       const userId = user.uid;
//       setLoggedInUser(userId);

//       try {
//         const studentRef = await firebase.database().ref("Students").once("value");
//         const studentData = studentRef.val();

//         let foundUser = null;
//         let passOutYear = null;

//         Object.keys(studentData).forEach((year) => {
//           Object.keys(studentData[year]).forEach((branch) => {
//             if (studentData[year][branch][userId]) {
//               foundUser = studentData[year][branch][userId];
//               passOutYear = year;
//             }
//           });
//         });

//         if (!foundUser) return;

//         let studentYear = null;
//         if (passOutYear === "May 2026") {
//           studentYear = "3rd Year";
//         } else if (passOutYear === "May 2025") {
//           studentYear = "4th Year";
//         }

//         setUserYear(studentYear);
//         fetchJobPostings(studentYear);
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };

//     fetchUserData();
//   }, []);

//   const fetchJobPostings = async (studentYear) => {
//     try {
//       const recruiterRef = await firebase.database().ref("Recruiters").once("value");
//       const recruiterData = recruiterRef.val();
//       if (!recruiterData) return;

//       let jobList = [];

//       Object.values(recruiterData).forEach((recruiter) => {
//         if (recruiter && recruiter.postRecruitmentStatus === true) {
//           if (studentYear === "3rd Year" && recruiter.internship) {
//             jobList.push({
//               title: recruiter.internship.internship_title,
//               company: recruiter.company_name,
//               stipend: recruiter.internship.ctcAndBreakup?.stipend,
//               location: recruiter.internship.remote_on_site,
//               type: "Internship",
//             });
//           }

//           if (studentYear === "4th Year" && recruiter.placement) {
//             jobList.push({
//               title: recruiter.placement.job_title,
//               company: recruiter.company_name,
//               salary: recruiter.placement.ctcAndBreakup?.salary,
//               location: recruiter.placement.jobLocation,
//               type: "Placement",
//             });
//           }
//         }
//       });

//       setPostings(jobList);
//       setFilteredPostings(jobList);
//     } catch (error) {
//       console.error("Error fetching job postings:", error);
//     }
//   };

//   const handleSearch = (event) => {
//     const query = event.target.value.toLowerCase();
//     setSearchQuery(query);

//     const filtered = postings.filter((job) =>
//       job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query)
//     );
//     setFilteredPostings(filtered);
//   };

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
//       <h2>Job Opportunities</h2>
//       {userYear ? (
//         <p>You are in <strong>{userYear}</strong></p>
//       ) : (
//         <p>Loading your academic details...</p>
//       )}

//       <input
//         type="text"
//         placeholder="Search jobs by title or company..."
//         value={searchQuery}
//         onChange={handleSearch}
//         style={{
//           padding: "10px",
//           width: "100%",
//           maxWidth: "400px",
//           marginBottom: "20px",
//           borderRadius: "4px",
//           border: "1px solid #ccc",
//         }}
//       />

//       {filteredPostings.length > 0 ? (
//         <div>
//           {filteredPostings.map((job, index) => (
//             <div
//               key={index}
//               style={{
//                 border: "1px solid #ccc",
//                 borderRadius: "8px",
//                 padding: "16px",
//                 marginBottom: "16px",
//                 background: "#f9f9f9",
//               }}
//             >
//               <h3 style={{ marginBottom: "8px" }}>
//                 {job.title}{" "}
//                 <span style={{ fontSize: "14px", color: "#555" }}>({job.type})</span>
//               </h3>
//               <p><strong>Company:</strong> {job.company}</p>
//               <p><strong>Location:</strong> {job.location}</p>
//               <p>
//                 <strong>{job.type === "Internship" ? "Stipend" : "Salary"}:</strong>{" "}
//                 {job.salary || job.stipend}
//               </p>
//               <button
//                 style={{
//                   marginTop: "10px",
//                   padding: "8px 12px",
//                   background: "#003049",
//                   color: "#fff",
//                   border: "none",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                 }}
//               >
//                 Apply
//               </button>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p style={{ color: "#999", fontStyle: "italic" }}>
//           No job postings available right now for your academic year.
//         </p>
//       )}
//     </div>
//   );
// };

// export default JobListings;

import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const JobListings = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userYear, setUserYear] = useState(null);
  const [postings, setPostings] = useState([]);
  const [filteredPostings, setFilteredPostings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = firebase.auth().currentUser;
      if (!user) return;

      const userId = user.uid;
      setLoggedInUser(userId);

      try {
        const studentRef = await firebase.database().ref("Students").once("value");
        const studentData = studentRef.val();

        let foundUser = null;
        let passOutYear = null;

        // Search for the user in all pass-out years
        Object.keys(studentData).forEach((year) => {
          Object.keys(studentData[year]).forEach((branch) => {
            if (studentData[year][branch][userId]) {
              foundUser = studentData[year][branch][userId];
              passOutYear = year;
            }
          });
        });

        if (!foundUser) return;

        // Determine the student's current year
        let studentYear = null;
        if (passOutYear === "May 2026") {
          studentYear = "3rd Year";
        } else if (passOutYear === "May 2025") {
          studentYear = "4th Year";
        }

        setUserYear(studentYear);
        fetchJobPostings(studentYear);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
    // eslint-disable-next-line
  }, []);

  const fetchJobPostings = async (studentYear) => {
    try {
      const recruiterRef = await firebase.database().ref("Recruiters").once("value");
      const recruiterData = recruiterRef.val();

      if (!recruiterData) return;

      let jobList = [];
      Object.entries(recruiterData).forEach(([recruiterKey, recruiter]) => {
        if (recruiter && recruiter.postRecruitmentStatus === true) {
          if (studentYear === "3rd Year" && recruiter.internship) {
            jobList.push({
              title: recruiter.internship.internship_title,
              company: recruiter.company_name,
              stipend: recruiter.internship.ctcAndBreakup && recruiter.internship.ctcAndBreakup.stipend,
              location: recruiter.internship.remote_on_site,
              type: "Internship",
              recruiterKey,
            });
          } else if (studentYear === "4th Year" && recruiter.placement) {
            jobList.push({
              title: recruiter.placement.job_title,
              company: recruiter.company_name,
              salary: recruiter.placement.ctcAndBreakup && recruiter.placement.ctcAndBreakup.salary,
              location: recruiter.placement.jobLocation,
              type: "Placement",
              recruiterKey,
            });
          }
        }
      });

      setPostings(jobList);
      setFilteredPostings(jobList);
    } catch (error) {
      console.error("Error fetching job postings:", error);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = postings.filter((job) =>
      (job.title && job.title.toLowerCase().includes(query)) ||
      (job.company && job.company.toLowerCase().includes(query))
    );
    setFilteredPostings(filtered);
  };

  const handleApply = async (job) => {
    if (!loggedInUser) {
      alert("Not logged in!");
      return;
    }

    try {
      await firebase
        .database()
        .ref(`Recruiters/${job.recruiterKey}/AppliedStudents/${loggedInUser}`)
        .set(true);
      alert("Application submitted!");
    } catch (error) {
      console.error("Error applying:", error);
      alert("Failed to apply.");
    }
  };

  return (
    <div>
      <h2>Job Opportunities</h2>
      {userYear ? <p>You are in {userYear}</p> : <p>Loading...</p>}

      <input
        type="text"
        placeholder="Search jobs..."
        value={searchQuery}
        onChange={handleSearch}
      />

      {filteredPostings.length > 0 ? (
        <div>
          {filteredPostings.map((job, index) => (
            <div key={index} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
              <h3>
                {job.title} ({job.type})
              </h3>
              <p>Company: {job.company}</p>
              <p>Location: {job.location}</p>
              <p>Salary/Stipend: {job.salary || job.stipend}</p>
              <button onClick={() => handleApply(job)}>Apply</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No job postings available</p>
      )}
    </div>
  );
};

export default JobListings;
