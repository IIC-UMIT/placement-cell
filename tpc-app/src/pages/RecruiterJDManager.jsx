// JobDescriptionManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, ChevronDown, Edit, Trash2, Eye, Copy, Calendar, Users, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap'; // Add this import for modal functionality
import "../styles/RecruiterJDManager.css"; // Ensure you have a CSS file for styling

const JobDescriptionManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  const navigate = useNavigate();
  
  // Mock data fetch
  useEffect(() => {
    // Replace with actual API call
    const mockJobs = [
      {
        id: 1,
        title: 'Software Engineer',
        department: 'Engineering',
        location: 'Remote',
        postedDate: '2025-04-10',
        deadline: '2025-05-15',
        status: 'active',
        applicants: 24,
        experience: '3-5 years',
        salary: '$90,000 - $120,000'
      },
      {
        id: 2,
        title: 'Product Manager',
        department: 'Product',
        location: 'New York, NY',
        postedDate: '2025-04-05',
        deadline: '2025-05-20',
        status: 'active',
        applicants: 18,
        experience: '4-6 years',
        salary: '$110,000 - $140,000'
      },
      {
        id: 3,
        title: 'UX Designer',
        department: 'Design',
        location: 'Hybrid',
        postedDate: '2025-04-01',
        deadline: '2025-05-10',
        status: 'active',
        applicants: 12,
        experience: '2-4 years',
        salary: '$85,000 - $110,000'
      },
      {
        id: 4,
        title: 'Marketing Specialist',
        department: 'Marketing',
        location: 'Boston, MA',
        postedDate: '2025-03-15',
        deadline: '2025-04-15',
        status: 'closed',
        applicants: 32,
        experience: '2-3 years',
        salary: '$70,000 - $90,000'
      },
    ];
    
    setJobs(mockJobs);
  }, []);

  // Filter jobs based on status and search term
  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.postedDate) - new Date(a.postedDate);
    } else if (sortBy === 'oldest') {
      return new Date(a.postedDate) - new Date(b.postedDate);
    } else if (sortBy === 'applicants') {
      return b.applicants - a.applicants;
    } else if (sortBy === 'deadline') {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return 0;
  });

  const handleDeleteClick = (jobId) => {
    setJobToDelete(jobId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobToDelete));
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Job Descriptions</h1>
          <Link 
            to="/recruiter/jobs/new" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus size={18} className="mr-1" />
            <span>Create New JD</span>
          </Link>
        </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 px-4 md:space-y-0">
            <div className="flex space-x-4">
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setFilter('all')}
              >
                All Jobs
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'closed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setFilter('closed')}
              >
                Closed
              </button>
            </div>
            
            <div className="flex space-x-3">
              <div className="relative">
                {/* <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="applicants">Most Applicants</option>
                  <option value="deadline">Deadline (Soonest)</option>
                </select>
                {/* <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" /> */}
              </div>
            </div>
          </div>
        

        {/* Job Listings */}
        <div>
          {sortedJobs.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {sortedJobs.map(job => (
                <div key={job.id} className="hover:bg-gray-50 mb-4 rounded-lg shadow-sm bg-white" style={{ padding: '20px' }}>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <div className="flex items-center">
                        <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                          job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {job.status === 'active' ? 'Active' : 'Closed'}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500">
                        <span className="flex items-center mr-4">
                          <Users size={16} className="mr-1" />
                          Department: {job.department}
                        </span>
                        <span className="flex items-center mr-4">
                          <Calendar size={16} className="mr-1" />
                          Posted: {job.postedDate}
                        </span>
                        <span className="flex items-center mr-4">
                          <Clock size={16} className="mr-1" />
                          Deadline: {job.deadline}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <span className="text-sm mr-4">Location: {job.location}</span>
                        <span className="text-sm mr-4">Experience: {job.experience}</span>
                        <span className="text-sm">Salary: {job.salary}</span>
                      </div>
                    </div>
                    
                    <div className="flex mt-4 md:mt-0">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center mr-4">
                        <Users size={16} className="mr-1" /> {job.applicants} Applicants
                      </span>
                      
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          onClick={() => navigate(`/recruiter/jobs/${job.id}`)}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-full"
                          onClick={() => alert('Duplicate job functionality')}
                        >
                          <Copy size={18} />
                        </button>
                        <button 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          onClick={() => handleDeleteClick(job.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No job descriptions found matching your criteria.</p>
            </div>
          )}
        </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this job posting?</Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={cancelDelete}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={confirmDelete}>
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JobDescriptionManagement;