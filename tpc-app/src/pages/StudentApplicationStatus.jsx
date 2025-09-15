import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "../styles/StudentApplicationStatus.css";

const ApplicationStatus = () => {
    const [applications, setApplications] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        const user = firebase.auth().currentUser;
        if (user) {
            setLoggedInUser(user.uid);

            // Fetch student profile
            firebase
                .database()
                .ref(`users/Student/${user.uid}`)
                .once("value")
                .then((snap) => {
                    const { branch, graduationYear } = snap.val() || {};
                    if (!branch || !graduationYear) return;

                    // Fetch applications
                    firebase
                        .database()
                        .ref(`Students/${graduationYear}/${branch}/${user.uid}/applications`)
                        .on("value", (snapshot) => {
                            const data = snapshot.val() || {};
                            setApplications(Object.entries(data).map(([id, val]) => ({ jd_id: id, ...val })));
                        });
                });
        }
    }, []);

    const handleOfferDecision = (jd_id, decision) => {
        if (!loggedInUser) return;

        firebase
            .database()
            .ref(`Students`)
            .once("value")
            .then((snap) => {
                const all = snap.val();
                // Find branch/year path
                let path = "";
                Object.keys(all).forEach((year) => {
                    Object.keys(all[year]).forEach((br) => {
                        if (all[year][br][loggedInUser]) {
                            path = `Students/${year}/${br}/${loggedInUser}/applications/${jd_id}`;
                        }
                    });
                });

                if (path) {
                    firebase
                        .database()
                        .ref(`${path}/offer`)
                        .update({
                            accepted: decision === "accept",
                            declined: decision === "decline",
                        });
                }
            });
    };

    return (
        <div className="application-status-container">
            <h2>Your Applications</h2>
            {applications.length === 0 && <p>No applications yet.</p>}
            {applications.map((app) => (
                <div key={app.jd_id} className="status-card">
                    <h3>{app.company}</h3>
                    <p><b>Job Title:</b> {app.jobTitle}</p>
                    <p><b>Current Status:</b> {app.status}</p>
                    <p><b>Interview Status:</b> {app.interviewStatus}</p>
                    <p><b>OA Invite Sent:</b> {app.oaInviteSent ? "Yes" : "No"}</p>

                    {/* Offer Section */}
                    {app.offer?.isActive && (
                        <div className="offer-section">
                            <p><b>Offer Received!</b></p>
                            {!app.offer.accepted && !app.offer.declined ? (
                                <>
                                    <button onClick={() => handleOfferDecision(app.jd_id, "accept")}>
                                        Accept
                                    </button>
                                    <button onClick={() => handleOfferDecision(app.jd_id, "decline")}>
                                        Decline
                                    </button>
                                </>
                            ) : app.offer.accepted ? (
                                <p className="accepted">You have accepted the offer ✅</p>
                            ) : (
                                <p className="declined">You have declined the offer ❌</p>
                            )}
                        </div>
                    )}

                    {/* Timeline */}
                    <h4>Timeline:</h4>
                    <ul>
                        {app.timeline?.map((t, idx) => (
                            <li key={idx}>{t.stage} — {t.date}</li>
                        ))}
                    </ul>

                    <p>
                        <b>Current Status:</b>{" "}
                        <span
                            className={`status-badge ${app.status?.toLowerCase().includes("reject")
                                    ? "status-rejected"
                                    : app.status?.toLowerCase().includes("select")
                                        ? "status-selected"
                                        : "status-pending"
                                }`}
                        >
                            {app.status || "Pending"}
                        </span>
                    </p>

                </div>
            ))}
        </div>
    );
};

export default ApplicationStatus;
