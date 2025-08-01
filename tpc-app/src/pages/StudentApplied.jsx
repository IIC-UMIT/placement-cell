// StudentDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, FileText, Award, Briefcase, Download, Star, StarHalf, Link as LinkIcon, Edit, MessageSquare } from 'lucide-react';

const StudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch(`/api/students/${id}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockStudent = {
          id: '1',
          name: 'Alex Johnson',
          profileImage: '/api/placeholder/150/150',
          email: 'alex.johnson@university.edu',
          phone: '+1 (555) 123-4567',
          location: 'Boston, MA',
          university: 'Boston University',
          degree: 'Bachelor of Science in Computer Science',
          graduationDate: 'May 2025',
          gpa: '3.8/4.0',
          summary: 'Final year Computer Science student with strong programming skills and internship experience. Passionate about software development and machine learning.',
          skills: [
            { name: 'JavaScript', level: 'Advanced' },
            { name: 'React', level: 'Advanced' },
            { name: 'Python', level: 'Intermediate' },
            { name: 'Java', level: 'Intermediate' },
            { name: 'SQL', level: 'Intermediate' },
            { name: 'Machine Learning', level: 'Beginner' },
            { name: 'Git', level: 'Advanced' },
            { name: 'Node.js', level: 'Intermediate' }
          ],
          education: [
            {
              id: '1',
              institution: 'Boston University',
              degree: 'Bachelor of Science in Computer Science',
              startDate: 'Sep 2021',
              endDate: 'May 2025',
              description: 'Concentration in Artificial Intelligence. Dean\'s List 2021-2024.'
            }
          ],
          experience: [
            {
              id: '1',
              company: 'TechStart Inc.',
              position: 'Software Engineering Intern',
              startDate: 'Jun 2024',
              endDate: 'Aug 2024',
              description: 'Developed and maintained features for a React-based web application. Implemented responsive UI components and integrated REST APIs.'
            },
            {
              id: '2',
              company: 'University IT Department',
              position: 'Student Developer',
              startDate: 'Sep 2023',
              endDate: 'May 2024',
              description: 'Assisted in developing and maintaining university websites. Created documentation and provided technical support to faculty.'
            }
          ],
          projects: [
            {
              id: '1',
              title: 'E-commerce Platform',
              description: 'Developed a full-stack e-commerce application using React, Node.js, and MongoDB. Implemented user authentication, product catalog, and payment processing.',
              url: 'https://github.com/alexj/ecommerce-project'
            },
            {
              id: '2',
              title: 'Image Recognition App',
              description: 'Created a mobile application that uses machine learning to identify objects in images. Utilized TensorFlow and React Native.',
              url: 'https://github.com/alexj/image-recognition'
            }
          ],
          certifications: [
            {
              id: '1',
              name: 'AWS Certified Developer - Associate',
              issuer: 'Amazon Web Services',
              date: 'Jan 2024',
              url: 'https://aws.amazon.com/certification/'
            },
            {
              id: '2',
              name: 'Meta Front-End Developer Professional Certificate',
              issuer: 'Meta',
              date: 'Aug 2023',
              url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer'
            }
          ],
          documents: [
            {
              id: '1',
              name: 'Resume.pdf',
              type: 'resume',
              uploadDate: '2025-02-15',
              url: '#'
            },
            {
              id: '2',
              name: 'Transcript.pdf',
              type: 'transcript',
              uploadDate: '2025-02-15',
              url: '#'
            },
            {
              id: '3',
              name: 'Cover_Letter.pdf',
              type: 'cover_letter',
              uploadDate: '2025-02-15',
              url: '#'
            }
          ],
          links: [
            { id: '1', name: 'LinkedIn', url: 'https://linkedin.com/in/alexj' },
            { id: '2', name: 'GitHub', url: 'https://github.com/alexj' },
            { id: '3', name: 'Portfolio', url: 'https://alexjohnson.dev' }
          ],
          applicationStatus: 'Applied',
          recruiterNotes: 'Strong candidate with relevant experience. Technical interview recommended.'
        };
        
        setStudent(mockStudent);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student details:', error);
        setLoading(false);
      }
    };
    
    fetchStudentDetails();
  }, [id]);
  
  const getSkillLevelBar = (level) => {
    switch(level) {
      case 'Advanced':
        return (
          <div className="flex items-center">
            <div className="w-16 h-2 bg-blue-500 rounded-full mr-2"></div>
            <div className="w-16 h-2 bg-blue-500 rounded-full mr-2"></div>
            <div className="w-16 h-2 bg-blue-500 rounded-full"></div>
          </div>
        );
      case 'Intermediate':
        return (
          <div className="flex items-center">
            <div className="w-16 h-2 bg-blue-500 rounded-full mr-2"></div>
            <div className="w-16 h-2 bg-blue-500 rounded-full mr-2"></div>
            <div className="w-16 h-2 bg-gray-200 rounded-full"></div>
          </div>
        );
      case 'Beginner':
        return (
          <div className="flex items-center">
            <div className="w-16 h-2 bg-blue-500 rounded-full mr-2"></div>
            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2"></div>
            <div className="w-16 h-2 bg-gray-200 rounded-full"></div>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2"></div>
            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2"></div>
            <div className="w-16 h-2 bg-gray-200 rounded-full"></div>
          </div>
        );
    }
  };
  
  const handleAddNote = () => {
    const note = prompt('Add a note about this student:');
    if (note) {
      // In a real application, you'd make an API call to save the note
      alert('Note added: ' + note);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading student details...</div>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Student not found</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          </div>
          
          <div className="flex space-x-3">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              onClick={() => window.open(student.documents.find(d => d.type === 'resume')?.url || '#', '_blank')}
            >
              <Download size={18} className="mr-1" />
              <span>Download Resume</span>
            </button>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              onClick={() => navigate(`/recruiter/messages/new?student=${student.id}`)}  
            >
              <MessageSquare size={18} className="mr-1" />
              <span>Message</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <img
                    src={student.profileImage}
                    alt={student.name}
                    className="w-32 h-32 rounded-full object-cover mb-4"
                  />
                  <h2 className="text-2xl font-bold">{student.name}</h2>
                  <p className="text-gray-600">{student.degree}</p>
                  <p className="text-blue-600 font-medium">{student.university}</p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-start mb-3">
                    <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{student.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-3">
                    <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{student.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-3">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{student.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-3">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Graduation Date</p>
                      <p className="font-medium">{student.graduationDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Award className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">GPA</p>
                      <p className="font-medium">{student.gpa}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Documents */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Documents</h3>
                {student.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between mb-3 last:mb-0">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">Uploaded on {doc.uploadDate}</p>
                      </div>
                    </div>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Links */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Links</h3>
                {student.links.map(link => (
                  <div key={link.id} className="flex items-center mb-3 last:mb-0">
                    <LinkIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {link.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recruiter Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recruiter Notes</h3>
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <p className="text-gray-700">{student.recruiterNotes || "No notes yet."}</p>
                </div>
                <button 
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center justify-center"
                  onClick={handleAddNote}
                >
                  <Edit size={18} className="mr-1" />
                  <span>Add Note</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b">
                <nav className="flex -mb-px">
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'profile'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile Summary
                  </button>
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'experience'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('experience')}
                  >
                    Experience
                  </button>
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'projects'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('projects')}
                  >
                    Projects
                  </button>
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'education'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('education')}
                  >
                    Education
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow">
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">About</h3>
                    <p className="text-gray-700">{student.summary}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Skills</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {student.skills.map((skill, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{skill.name}</h4>
                            <span className="text-sm text-gray-500">{skill.level}</span>
                          </div>
                          {getSkillLevelBar(skill.level)}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                    {student.certifications.length > 0 ? (
                      <div className="space-y-4">
                        {student.certifications.map(cert => (
                          <div key={cert.id} className="bg-gray-50 p-4 rounded-md">
                            <h4 className="font-medium">{cert.name}</h4>
                            <p className="text-sm text-gray-600">Issued by {cert.issuer} • {cert.date}</p>
                            {cert.url && (
                              <a 
                                href={cert.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center mt-2"
                              >
                                <LinkIcon size={14} className="mr-1" />
                                View Certificate
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No certifications listed.</p>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'experience' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
                  {student.experience.length > 0 ? (
                    <div className="space-y-6">
                      {student.experience.map(exp => (
                        <div key={exp.id} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-lg">{exp.position}</h4>
                          <p className="text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500 mb-2">{exp.startDate} - {exp.endDate}</p>
                          <p className="text-gray-700">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No work experience listed.</p>
                  )}
                </div>
              )}
              
              {activeTab === 'projects' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Projects</h3>
                  {student.projects.length > 0 ? (
                    <div className="space-y-6">
                      {student.projects.map(project => (
                        <div key={project.id} className="bg-gray-50 p-4 rounded-md">
                          <h4 className="font-semibold text-lg">{project.title}</h4>
                          <p className="text-gray-700 mb-3">{project.description}</p>
                          {project.url && (
                            <a 
                              href={project.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                            >
                              <LinkIcon size={16} className="mr-1" />
                              View Project
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No projects listed.</p>
                  )}
                </div>
              )}
              
              {activeTab === 'education' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Education</h3>
                  {student.education.length > 0 ? (
                    <div className="space-y-6">
                      {student.education.map(edu => (
                        <div key={edu.id} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-lg">{edu.degree}</h4>
                          <p className="text-gray-600">{edu.institution}</p>
                          <p className="text-sm text-gray-500 mb-2">{edu.startDate} - {edu.endDate}</p>
                          <p className="text-gray-700">{edu.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No education history listed.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDetailsPage;

// import React, { useState, useEffect } from "react";
// import firebase from "firebase/compat/app";
// import "firebase/compat/database";

// const StudentDetailsPage = ({ recruiterKey }) => {
//   const [appliedStudentIds, setAppliedStudentIds] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!recruiterKey) return;

//     const fetchAppliedStudents = async () => {
//       try {
//         // Fetch all applied student IDs for this recruiter
//         const appliedRef = await firebase
//           .database()
//           .ref(`Recruiters/${recruiterKey}/AppliedStudents`)
//           .once("value");

//         const appliedData = appliedRef.val();

//         if (!appliedData) {
//           setAppliedStudentIds([]);
//           setStudents([]);
//           setLoading(false);
//           return;
//         }

//         const ids = Object.keys(appliedData);
//         setAppliedStudentIds(ids);

//         // Now fetch details for those student IDs from Students node
//         // Since students are organized by year->branch->id,
//         // we must search through all years and branches for each student ID

//         const studentRef = await firebase.database().ref("Students").once("value");
//         const studentData = studentRef.val();

//         let foundStudents = [];

//         ids.forEach((studentId) => {
//           for (const year in studentData) {
//             for (const branch in studentData[year]) {
//               if (studentData[year][branch][studentId]) {
//                 foundStudents.push({
//                   id: studentId,
//                   year,
//                   branch,
//                   ...studentData[year][branch][studentId],
//                 });
//                 break;
//               }
//             }
//           }
//         });

//         setStudents(foundStudents);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching applied students:", error);
//         setLoading(false);
//       }
//     };

//     fetchAppliedStudents();
//   }, [recruiterKey]);

//   if (loading) {
//     return <div>Loading applied students...</div>;
//   }

//   if (!students.length) {
//     return <div>No students have applied yet.</div>;
//   }

//   return (
//     <div className="max-w-7xl mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-4">Applied Students</h2>
//       <table className="min-w-full border border-gray-300 rounded-md overflow-hidden">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="border px-4 py-2 text-left">Student ID</th>
//             <th className="border px-4 py-2 text-left">Name</th>
//             <th className="border px-4 py-2 text-left">Degree</th>
//             <th className="border px-4 py-2 text-left">Year</th>
//             <th className="border px-4 py-2 text-left">Branch</th>
//             <th className="border px-4 py-2 text-left">Email</th>
//             <th className="border px-4 py-2 text-left">Phone</th>
//           </tr>
//         </thead>
//         <tbody>
//           {students.map((student) => (
//             <tr key={student.id} className="hover:bg-gray-50">
//               <td className="border px-4 py-2">{student.id}</td>
//               <td className="border px-4 py-2">{student.name || "N/A"}</td>
//               <td className="border px-4 py-2">{student.degree || "-"}</td>
//               <td className="border px-4 py-2">{student.year}</td>
//               <td className="border px-4 py-2">{student.branch}</td>
//               <td className="border px-4 py-2">{student.email || "-"}</td>
//               <td className="border px-4 py-2">{student.phone || "-"}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default StudentDetailsPage;
