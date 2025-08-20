import React, { useState, useRef } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import '../styles/RecruiterPage.css';

function RecruiterPage({loggedInUser}) {
    const [companyDetails, setCompanyDetails] = useState({
        company_name: '',
        industry_sector: '',
        company_overview: '',
        website: '',
        locations: [{ location_name: '', address: '' }],
        companyContact: '',
        alternateContact: '',
    });

    const [formData, setFormData] = useState({
        company_name: '',
        placement: {
            job_title: '',
            job_desc: '',
            type_of_employment: '',
            noOfExpectedHires: '',
            jobLocation: '',
            eligibility_criteria: {
                required_qualifications: '',
                skill_requirements: '',
                batch_year_of_study: '',
                minimum_cgpa_grade: '',
                other_criteria: '',
            },
            remote_on_site: '',
            ctcAndBreakup: {
                salary: '',
                bonus: '',
                additional_benefits: '',
            },
            selection_process: {
                recruitment_stages: [
                    'Resume shortlisting',
                    'Technical test',
                    'Interviews',
                ],
                assessment_details: '',
                interview_process: [
                    {
                        round: 1,
                        focus: 'Technical/HR',
                    },
                ],
                expected_timeline: '',
            },
        },
        internship: {
            internship_title: '',
            internship_description: '',
            duration: {
                start_date: '',
                end_date: '',
            },
            type_of_employment: '',
            remote_on_site: '',
            eligibility_criteria: {
                required_qualifications: '',
                skill_requirements: '',
                batch_year_of_study: '',
                minimum_cgpa_grade: '',
                other_criteria: '',
            },
            ctcAndBreakup: {
                stipend: '',
                bonus: '',
                additional_benefits: '',
            },
        },
    });

    const [isInternshipEnabled, setIsInternshipEnabled] = useState(false);

    // Add refs for required fields
    const requiredRefs = {
        company_name: useRef(null),
        industry_sector: useRef(null),
        company_overview: useRef(null),
        website: useRef(null),
        companyContact: useRef(null),
        'placement.job_title': useRef(null),
        'placement.job_desc': useRef(null),
        'placement.type_of_employment': useRef(null),
        'placement.noOfExpectedHires': useRef(null),
        'placement.jobLocation': useRef(null),
        'placement.remote_on_site': useRef(null),
        'placement.eligibility_criteria.required_qualifications': useRef(null),
        'placement.eligibility_criteria.skill_requirements': useRef(null),
        'placement.eligibility_criteria.batch_year_of_study': useRef(null),
        'placement.eligibility_criteria.minimum_cgpa_grade': useRef(null),
        'placement.ctcAndBreakup.salary': useRef(null),
        'placement.selection_process.assessment_details': useRef(null),
        'placement.selection_process.expected_timeline': useRef(null),
        // Internship fields (conditionally required)
        'internship.internship_title': useRef(null),
        'internship.internship_description': useRef(null),
        'internship.duration.start_date': useRef(null),
        'internship.duration.end_date': useRef(null),
        'internship.type_of_employment': useRef(null),
        'internship.remote_on_site': useRef(null),
        'internship.eligibility_criteria.required_qualifications': useRef(null),
        'internship.eligibility_criteria.skill_requirements': useRef(null),
        'internship.eligibility_criteria.batch_year_of_study': useRef(null),
        'internship.eligibility_criteria.minimum_cgpa_grade': useRef(null),
        'internship.ctcAndBreakup.stipend': useRef(null),
    };

    const [missingFields, setMissingFields] = useState({});

    // Helper to get value by path
    const getValueByPath = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    // List of required fields
    const requiredFields = [
        { name: 'company_name', section: 'companyDetails' },
        { name: 'industry_sector', section: 'companyDetails' },
        { name: 'company_overview', section: 'companyDetails' },
        { name: 'website', section: 'companyDetails' },
        { name: 'companyContact', section: 'companyDetails' },
        { name: 'placement.job_title', section: 'formData' },
        { name: 'placement.job_desc', section: 'formData' },
        { name: 'placement.type_of_employment', section: 'formData' },
        { name: 'placement.noOfExpectedHires', section: 'formData' },
        { name: 'placement.jobLocation', section: 'formData' },
        { name: 'placement.remote_on_site', section: 'formData' },
        { name: 'placement.eligibility_criteria.required_qualifications', section: 'formData' },
        { name: 'placement.eligibility_criteria.skill_requirements', section: 'formData' },
        { name: 'placement.eligibility_criteria.batch_year_of_study', section: 'formData' },
        { name: 'placement.eligibility_criteria.minimum_cgpa_grade', section: 'formData' },
        { name: 'placement.ctcAndBreakup.salary', section: 'formData' },
        { name: 'placement.selection_process.assessment_details', section: 'formData' },
        { name: 'placement.selection_process.expected_timeline', section: 'formData' },
    ];

    // Internship required fields
    const internshipRequiredFields = [
        { name: 'internship.internship_title', section: 'formData' },
        { name: 'internship.internship_description', section: 'formData' },
        { name: 'internship.duration.start_date', section: 'formData' },
        { name: 'internship.duration.end_date', section: 'formData' },
        { name: 'internship.type_of_employment', section: 'formData' },
        { name: 'internship.remote_on_site', section: 'formData' },
        { name: 'internship.eligibility_criteria.required_qualifications', section: 'formData' },
        { name: 'internship.eligibility_criteria.skill_requirements', section: 'formData' },
        { name: 'internship.eligibility_criteria.batch_year_of_study', section: 'formData' },
        { name: 'internship.eligibility_criteria.minimum_cgpa_grade', section: 'formData' },
        { name: 'internship.ctcAndBreakup.stipend', section: 'formData' },
    ];

    const handleCompanyChange = (e) => {
        const { name, value } = e.target;
        setCompanyDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
        // Remove error message for this field if filled
        if (value && value.trim() !== '') {
            setMissingFields((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    // const handleFormChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData((prevData) => ({
    //         ...prevData,
    //         [name]: value,
    //     }));
        
    //     if (value && value.trim() !== '') {
    //         setMissingFields((prev) => {
    //             const updated = { ...prev };
    //             delete updated[name];
    //             return updated;
    //         });
    //     }
    // };

    const handleFormChange = (e) => {
  const { name, value } = e.target;
  const keys = name.split(".");

  setFormData((prevData) => {
    const updatedData = { ...prevData };
    let current = updatedData;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;

    return updatedData;
  });

  // Remove error message for this field if filled
  if (value && value.trim() !== "") {
    setMissingFields((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }
};


    const handleSubmit = async (e) => {
  e.preventDefault();

  // ... your validation logic here ...

  try {
    // Save everything under loggedInUser
    const recruiterRef = firebase.database().ref(`Recruiters/${loggedInUser}`);

    await recruiterRef.set({
      company_name: companyDetails.company_name,
      industry_sector: companyDetails.industry_sector,
      company_overview: companyDetails.company_overview,
      website: companyDetails.website,
      locations: companyDetails.locations,
      companyContact: companyDetails.companyContact,
      alternateContact: companyDetails.alternateContact,

      placement: {
        ...formData.placement,
      },

      // Save internship only if enabled
      ...(isInternshipEnabled && {
        internship: {
          ...formData.internship,
        },
      }),

      postRecruitmentStatus: true,
    });

    alert("Details submitted successfully!");
  } catch (error) {
    console.error("Error submitting details:", error);
    alert("Failed to submit details. Please try again.");
  }
};


    return (
        <div>
            <style>
                {`
                .required-asterisk { color: red; margin-left: 2px; }
                .required-message { color: red; font-size: 0.95em; margin-top: 2px; }
                input, textarea, select {
                    color: #222 !important;
                    background: #fff !important;
                    font-size: 1rem !important;
                    caret-color: #222 !important;
                }
                input::placeholder, textarea::placeholder {
                    color: #888 !important;
                    opacity: 1;
                }
                `}
            </style>
            <div className="recruiter-container">
                <div className="section">
                    <h2>Company Details</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="company_name">
                                Company Name
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="company_name"
                                ref={requiredRefs.company_name}
                                value={companyDetails.company_name}
                                onChange={handleCompanyChange}
                                placeholder="Enter company name"
                            />
                            {missingFields.company_name && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="industry_sector">
                                Industry Sector
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="industry_sector"
                                ref={requiredRefs.industry_sector}
                                value={companyDetails.industry_sector}
                                onChange={handleCompanyChange}
                                placeholder="Enter industry sector"
                            />
                            {missingFields.industry_sector && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="company_overview">
                                Company Overview
                                <span className="required-asterisk">*</span>
                            </label>
                            <textarea
                                name="company_overview"
                                ref={requiredRefs.company_overview}
                                value={companyDetails.company_overview}
                                onChange={handleCompanyChange}
                                placeholder="Provide a brief overview of the company"
                            />
                            {missingFields.company_overview && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="website">
                                Website
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="url"
                                name="website"
                                ref={requiredRefs.website}
                                value={companyDetails.website}
                                onChange={handleCompanyChange}
                                placeholder="Enter the company website URL"
                            />
                            {missingFields.website && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="companyContact">
                                Company Contact
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="tel"
                                name="companyContact"
                                ref={requiredRefs.companyContact}
                                value={companyDetails.companyContact}
                                onChange={handleCompanyChange}
                                placeholder="Enter company contact number"
                            />
                            {missingFields.companyContact && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="alternateContact">Alternate Contact</label>
                            <input
                                type="tel"
                                name="alternateContact"
                                value={companyDetails.alternateContact}
                                onChange={handleCompanyChange}
                                placeholder="Enter alternate contact number"
                            />
                        </div>

                        <h3>Placement Details</h3>
                        <div className="form-group">
                            <label htmlFor="placement.job_title">
                                Job Title
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="placement.job_title"
                                ref={requiredRefs['placement.job_title']}
                                value={formData.placement.job_title}
                                onChange={handleFormChange}
                                placeholder="Enter job title"
                            />
                            {missingFields['placement.job_title'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="placement.job_desc">
                                Job Description
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="placement.job_desc"
                                ref={requiredRefs['placement.job_desc']}
                                value={formData.placement.job_desc}
                                onChange={handleFormChange}
                                placeholder="Describe the job responsibilities"
                            />
                            {missingFields['placement.job_desc'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="placement.type_of_employment">
                                Type of Employment
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="placement.type_of_employment"
                                ref={requiredRefs['placement.type_of_employment']}
                                value={formData.placement.type_of_employment}
                                onChange={handleFormChange}
                                placeholder="Enter type of employment"
                            />
                            {missingFields['placement.type_of_employment'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="placement.noOfExpectedHires">
                                No. of Expected Hires
                                <span className="required-asterisk">*</span>
                            </label>
                            {/* <input
                                type="number"
                                name="placement.noOfExpectedHires"
                                ref={requiredRefs['placement.noOfExpectedHires']}
                                value={formData.placement.noOfExpectedHires}
                                onChange={handleFormChange}
                                placeholder="Enter expected number of hires"
                            /> */}

                            <input
  type="number"
  name="placement.noOfExpectedHires"
  ref={requiredRefs['placement.noOfExpectedHires']}
  value={formData.placement.noOfExpectedHires || ''}
  onChange={handleFormChange}
  placeholder="Enter expected number of hires"
/>

                            {missingFields['placement.noOfExpectedHires'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="placement.jobLocation">
                                Job Location
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="placement.jobLocation"
                                ref={requiredRefs['placement.jobLocation']}
                                value={formData.placement.jobLocation}
                                onChange={handleFormChange}
                                placeholder="Enter job location"
                            />
                            {missingFields['placement.jobLocation'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="placement.remote_on_site">
                                Remote/On-site/Hybrid
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="placement.remote_on_site"
                                ref={requiredRefs['placement.remote_on_site']}
                                value={formData.placement.remote_on_site}
                                onChange={handleFormChange}
                                placeholder="Enter work model"
                            />
                            {missingFields['placement.remote_on_site'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>

                        <h3>Eligibility Criteria for Placement</h3>
                        <div className="form-group">
                            <label htmlFor="placement.eligibility_criteria.required_qualifications">
                                Required Qualifications
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="placement.eligibility_criteria.required_qualifications"
                                ref={requiredRefs['placement.eligibility_criteria.required_qualifications']}
                                value={formData.placement.eligibility_criteria.required_qualifications}
                                onChange={handleFormChange}
                                placeholder="Enter required qualifications"
                            />
                            {missingFields['placement.eligibility_criteria.required_qualifications'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="placement.eligibility_criteria.skill_requirements">
                                Skill Requirements
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="placement.eligibility_criteria.skill_requirements"
                                ref={requiredRefs['placement.eligibility_criteria.skill_requirements']}
                                value={formData.placement.eligibility_criteria.skill_requirements}
                                onChange={handleFormChange}
                                placeholder="Enter skill requirements"
                            />
                            {missingFields['placement.eligibility_criteria.skill_requirements'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="placement.eligibility_criteria.batch_year_of_study">
                                Batch Year of Study
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="placement.eligibility_criteria.batch_year_of_study"
                                ref={requiredRefs['placement.eligibility_criteria.batch_year_of_study']}
                                value={formData.placement.eligibility_criteria.batch_year_of_study}
                                onChange={handleFormChange}
                                placeholder="Enter eligible batch year(s)"
                            />
                            {missingFields['placement.eligibility_criteria.batch_year_of_study'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="placement.eligibility_criteria.minimum_cgpa_grade">
                                Minimum CGPA/Grade
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="placement.eligibility_criteria.minimum_cgpa_grade"
                                ref={requiredRefs['placement.eligibility_criteria.minimum_cgpa_grade']}
                                value={formData.placement.eligibility_criteria.minimum_cgpa_grade}
                                onChange={handleFormChange}
                                placeholder="Enter minimum CGPA or grade"
                            />
                            {missingFields['placement.eligibility_criteria.minimum_cgpa_grade'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="placement.eligibility_criteria.other_criteria">
                                Other Criteria
                            </label>
                            <input
                                type="text"
                                name="placement.eligibility_criteria.other_criteria"
                                value={formData.placement.eligibility_criteria.other_criteria}
                                onChange={handleFormChange}
                                placeholder="Enter any other criteria"
                            />
                        </div>

                        <h3>CTC and Breakup for Placement</h3>
                        <div className="form-group">
                            <label htmlFor="placement.ctcAndBreakup.salary">
                                Salary
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="placement.ctcAndBreakup.salary"
                                ref={requiredRefs['placement.ctcAndBreakup.salary']}
                                value={formData.placement.ctcAndBreakup.salary}
                                onChange={handleFormChange}
                                placeholder="Enter expected salary"
                            />
                            {missingFields['placement.ctcAndBreakup.salary'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="placement.ctcAndBreakup.bonus">
                                Bonus/Incentives
                            </label>
                            <input
                                type="text"
                                name="placement.ctcAndBreakup.bonus"
                                value={formData.placement.ctcAndBreakup.bonus}
                                onChange={handleFormChange}
                                placeholder="Enter bonus or incentives"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="placement.ctcAndBreakup.additional_benefits">
                                Additional Benefits
                            </label>
                            <input
                                type="text"
                                name="placement.ctcAndBreakup.additional_benefits"
                                value={formData.placement.ctcAndBreakup.additional_benefits}
                                onChange={handleFormChange}
                                placeholder="Enter any additional benefits"
                            />
                        </div>

                        <h3>Selection Process for Placement</h3>
                        <div className="form-group">
                            <label htmlFor="placement.selection_process.assessment_details">
                                Assessment Details
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="placement.selection_process.assessment_details"
                                ref={requiredRefs['placement.selection_process.assessment_details']}
                                value={formData.placement.selection_process.assessment_details}
                                onChange={handleFormChange}
                                placeholder="Enter assessment details"
                            />
                            {missingFields['placement.selection_process.assessment_details'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="placement.selection_process.expected_timeline">
                                Expected Timeline
                                <span className="required-asterisk">*</span>
                            </label>
                            <input
                                type="text"
                                name="placement.selection_process.expected_timeline"
                                ref={requiredRefs['placement.selection_process.expected_timeline']}
                                value={formData.placement.selection_process.expected_timeline}
                                onChange={handleFormChange}
                                placeholder="Enter expected timeline"
                            />
                            {missingFields['placement.selection_process.expected_timeline'] && (
                                <div className="required-message">This is a required field</div>
                            )}
                        </div>

                        <div className="form-group" style={{ display: 'flex', gap: '0.5rem' , flexDirection: 'row'}}>
                            <input
                                type="checkbox"
                                id="include-internship"
                                checked={isInternshipEnabled}
                                onChange={() => setIsInternshipEnabled(!isInternshipEnabled)}
                                style={{ width: '18px'}}
                            />
                            <label htmlFor="include-internship" style={{ margin: 0, fontWeight: 600, fontSize: '1.2rem' }}>
                                Include Internship Details?
                            </label>
                        </div>

                        {isInternshipEnabled && (
                            <>
                                <h3>Internship Details</h3>
                                <div className="form-group">
                                    <label htmlFor="internship.internship_title">
                                        Internship Title
                                        <span className="required-asterisk">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="internship.internship_title"
                                        ref={requiredRefs['internship.internship_title']}
                                        value={formData.internship.internship_title}
                                        onChange={handleFormChange}
                                        placeholder="Enter internship title"
                                    />
                                    {missingFields['internship.internship_title'] && (
                                        <div className="required-message">This is a required field</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="internship.internship_description">
                                        Internship Description
                                        <span className="required-asterisk">*</span>
                                    </label>
                                    <textarea
                                        name="internship.internship_description"
                                        ref={requiredRefs['internship.internship_description']}
                                        value={formData.internship.internship_description}
                                        onChange={handleFormChange}
                                        placeholder="Describe the internship responsibilities"
                                    />
                                    {missingFields['internship.internship_description'] && (
                                        <div className="required-message">This is a required field</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="internship.duration.start_date">
                                        Internship Start Date
                                        <span className="required-asterisk">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="internship.duration.start_date"
                                        ref={requiredRefs['internship.duration.start_date']}
                                        value={formData.internship.duration.start_date}
                                        onChange={handleFormChange}
                                    />
                                    {missingFields['internship.duration.start_date'] && (
                                        <div className="required-message">This is a required field</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="internship.duration.end_date">
                                        Internship End Date
                                        <span className="required-asterisk">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="internship.duration.end_date"
                                        ref={requiredRefs['internship.duration.end_date']}
                                        value={formData.internship.duration.end_date}
                                        onChange={handleFormChange}
                                    />
                                    {missingFields['internship.duration.end_date'] && (
                                        <div className="required-message">This is a required field</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="internship.type_of_employment">
                                        Type of Employment
                                        <span className="required-asterisk">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="internship.type_of_employment"
                                        ref={requiredRefs['internship.type_of_employment']}
                                        value={formData.internship.type_of_employment}
                                        onChange={handleFormChange}
                                        placeholder="Enter type of employment"
                                    />
                                    {missingFields['internship.type_of_employment'] && (
                                        <div className="required-message">This is a required field</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="internship.remote_on_site">
                                        Remote/On-site/Hybrid
                                        <span className="required-asterisk">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="internship.remote_on_site"
                                        ref={requiredRefs['internship.remote_on_site']}
                                        value={formData.internship.remote_on_site}
                                        onChange={handleFormChange}
                                        placeholder="Enter work model"
                                    />
                                    {missingFields['internship.remote_on_site'] && (
                                        <div className="required-message">This is a required field</div>
                                    )}
                                </div>

                                <h3>Eligibility Criteria for Internship</h3>
                                <div className="form-group">
                                    <label htmlFor="internship.eligibility_criteria.required_qualifications">
                                        Required Qualifications
                                        <span className="required-asterisk">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="internship.eligibility_criteria.required_qualifications"
                                        ref={requiredRefs['internship.eligibility_criteria.required_qualifications']}
                                        value={formData.internship.eligibility_criteria.required_qualifications}
                                        onChange={handleFormChange}
                                        placeholder="Enter required qualifications"
                                    />
                                    {missingFields['internship.eligibility_criteria.required_qualifications'] && (
                                        <div className="required-message">This is a required field</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="internship.eligibility_criteria.skill_requirements">
                                        Skill Requirements
                                        <span className="required-asterisk">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="internship.eligibility_criteria.skill_requirements"
                                        ref={requiredRefs['internship.eligibility_criteria.skill_requirements']}
                                        value={formData.internship.eligibility_criteria.skill_requirements}
                                        onChange={handleFormChange}
                                        placeholder="Enter skill requirements"
                                    />
                                    {missingFields['internship.eligibility_criteria.skill_requirements'] && (
                                        <div className="required-message">This is a required field</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="internship.eligibility_criteria.batch_year_of_study">
                                        Batch Year of Study
                                        <span className="required-asterisk">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="internship.eligibility_criteria.batch_year_of_study"
                                        ref={requiredRefs['internship.eligibility_criteria.batch_year_of_study']}
                                        value={formData.internship.eligibility_criteria.batch_year_of_study}
                                        onChange={handleFormChange}
                                        placeholder="Enter eligible batch year(s)"
                                    />
                                    {missingFields['internship.eligibility_criteria.batch_year_of_study'] && (
                                        <div className="required-message">This is a required field</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="internship.eligibility_criteria.minimum_cgpa_grade">
                                        Minimum CGPA/Grade
                                        <span className="required-asterisk">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="internship.eligibility_criteria.minimum_cgpa_grade"
                                        ref={requiredRefs['internship.eligibility_criteria.minimum_cgpa_grade']}
                                        value={formData.internship.eligibility_criteria.minimum_cgpa_grade}
                                        onChange={handleFormChange}
                                        placeholder="Enter minimum CGPA or grade"
                                    />
                                    {missingFields['internship.eligibility_criteria.minimum_cgpa_grade'] && (
                                        <div className="required-message">This is a required field</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="internship.eligibility_criteria.other_criteria">
                                        Other Criteria
                                    </label>
                                    <input
                                        type="text"
                                        name="internship.eligibility_criteria.other_criteria"
                                        value={formData.internship.eligibility_criteria.other_criteria}
                                        onChange={handleFormChange}
                                        placeholder="Enter any other criteria"
                                    />
                                </div>

                                <h3>CTC and Breakup for Internship</h3>
                                <div className="form-group">
                                    <label htmlFor="internship.ctcAndBreakup.stipend">
                                        Stipend
                                        <span className="required-asterisk">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="internship.ctcAndBreakup.stipend"
                                        ref={requiredRefs['internship.ctcAndBreakup.stipend']}
                                        value={formData.internship.ctcAndBreakup.stipend}
                                        onChange={handleFormChange}
                                        placeholder="Enter stipend amount"
                                    />
                                    {missingFields['internship.ctcAndBreakup.stipend'] && (
                                        <div className="required-message">This is a required field</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="internship.ctcAndBreakup.bonus">
                                        Bonus/Incentives
                                    </label>
                                    <input
                                        type="text"
                                        name="internship.ctcAndBreakup.bonus"
                                        value={formData.internship.ctcAndBreakup.bonus}
                                        onChange={handleFormChange}
                                        placeholder="Enter bonus or incentives"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="internship.ctcAndBreakup.additional_benefits">
                                        Additional Benefits
                                    </label>
                                    <input
                                        type="text"
                                        name="internship.ctcAndBreakup.additional_benefits"
                                        value={formData.internship.ctcAndBreakup.additional_benefits}
                                        onChange={handleFormChange}
                                        placeholder="Enter any additional benefits"
                                    />
                                </div>
                            </>
                        )}

                        <button type="submit">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RecruiterPage;