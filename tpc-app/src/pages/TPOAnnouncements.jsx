import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "../styles/TPOPage.css";

const Announcements = () => {
  const [announcement, setAnnouncement] = useState("");
  const [announcementsList, setAnnouncementsList] = useState([]);

  useEffect(() => {
    const ref = firebase.database().ref("Announcements");

    // fetch data in realtime
    ref.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object into array and sort by ID (timestamp)
        const announcementsArray = Object.keys(data)
          .map((key) => ({
            id: key,
            announcementText: data[key].announcementText,
            createdOn: data[key].createdOn,
          }))
          .sort((a, b) => b.id - a.id); // latest first

        setAnnouncementsList(announcementsArray);
      } else {
        setAnnouncementsList([]);
      }
    });

    return () => ref.off(); // cleanup listener
  }, []);

  const handleUploadAnnouncement = () => {
    if (!announcement.trim()) {
      alert("Please write an announcement before posting!");
      return;
    }

    const announcementId = new Date().getTime(); // timestamp as key
    firebase
      .database()
      .ref(`Announcements/${announcementId}`)
      .set({
        announcementText: announcement,
        createdOn: new Date().toISOString(),
      })
      .then(() => {
        alert("Announcement Uploaded!");
        setAnnouncement("");
      })
      .catch((error) => {
        console.error("Error uploading announcement:", error);
      });
  };

  const handleDeleteAnnouncement = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      firebase
        .database()
        .ref(`Announcements/${id}`)
        .remove()
        .then(() => {
          alert("Announcement Deleted!");
        })
        .catch((error) => {
          console.error("Error deleting announcement:", error);
        });
    }
  };

  return (
    <div className="announcements-container">
      <div className="post-announcement">
      <h3>Post Announcement</h3>
      <textarea
        value={announcement}
        onChange={(e) => setAnnouncement(e.target.value)}
        placeholder="Write an announcement here..."
      />
      <button className="post-announcement" onClick={handleUploadAnnouncement}>Post Announcement</button>
    </div>
      <h3>All Announcements</h3>
      <table className="announcement-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Announcement</th>
            <th>Created On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcementsList.length > 0 ? (
            announcementsList.map(({ id, announcementText, createdOn }, index) => (
              <tr key={id}>
                <td>{index + 1}</td>
                <td>{announcementText}</td>
                <td>{new Date(createdOn).toLocaleString()}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDeleteAnnouncement(id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No announcements available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Announcements;
