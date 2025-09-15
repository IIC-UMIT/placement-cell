import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import '../styles/RecruiterPage.css';

function RecruiterEditJD({ loggedInUser, jdId }) {
  const defaultPlacement = {
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
        { round: 1, focus: 'Technical/HR' },
      ],
      expected_timeline: '',
    },
  };

  const defaultInternship = {
    internship_title: '',
    internship_description: '',
    duration: { start_date: '', end_date: '' },
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
  };

  const [loading, setLoading] = useState(true);
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
    placement: defaultPlacement,
    internship: defaultInternship,
  });
  const [isInternshipEnabled, setIsInternshipEnabled] = useState(false);

  // 🔹 Load JD Data from Firebase
  useEffect(() => {
    const fetchJD = async () => {
      try {
        const snapshot = await firebase
          .database()
          .ref(`Recruiters/${loggedInUser}/${jdId}`)
          .once('value');

        if (snapshot.exists()) {
          const data = snapshot.val();

          setCompanyDetails({
            company_name: data.company_name || '',
            industry_sector: data.industry_sector || '',
            company_overview: data.company_overview || '',
            website: data.website || '',
            locations: data.locations || [{ location_name: '', address: '' }],
            companyContact: data.companyContact || '',
            alternateContact: data.alternateContact || '',
          });

          setFormData({
            placement: { ...defaultPlacement, ...(data.placement || {}) },
            internship: { ...defaultInternship, ...(data.internship || {}) },
          });

          if (data.internship) setIsInternshipEnabled(true);
        }
      } catch (error) {
        console.error('Error loading JD:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJD();
  }, [loggedInUser, jdId]);

  // 🔹 Handle changes
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    setFormData((prev) => {
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  // 🔹 Submit Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await firebase
        .database()
        .ref(`Recruiters/${loggedInUser}/${jdId}`)
        .update({
          ...companyDetails,
          placement: formData.placement,
          ...(isInternshipEnabled && { internship: formData.internship }),
        });

      alert('JD updated successfully!');
    } catch (error) {
      console.error('Error updating JD:', error);
      alert('Failed to update. Try again.');
    }
  };

  if (loading) return <div>Loading JD...</div>;

  return (
    <div className="recruiter-container">
      <h2>Edit Job Description</h2>
      <form onSubmit={handleSubmit}>
        {/* Company Details */}
        <h3>Company Details</h3>
        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="company_name"
            value={companyDetails?.company_name || ''}
            onChange={handleCompanyChange}
          />
        </div>
        <div className="form-group">
          <label>Industry Sector</label>
          <input
            type="text"
            name="industry_sector"
            value={companyDetails?.industry_sector || ''}
            onChange={handleCompanyChange}
          />
        </div>
        <div className="form-group">
          <label>Company Overview</label>
          <textarea
            name="company_overview"
            value={companyDetails?.company_overview || ''}
            onChange={handleCompanyChange}
          />
        </div>
        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            name="website"
            value={companyDetails?.website || ''}
            onChange={handleCompanyChange}
          />
        </div>
        <div className="form-group">
          <label>Company Contact</label>
          <input
            type="text"
            name="companyContact"
            value={companyDetails?.companyContact || ''}
            onChange={handleCompanyChange}
          />
        </div>
        <div className="form-group">
          <label>Alternate Contact</label>
          <input
            type="text"
            name="alternateContact"
            value={companyDetails?.alternateContact || ''}
            onChange={handleCompanyChange}
          />
        </div>

        {/* Placement Details */}
        <h3>Placement Details</h3>
        <input
          type="text"
          name="placement.job_title"
          value={formData.placement?.job_title || ''}
          onChange={handleFormChange}
        />

        <input
          type="text"
          name="placement.job_desc"
          value={formData.placement?.job_desc || ''}
          onChange={handleFormChange}
        />

        <div className="form-group">
          <label>Type of Employment</label>
          <input
            type="text"
            name="placement.type_of_employment"
            value={formData.placement?.type_of_employment || ''}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-group">
          <label>No. of Expected Hires</label>
          <input
            type="number"
            name="placement.noOfExpectedHires"
            value={formData.placement?.noOfExpectedHires || ''}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-group">
          <label>Job Location</label>
          <input
            type="text"
            name="placement.jobLocation"
            value={formData.placement?.jobLocation || ''}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-group">
          <label>Remote/On-site/Hybrid</label>
          <input
            type="text"
            name="placement.remote_on_site"
            value={formData.placement?.remote_on_site || ''}
            onChange={handleFormChange}
          />
        </div>

        {/* Placement Eligibility */}
        <h3>Eligibility Criteria (Placement)</h3>
        <div className="form-group">
          <label>Required Qualifications</label>
          <input
            type="text"
            name="placement.eligibility_criteria.required_qualifications"
            value={formData.placement?.eligibility_criteria?.required_qualifications || ''}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-group">
          <label>Skill Requirements</label>
          <input
            type="text"
            name="placement.eligibility_criteria.skill_requirements"
            value={formData.placement?.eligibility_criteria?.skill_requirements || ''}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-group">
          <label>Batch Year of Study</label>
          <input
            type="text"
            name="placement.eligibility_criteria.batch_year_of_study"
            value={formData.placement?.eligibility_criteria?.batch_year_of_study || ''}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-group">
          <label>Minimum CGPA/Grade</label>
          <input
            type="text"
            name="placement.eligibility_criteria.minimum_cgpa_grade"
            value={formData.placement?.eligibility_criteria?.minimum_cgpa_grade || ''}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-group">
          <label>Other Criteria</label>
          <input
            type="text"
            name="placement.eligibility_criteria.other_criteria"
            value={formData.placement?.eligibility_criteria?.other_criteria || ''}
            onChange={handleFormChange}
          />
        </div>

        {/* Placement CTC */}
        <h3>CTC & Breakup (Placement)</h3>
        <div className="form-group">
          <label>Salary</label>
          <input
            type="text"
            name="placement.ctcAndBreakup.salary"
            value={formData.placement?.ctcAndBreakup?.salary || ''}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-group">
          <label>Bonus</label>
          <input
            type="text"
            name="placement.ctcAndBreakup.bonus"
            value={formData.placement?.ctcAndBreakup?.bonus || ''}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-group">
          <label>Additional Benefits</label>
          <input
            type="text"
            name="placement.ctcAndBreakup.additional_benefits"
            value={formData.placement?.ctcAndBreakup?.additional_benefits || ''}
            onChange={handleFormChange}
          />
        </div>

        {/* Placement Selection Process */}
        <h3>Selection Process (Placement)</h3>
        <div className="form-group">
          <label>Assessment Details</label>
          <input
            type="text"
            name="placement.selection_process.assessment_details"
            value={formData.placement?.selection_process?.assessment_details || ''}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-group">
          <label>Expected Timeline</label>
          <input
            type="text"
            name="placement.selection_process.expected_timeline"
            value={formData.placement?.selection_process?.expected_timeline || ''}
            onChange={handleFormChange}
          />
        </div>

        {/* Internship Toggle */}
        <div className="form-group">
          <input
            type="checkbox"
            checked={isInternshipEnabled}
            onChange={() => setIsInternshipEnabled(!isInternshipEnabled)}
          />
          <label>Include Internship</label>
        </div>

        {isInternshipEnabled && (
          <>
            <h3>Internship Details</h3>
            <div className="form-group">
              <label>Internship Title</label>
              <input
                type="text"
                name="internship.internship_title"
                value={formData.internship?.internship_title || ''}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label>Internship Description</label>
              <textarea
                name="internship.internship_description"
                value={formData.internship?.internship_description || ''}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="internship.duration.start_date"
                value={formData.internship?.duration?.start_date || ''}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="internship.duration.end_date"
                value={formData.internship?.duration?.end_date || ''}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label>Type of Employment</label>
              <input
                type="text"
                name="internship.type_of_employment"
                value={formData.internship?.type_of_employment || ''}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label>Remote/On-site</label>
              <input
                type="text"
                name="internship.remote_on_site"
                value={formData.internship?.remote_on_site || ''}
                onChange={handleFormChange}
              />
            </div>

            {/* Internship Eligibility */}
            <h3>Eligibility Criteria (Internship)</h3>
            <div className="form-group">
              <label>Required Qualifications</label>
              <input
                type="text"
                name="internship.eligibility_criteria.required_qualifications"
                value={formData.internship?.eligibility_criteria?.required_qualifications || ''}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label>Skill Requirements</label>
              <input
                type="text"
                name="internship.eligibility_criteria.skill_requirements"
                value={formData.internship?.eligibility_criteria?.skill_requirements || ''}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label>Batch Year of Study</label>
              <input
                type="text"
                name="internship.eligibility_criteria.batch_year_of_study"
                value={formData.internship?.eligibility_criteria?.batch_year_of_study || ''}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label>Minimum CGPA/Grade</label>
              <input
                type="text"
                name="internship.eligibility_criteria.minimum_cgpa_grade"
                value={formData.internship?.eligibility_criteria?.minimum_cgpa_grade || ''}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label>Other Criteria</label>
              <input
                type="text"
                name="internship.eligibility_criteria.other_criteria"
                value={formData.internship?.eligibility_criteria?.other_criteria || ''}
                onChange={handleFormChange}
              />
            </div>

            {/* Internship CTC */}
            <h3>CTC & Breakup (Internship)</h3>
            <div className="form-group">
              <label>Stipend</label>
              <input
                type="text"
                name="internship.ctcAndBreakup.stipend"
                value={formData.internship?.ctcAndBreakup?.stipend || ''}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label>Bonus</label>
              <input
                type="text"
                name="internship.ctcAndBreakup.bonus"
                value={formData.internship?.ctcAndBreakup?.bonus || ''}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label>Additional Benefits</label>
              <input
                type="text"
                name="internship.ctcAndBreakup.additional_benefits"
                value={formData.internship?.ctcAndBreakup?.additional_benefits || ''}
                onChange={handleFormChange}
              />
            </div>
          </>
        )}

        <button type="submit">Update JD</button>
      </form>
    </div>
  );
}

export default RecruiterEditJD;
