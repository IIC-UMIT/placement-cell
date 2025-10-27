import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/storage';
import '../styles/RecruiterPage.css';

// Stable defaults moved to module scope so hooks can depend on them safely
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
    // Provide recruiter-friendly defaults; they can add/remove/update these
    recruitment_stages: [
      'OA',
      'Technical',
      'HR',
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

function RecruiterEditJD() {
  const { jd_id } = useParams();
  const loggedInUser = firebase.auth().currentUser?.uid;

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
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [existingLogoUrl, setExistingLogoUrl] = useState('');
  const [jdPdfFile, setJdPdfFile] = useState(null);
  const [existingJdPdfUrl, setExistingJdPdfUrl] = useState('');

  // 🔹 Load JD Data from Firebase
  useEffect(() => {
    const fetchJD = async () => {
      try {
        if (!loggedInUser || !jd_id) return;
        const snapshot = await firebase
          .database()
          .ref(`Recruiters/${loggedInUser}/${jd_id}`)
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

          // Load file urls if present
          if (data.company_logo_url) setExistingLogoUrl(data.company_logo_url);
          if (data.jd_pdf_url) setExistingJdPdfUrl(data.jd_pdf_url);

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
  }, [loggedInUser, jd_id]);

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

  // Recruitment stages handlers (placement selection process)
  const updateStage = (index, value) => {
    setFormData(prev => {
      const updated = { ...prev };
      const stages = Array.isArray(updated.placement.selection_process.recruitment_stages)
        ? [...updated.placement.selection_process.recruitment_stages]
        : [];
      stages[index] = value;
      updated.placement.selection_process.recruitment_stages = stages;
      return updated;
    });
  };
  const addStage = () => {
    setFormData(prev => {
      const updated = { ...prev };
      const stages = Array.isArray(updated.placement.selection_process.recruitment_stages)
        ? [...updated.placement.selection_process.recruitment_stages]
        : [];
      stages.push('');
      updated.placement.selection_process.recruitment_stages = stages;
      return updated;
    });
  };
  const removeStage = (index) => {
    setFormData(prev => {
      const updated = { ...prev };
      const stages = Array.isArray(updated.placement.selection_process.recruitment_stages)
        ? [...updated.placement.selection_process.recruitment_stages]
        : [];
      stages.splice(index, 1);
      updated.placement.selection_process.recruitment_stages = stages;
      return updated;
    });
  };

  // File inputs
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // validate image
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file for company logo.');
      return;
    }
    if (file.size > 1024 * 1024 * 2) { // 2MB
      alert('Logo must be smaller than 2MB.');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file for the JD.');
      return;
    }
    if (file.size > 1024 * 1024 * 5) { // 5MB
      alert('JD PDF must be smaller than 5MB.');
      return;
    }
    setJdPdfFile(file);
  };

  // 🔹 Submit Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!loggedInUser || !jd_id) {
        alert('User or JD missing.');
        return;
      }

      // upload files first (if any)
      const updates = {};
      if (logoFile) {
        const storageRef = firebase.storage().ref();
        const path = `recruiter_logos/${loggedInUser}/${jd_id}/${logoFile.name}`;
        const snap = await storageRef.child(path).put(logoFile);
        const url = await snap.ref.getDownloadURL();
        updates.company_logo_url = url;
      }
      if (jdPdfFile) {
        const storageRef = firebase.storage().ref();
        const path = `recruiter_jds/${loggedInUser}/${jd_id}/${jdPdfFile.name}`;
        const snap = await storageRef.child(path).put(jdPdfFile);
        const url = await snap.ref.getDownloadURL();
        updates.jd_pdf_url = url;
      }

      await firebase
        .database()
        .ref(`Recruiters/${loggedInUser}/${jd_id}`)
        .update({
          ...companyDetails,
          placement: formData.placement,
          ...(isInternshipEnabled && { internship: formData.internship }),
          ...updates,
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
            <label>Recruitment Stages</label>
            {Array.isArray(formData.placement.selection_process.recruitment_stages) &&
              formData.placement.selection_process.recruitment_stages.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <input
                    type="text"
                    value={s}
                    onChange={(e) => updateStage(idx, e.target.value)}
                    placeholder={`Stage ${idx + 1}`}
                  />
                  <button type="button" onClick={() => removeStage(idx)}>Remove</button>
                </div>
              ))}
            <div>
              <button type="button" onClick={addStage}>Add Stage</button>
            </div>
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

          {/* File uploads */}
          <h3>Files</h3>
          <div className="form-group">
            <label>Company Logo (image, max 2MB)</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
            {logoPreview && <img src={logoPreview} alt="logo preview" style={{ width: 120, marginTop: 8 }} />}
            {!logoPreview && existingLogoUrl && (
              <div style={{ marginTop: 8 }}>
                <img src={existingLogoUrl} alt="existing logo" style={{ width: 120 }} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Upload JD PDF (PDF, max 5MB)</label>
            <input type="file" accept="application/pdf" onChange={handlePdfChange} />
            {existingJdPdfUrl && (
              <div style={{ marginTop: 8 }}>
                <a href={existingJdPdfUrl} target="_blank" rel="noreferrer">View existing JD PDF</a>
              </div>
            )}
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
