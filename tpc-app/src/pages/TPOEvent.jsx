import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "firebase/compat/storage";
import axios from "axios";
import "../styles/EventDashboard.css"; // Add styling for modal

const EventDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [report, setReport] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    speaker: "",
    createdBy: "Admin",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const eventRef = firebase.database().ref("Events");
      eventRef.on("value", (snapshot) => {
        if (snapshot.exists()) {
          const eventData = snapshot.val();
          const eventList = Object.keys(eventData).map((key) => ({
            id: key,
            ...eventData[key],
          }));
          setEvents(eventList);
        }
      });
      return () => eventRef.off();
    };
    fetchEvents();
  }, []);

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset"); // Replace with actual preset

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/dvy2put4o/image/upload`,
      formData
    );
    return response.data.secure_url;
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    setUploading(true);
    try {
      const eventRef = firebase.database().ref(`Events/${selectedEvent.id}`);
      let updatedImages = selectedEvent.images || [];

      for (const file of imageFiles) {
        const url = await uploadImageToCloudinary(file);
        updatedImages.push(url);
      }

      await eventRef.update({ report, images: updatedImages });
      alert("Event updated successfully!");
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event!");
    } finally {
      setUploading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEditMode(false);
    setReport(event.report || "");
  };

  const handleFileChange = (e) => {
    setImageFiles(e.target.files);
  };

  // const handleUpdateEvent = async () => {
  //   if (!selectedEvent) return;
  //   setUploading(true);
  //   try {
  //     const eventRef = firebase.database().ref(`Events/${selectedEvent.id}`);
  //     let updatedImages = selectedEvent.images || [];
  //     for (const file of imageFiles) {
  //       const storageRef = firebase.storage().ref(`EventImages/${selectedEvent.id}/${file.name}`);
  //       await storageRef.put(file);
  //       const url = await storageRef.getDownloadURL();
  //       updatedImages.push(url);
  //     }
  //     await eventRef.update({ report, images: updatedImages });
  //     alert("Event updated successfully!");
  //     setSelectedEvent(null);
  //   } catch (error) {
  //     console.error("Error updating event:", error);
  //     alert("Failed to update event!");
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const handleCreateEvent = async () => {
    if (!newEvent.name || !newEvent.date || !newEvent.time || !newEvent.venue || !newEvent.speaker) {
      alert("Please fill all fields");
      return;
    }
    const eventId = `${newEvent.date.replace(/-/g, "")}_${newEvent.time.replace(/:/g, "")}`;
    await firebase.database().ref(`Events/${eventId}`).set({
      ...newEvent,
      createdOn: new Date().toLocaleString(),
    });
    alert("Event created successfully!");
    setNewEvent({ name: "", description: "", date: "", time: "", venue: "", speaker: "", createdBy: "Admin" });
  };

  return (
    <div className="admin-tpo-container">
      <h2>Create New Event</h2>
      <div className="event-form">
        <input type="text" placeholder="Event Name" value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} />
        <input type="text" placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
        <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
        <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
        <input type="text" placeholder="Venue" value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} />
        <input type="text" placeholder="Speaker" value={newEvent.speaker} onChange={(e) => setNewEvent({ ...newEvent, speaker: e.target.value })} />
        <input type="text" placeholder="Event Image URL" value={newEvent.eventImage} onChange={(e) => setNewEvent({ ...newEvent, eventImage: e.target.value })} />
        <input type="text" placeholder="Speaker Image URL" value={newEvent.speakerImage} onChange={(e) => setNewEvent({ ...newEvent, speakerImage: e.target.value })} />
        <button onClick={handleCreateEvent}>Create Event</button>
      </div>

      <h2>Events</h2>
      <div className="event-grid">
        {events.map((event) => (
          <div key={event.id} className="events-card" onClick={() => handleSelectEvent(event)}>
            <img src={event.image} alt={event.name} className="event-image" />
            <h3>{event.name}</h3>
            <p>{event.date} at {event.time}</p>
            <p><strong>Venue:</strong> {event.venue}</p>
            <div className="speaker-info">
              {event.speakerImage && <img src={event.speakerImage} alt={event.speaker} className="speaker-image" />}
              <p><strong>Speaker:</strong> {event.speaker}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="event-popup">
          <h2>{selectedEvent.name}</h2>
          <p><strong>Date:</strong> {selectedEvent.date} at {selectedEvent.time}</p>
          <p><strong>Venue:</strong> {selectedEvent.venue}</p>
          <p><strong>Speaker:</strong> {selectedEvent.speaker}</p>
          <p><strong>Report:</strong> {selectedEvent.report || "No report available"}</p>
          <button onClick={() => setEditMode(true)}>Edit Event</button>
          <button onClick={() => setEditMode(false)}>Add Report & Images</button>
          <button onClick={() => setSelectedEvent(null)}>Close</button>
          {editMode ? (
            <div className="edit-section">
              <input type="text" value={selectedEvent.name} onChange={(e) => setSelectedEvent({ ...selectedEvent, name: e.target.value })} />
              <button onClick={handleUpdateEvent}>Save Changes</button>
            </div>
          ) : (
            <div className="report-section">
              <textarea value={report} onChange={(e) => setReport(e.target.value)} />
              <input type="file" multiple accept="image/*" onChange={handleFileChange} />
              <button onClick={handleUpdateEvent} disabled={uploading}>{uploading ? "Uploading..." : "Update Report"}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventDashboard;
