import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDatabase, ref, onValue } from "firebase/database";
import "../styles/Event.css";

const Events = () => {
  const [eventsData, setEventsData] = useState([]);
  const [scrollingImages, setScrollingImages] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const eventsRef = ref(db, "Events");

    onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const eventsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        const images = eventsArray.map((event) => event.image && event.image[0]).filter((img) => img); // Use the first image of each event if defined
        setEventsData(eventsArray);
        setScrollingImages(images);
      } else {
        setEventsData([]);
        setScrollingImages([]);
      }
    });
  }, []);

  const currentDate = new Date();
  const upcomingEvents = eventsData.filter(event => new Date(event.date) > currentDate);
  const conductedEvents = eventsData.filter(event => new Date(event.date) <= currentDate);

  return (
    <div className="events-page">
      <h2 className="events-heading">Events & Trainings</h2>

      {/* Scrolling Section */}
      {scrollingImages.length > 0 && (
        <div className="scrolling-section">
          <motion.div
            className="scrolling-gallery"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            style={{ display: "flex", whiteSpace: "nowrap" }}
          >
            {[...scrollingImages, ...scrollingImages].map((image, index) => (
              <motion.img
                key={index}
                src={image}
                alt="event"
                className="scrolling-image"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                width={300}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Upcoming Events List */}
      <div className="events-list">
        <h3>Upcoming Events</h3>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event, index) => (
            <div key={index} className="event-card">
              <motion.img
                src={event.image && event.image[0]}
                alt={event.name}
                className="event-image"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
              <h3>{event.name}</h3>
              <p>{event.date} | {event.time} | {event.venue}</p>
              <p>{event.description}</p>
              <div className="speaker-info">
                {event.speakerImage && (
                  <motion.img
                    src={event.speakerImage}
                    alt={event.speaker}
                    className="speaker-image"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <p><strong>{event.speaker}</strong> </p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-events">No upcoming events.</p>
        )}
      </div>

      {/* Events Conducted List */}
      <div className="events-list">
        <h3>Events Conducted</h3>
        <div class="d-flex flex-row flex-wrap justify-content-between">
          {conductedEvents.map((event, index) => (
            <div key={index} className="event-card">
              <motion.img
                src={event.image && event.image[0]}
                alt={event.name}
                className="event-image"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
              <h3>{event.name}</h3>
              <p>{event.date} | {event.time} | {event.venue}</p>
              <p>{event.description}</p>
              <div className="speaker-info">
                {event.speakerImage && (
                  <motion.img
                    src={event.speakerImage}
                    alt={event.speaker}
                    className="speaker-image"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <p><strong>{event.speaker}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal
      {selectedEvent && (
        <div className="event-details-modal">
          <div className="modal-content">
            <span className="close-button" onClick={() => setSelectedEvent(null)}>&times;</span>
            <h2>{selectedEvent.name}</h2>
            <p>{selectedEvent.date} | {selectedEvent.time} | {selectedEvent.venue}</p>
            <div className="speaker-info">
              {selectedEvent.speakerImage && (
                <img
                  src={selectedEvent.speakerImage}
                  alt={selectedEvent.speaker}
                  className="speaker-image"
                />
              )}
              <p><strong>{selectedEvent.speaker}</strong></p>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Events;
