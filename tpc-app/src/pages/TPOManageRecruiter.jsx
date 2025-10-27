import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "../styles/ManageRecruiter.css";

const ManageRecruiter = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const auth = firebase.auth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setLoggedInUser(user ? user.uid : null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRecruiters = async () => {
      const snapshot = await firebase.database().ref("Recruiters").once("value");
      const data = snapshot.val();
      const recruiterArray = data
        ? Object.entries(data).map(([key, value]) => ({ key, ...value }))
        : [];
      setRecruiters(recruiterArray);
    };
    fetchRecruiters();
  }, []);

  // Helper: normalize internship object (if multiple internships stored as children, pick first)
  const getPrimaryInternship = (internship) => {
    if (!internship) return null;
    if (typeof internship !== "object") return null;
    const keys = Object.keys(internship);
    if (keys.length === 0) return null;
    // If the object itself contains fields like internship_title, treat as single
    if (internship.internship_title || internship.internship_description) return internship;
    // Otherwise assume it's a map of multiple internships; return the first entry
    const first = internship[keys[0]];
    return first || null;
  };

  // Helper: extract postings (placements) from a recruiter. Supports both single placement or multiple child placements.
  const extractPostings = (recruiter) => {
    const results = [];
    const placement = recruiter?.placement;
    const internship = getPrimaryInternship(recruiter?.internship);

    if (placement && typeof placement === "object") {
      const placementKeys = Object.keys(placement);
      // If placement object itself looks like a posting (has job_title), treat as single
      if (placement.job_title || placement.job_desc || placement.jobLocation) {
        results.push({ postingKey: null, placement, internship });
      } else {
        // Treat each child as a posting
        placementKeys.forEach((pKey) => {
          const p = placement[pKey] || {};
          results.push({ postingKey: pKey, placement: p, internship });
        });
      }
    } else if (placement) {
      // primitive or other value -> push as single
      results.push({ postingKey: null, placement: placement || {}, internship });
    } else {
      // No placement defined at top-level. Some DB shapes store postings as top-level
      // children using timestamp keys (e.g. 1757747496). Detect those and treat them as postings.
      const knownMeta = new Set([
        "company_name",
        "companyContact",
        "alternateContact",
        "company_overview",
        "industry_sector",
        "website",
        "postRecruitmentStatus",
        "appliedstudents",
        "isBlacklisted",
        "key",
        "_postingContext",
      ]);

      const topKeys = Object.keys(recruiter || {});
      let found = false;
      topKeys.forEach((k) => {
        if (knownMeta.has(k)) return;
        const v = recruiter[k];
        // Heuristic: timestamp-ish keys are numeric or long strings and their value is an object
        if (v && typeof v === "object") {
          // If child contains placement or internship or job fields, treat as posting
          const child = v;
          if (
            child.placement ||
            child.internship ||
            child.job_title ||
            child.internship_title ||
            child.jobLocation ||
            child.job_desc
          ) {
            found = true;
            const childPlacement = child.placement || (child.job_title || child.job_desc ? child : null);
            const childInternship = getPrimaryInternship(child.internship || (child.internship_title ? child : null));
            results.push({ postingKey: k, placement: childPlacement || {}, internship: childInternship });
          }
        }
      });

      if (!found) {
        // Fallback: include a single empty posting so recruiter still shows
        results.push({ postingKey: null, placement: {}, internship });
      }
    }

    return results;
  };

  const handleRowClick = (recruiter, postingContext = null) => {
    // store the recruiter and the specific posting selected so popup can show posting details
    setSelectedRecruiter({ ...recruiter, _postingContext: postingContext });
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedRecruiter(null);
  };

  const handleBlacklistCompany = (recruiterKey, companyName) => {
    if (!loggedInUser) {
      alert("No logged-in user.");
      return;
    }

    firebase.database().ref(`Recruiters/${recruiterKey}`).update({
      isBlacklisted: true
    }).then(() => {
      console.log(`${companyName} has been blacklisted.`);
      setRecruiters((prevRecruiters) => 
        prevRecruiters.map(recruiter => 
          recruiter.key === recruiterKey ? { ...recruiter, isBlacklisted: true } : recruiter
        )
      );
    });
  };

  const handlePostToStudentPage = (recruiterKey, companyName) => {
    if (!loggedInUser) {
      alert("No logged-in user.");
      return;
    }

    firebase.database().ref(`Recruiters/${recruiterKey}`).update({
      postRecruitmentStatus: true
    }).then(() => {
      console.log(`${companyName} details posted to student page.`);
      setRecruiters((prevRecruiters) => 
        prevRecruiters.map(recruiter => 
          recruiter.key === recruiterKey ? { ...recruiter, postRecruitmentStatus: true } : recruiter
        )
      );
    });
  };

  // Build a flat list of postings with recruiter context
  const postingsWithRecruiter = recruiters.flatMap((recruiter) =>
    extractPostings(recruiter).map(({ postingKey, placement, internship }) => ({
      recruiter,
      postingKey,
      placement: placement || {},
      internship: internship || {},
    }))
  );

  const internshipPostings = postingsWithRecruiter.filter(
    (p) => p.internship && (p.internship.internship_title || p.internship.internship_description)
  );

  const placementPostings = postingsWithRecruiter.filter(
    (p) => p.placement && (p.placement.job_title || p.placement.job_desc)
  );

  return (
    <div className="tpo-container">
      <div className="recruiter-section">
        <h2>Internship Postings</h2>
        <table className="recruiter-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Internship Title</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Stipend</th>
              <th>Work Model</th>
              <th>Eligibility (brief)</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {internshipPostings.length === 0 && (
              <tr><td colSpan={9}>No internship postings available.</td></tr>
            )}
            {internshipPostings.map(({ recruiter, postingKey, internship }, idx) => {
              const key = `${recruiter.key}-intern-${postingKey ?? idx}`;
              const duration = internship?.duration ? `${internship.duration.start_date || 'N/A'} → ${internship.duration.end_date || 'N/A'}` : 'N/A';
              const stipend = internship?.ctcAndBreakup?.stipend || 'N/A';
              const eligibility = internship?.eligibility_criteria ? (
                `${internship.eligibility_criteria.required_qualifications || ''}${internship.eligibility_criteria.minimum_cgpa_grade ? ' • CGPA: ' + internship.eligibility_criteria.minimum_cgpa_grade : ''}`
              ) : 'N/A';
              return (
                <tr key={key} onClick={() => handleRowClick(recruiter, { postingKey, internship, placement: {} })}>
                  <td>{recruiter.company_name || 'N/A'}</td>
                  <td>{internship.internship_title || 'N/A'}</td>
                  <td style={{ maxWidth: 300 }}>{internship.internship_description || 'N/A'}</td>
                  <td>{duration}</td>
                  <td>{stipend}</td>
                  <td>{internship.remote_on_site || internship.type_of_employment || 'N/A'}</td>
                  <td style={{ maxWidth: 240 }}>{eligibility}</td>
                  <td>{recruiter.companyContact || recruiter.alternateContact || 'N/A'}</td>
                  <td>
                    <button className="action-button blacklist-btn" onClick={(e) => { e.stopPropagation(); handleBlacklistCompany(recruiter.key, recruiter.company_name); }}>Blacklist</button>
                    <button className="action-button post-btn" onClick={(e) => { e.stopPropagation(); handlePostToStudentPage(recruiter.key, recruiter.company_name); }}>Post</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h2 style={{ marginTop: '2rem' }}>PPO / Placement Postings</h2>
        <table className="recruiter-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Job Title</th>
              <th>Job Description</th>
              <th>Location</th>
              <th>CTC</th>
              <th>Work Model</th>
              <th>Eligibility (brief)</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {placementPostings.length === 0 && (
              <tr><td colSpan={9}>No placement postings available.</td></tr>
            )}
            {placementPostings.map(({ recruiter, postingKey, placement }, idx) => {
              const key = `${recruiter.key}-ppo-${postingKey ?? idx}`;
              const ctc = placement?.ctcAndBreakup?.salary || placement?.ctc || 'N/A';
              const eligibility = placement?.eligibility_criteria ? (
                `${placement.eligibility_criteria.required_qualifications || ''}${placement.eligibility_criteria.minimum_cgpa_grade ? ' • CGPA: ' + placement.eligibility_criteria.minimum_cgpa_grade : ''}`
              ) : 'N/A';
              return (
                <tr key={key} onClick={() => handleRowClick(recruiter, { postingKey, placement, internship: {} })}>
                  <td>{recruiter.company_name || 'N/A'}</td>
                  <td>{placement.job_title || placement.jobTitle || 'N/A'}</td>
                  <td style={{ maxWidth: 300 }}>{placement.job_desc || placement.jobDescription || 'N/A'}</td>
                  <td>{placement.jobLocation || placement.job_location || 'N/A'}</td>
                  <td>{ctc}</td>
                  <td>{placement.remote_on_site || placement.type_of_employment || 'N/A'}</td>
                  <td style={{ maxWidth: 240 }}>{eligibility}</td>
                  <td>{recruiter.companyContact || recruiter.alternateContact || 'N/A'}</td>
                  <td>
                    <button className="action-button blacklist-btn" onClick={(e) => { e.stopPropagation(); handleBlacklistCompany(recruiter.key, recruiter.company_name); }}>Blacklist</button>
                    <button className="action-button post-btn" onClick={(e) => { e.stopPropagation(); handlePostToStudentPage(recruiter.key, recruiter.company_name); }}>Post</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showPopup && selectedRecruiter && (
        <div className="popup">
          <div className="popup-content">
            <button className="close-btn" onClick={handleClosePopup}>X</button>
            <h3>Company Details</h3>
            <p><strong>Company Name:</strong> {selectedRecruiter.company_name}</p>
            <p><strong>Internship Title:</strong> {selectedRecruiter._postingContext?.internship?.internship_title || selectedRecruiter._postingContext?.placement?.internship_title || selectedRecruiter.internship?.internship_title || 'N/A'}</p>
            <p><strong>Internship Description:</strong> {selectedRecruiter._postingContext?.internship?.internship_description || selectedRecruiter._postingContext?.placement?.internship_description || selectedRecruiter.internship?.internship_description || 'N/A'}</p>
            <p><strong>Remote/On-Site:</strong> {selectedRecruiter._postingContext?.placement?.remote_on_site || selectedRecruiter._postingContext?.internship?.remote_on_site || selectedRecruiter.internship?.remote_on_site || 'N/A'}</p>
            <p><strong>Type of Employment:</strong> {selectedRecruiter._postingContext?.placement?.type_of_employment || selectedRecruiter._postingContext?.internship?.type_of_employment || selectedRecruiter.internship?.type_of_employment || 'N/A'}</p>
            <p><strong>Job Title:</strong> {selectedRecruiter._postingContext?.placement?.job_title || selectedRecruiter._postingContext?.placement?.jobTitle || selectedRecruiter.placement?.job_title || 'N/A'}</p>
            <p><strong>Job Location:</strong> {selectedRecruiter._postingContext?.placement?.jobLocation || selectedRecruiter._postingContext?.placement?.job_location || selectedRecruiter.placement?.jobLocation || 'N/A'}</p>
            <p><strong>Job Description:</strong> {selectedRecruiter._postingContext?.placement?.job_desc || selectedRecruiter._postingContext?.placement?.jobDescription || selectedRecruiter.placement?.job_desc || 'N/A'}</p>
            <p><strong>Eligibility Criteria:</strong> {selectedRecruiter._postingContext?.internship?.eligibility_criteria?.required_qualifications || selectedRecruiter.internship?.eligibility_criteria?.required_qualifications || 'N/A'}</p>
            <p><strong>Additional Benefits:</strong> {selectedRecruiter._postingContext?.internship?.ctcAndBreakup?.additional_benefits || selectedRecruiter.internship?.ctcAndBreakup?.additional_benefits || 'N/A'}</p>
            <p><strong>Selection Process:</strong> {(selectedRecruiter._postingContext?.placement?.selection_process?.recruitment_stages || selectedRecruiter.placement?.selection_process?.recruitment_stages)?.join(', ') || 'N/A'}</p>
            <p><strong>Website:</strong> <a href={selectedRecruiter.website || '#'} target="_blank" rel="noreferrer">{selectedRecruiter.website || 'N/A'}</a></p>
            <p><strong>Contact:</strong> {selectedRecruiter.companyContact || selectedRecruiter.alternateContact || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRecruiter;

