import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDatabase, ref, onValue } from "firebase/database";
import "../styles/Event.css";

const TABS = ["All Events", "Upcoming", "Conducted", "Workshops", "Seminars"];

const useCounter = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const StatItem = ({ target, suffix, label }) => {
  const count = useCounter(target);
  return (
    <div className="ev-stat">
      <h3>{count}{suffix}</h3>
      <p>{label}</p>
    </div>
  );
};

const Events = () => {
  const [eventsData, setEventsData] = useState([]);
  const [scrollingImages, setScrollingImages] = useState([]);
  const [activeTab, setActiveTab] = useState("All Events");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterYear, setFilterYear] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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
        const images = eventsArray
          .map((e) => e.eventImage || (e.image && e.image[0]))
          .filter(Boolean);
        setEventsData(eventsArray);
        setScrollingImages(images);
      } else {
        setEventsData([]);
        setScrollingImages([]);
      }
    });
  }, []);

  useEffect(() => {
    const handleClick = () => {
      setShowYearDropdown(false);
      setShowSortDropdown(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const currentDate = new Date();

  const allYears = [
    "All",
    ...Array.from(
      new Set(
        eventsData
          .map((e) => e.date && new Date(e.date).getFullYear())
          .filter(Boolean)
      )
    ).sort((a, b) => b - a),
  ];

  const applyFilters = (list) => {
    let result = [...list];
    if (searchQuery.trim()) {
      result = result.filter((e) =>
        [e.name, e.speaker, e.venue]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }
    if (filterYear !== "All") {
      result = result.filter(
        (e) => e.date && new Date(e.date).getFullYear() === Number(filterYear)
      );
    }
    result.sort((a, b) => {
      const da = new Date(a.date);
      const db2 = new Date(b.date);
      return sortOrder === "newest" ? db2 - da : da - db2;
    });
    return result;
  };

  const upcomingEvents = applyFilters(eventsData.filter((e) => new Date(e.date) > currentDate));
  const conductedEvents = applyFilters(eventsData.filter((e) => new Date(e.date) <= currentDate));
  const allFiltered = applyFilters(eventsData);

  const getTabEvents = () => {
    if (activeTab === "Upcoming") return upcomingEvents;
    if (activeTab === "Conducted") return conductedEvents;
    return allFiltered;
  };

  return (
    <div className="events-page">

      {/* ── HERO — centered, no cards, no buttons ── */}
      <section className="ev-hero">
        <h1 className="ev-hero-title">Events &amp; Trainings</h1>
        <p className="ev-hero-desc">
          Explore workshops, seminars, and industry talks designed to bridge
          the gap between academia and the professional world.
        </p>
      </section>

      {/* ── STATS ── */}
      <div className="ev-stats">
        <StatItem target={48} suffix="+" label="Events Held" />
        <StatItem target={12} suffix="k" label="Attendees" duration={1500} />
        <StatItem target={30} suffix="+" label="Partners" />
      </div>

      {/* ── GALLERY STRIP ── */}
      {scrollingImages.length > 0 && (
        <>
          <p className="ev-gallery-label">Past Event Gallery</p>
          <div className="ev-scroll-section">
            <motion.div
              className="ev-scroll-track"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
            >
              {[...scrollingImages, ...scrollingImages].map((src, i) => (
                <motion.img
                  key={i} src={src} alt="event" className="ev-scroll-img"
                  whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}
                />
              ))}
            </motion.div>
          </div>
        </>
      )}

      {/* ── TABS + SEARCH + FILTER + SORT ── */}
      <div className="ev-tabs-bar">
        <div className="ev-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`ev-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="ev-search-row">
          <input
            className="ev-search"
            placeholder="Search events, speakers, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Filter by Year dropdown */}
          <div
            className="ev-dropdown-wrap"
            onClick={(e) => {
              e.stopPropagation();
              setShowYearDropdown((p) => !p);
              setShowSortDropdown(false);
            }}
          >
            <button className="ev-filter-btn">
              ⊞ {filterYear === "All" ? "Filter by Year" : filterYear} ▾
            </button>
            {showYearDropdown && (
              <div className="ev-dropdown">
                {allYears.map((yr) => (
                  <div
                    key={yr}
                    className={`ev-dropdown-item${filterYear === String(yr) ? " selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterYear(String(yr));
                      setShowYearDropdown(false);
                    }}
                  >
                    {yr}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort dropdown */}
          <div
            className="ev-dropdown-wrap"
            onClick={(e) => {
              e.stopPropagation();
              setShowSortDropdown((p) => !p);
              setShowYearDropdown(false);
            }}
          >
            <button className="ev-filter-btn">
              ↕ {sortOrder === "newest" ? "Newest First" : "Oldest First"} ▾
            </button>
            {showSortDropdown && (
              <div className="ev-dropdown">
                {[
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                ].map((opt) => (
                  <div
                    key={opt.value}
                    className={`ev-dropdown-item${sortOrder === opt.value ? " selected" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortOrder(opt.value);
                      setShowSortDropdown(false);
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── UPCOMING ── */}
      {(activeTab === "All Events" || activeTab === "Upcoming") && (
        <section className="ev-section">
          <h2 className="ev-section-title">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p className="ev-empty">No upcoming events.</p>
          ) : (
            <div className="ev-grid">
              {upcomingEvents.map((event, i) => (
                <EventCard key={i} event={event} onClick={() => setSelectedEvent(event)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── CONDUCTED ── */}
      {(activeTab === "All Events" || activeTab === "Conducted") && (
        <section className="ev-section">
          <h2 className="ev-section-title">Events Conducted</h2>
          {conductedEvents.length === 0 ? (
            <p className="ev-empty">No conducted events.</p>
          ) : (
            <div className="ev-grid">
              {conductedEvents.map((event, i) => (
                <EventCard key={i} event={event} onClick={() => setSelectedEvent(event)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── WORKSHOPS / SEMINARS ── */}
      {(activeTab === "Workshops" || activeTab === "Seminars") && (
        <section className="ev-section">
          <h2 className="ev-section-title">{activeTab}</h2>
          {getTabEvents().length === 0 ? (
            <p className="ev-empty">No events found.</p>
          ) : (
            <div className="ev-grid">
              {getTabEvents().map((event, i) => (
                <EventCard key={i} event={event} onClick={() => setSelectedEvent(event)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── MODAL ── */}
      {selectedEvent && (
        <div className="ev-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="ev-modal" onClick={(e) => e.stopPropagation()}>
            {(selectedEvent.eventImage || (selectedEvent.image && selectedEvent.image[0])) && (
              <img
                src={selectedEvent.eventImage || selectedEvent.image[0]}
                alt={selectedEvent.name}
                className="ev-modal-img"
              />
            )}
            <div className="ev-modal-body">
              <h2>{selectedEvent.name}</h2>
              <p className="ev-modal-meta">
                {selectedEvent.date} | {selectedEvent.time} | {selectedEvent.venue}
              </p>
              <p className="ev-modal-desc">{selectedEvent.description}</p>
              {selectedEvent.speaker && (
                <div className="ev-modal-speaker">
                  {selectedEvent.speakerImage && (
                    <img src={selectedEvent.speakerImage} alt={selectedEvent.speaker} className="ev-modal-speaker-img" />
                  )}
                  <span>{selectedEvent.speaker}</span>
                </div>
              )}
              {selectedEvent.report && (
                <p className="ev-modal-report">{selectedEvent.report}</p>
              )}
              <button className="ev-modal-close" onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event, onClick }) => {
  const imgSrc = event.eventImage || (event.image && event.image[0]) || null;
  return (
    <motion.div className="ev-card" onClick={onClick} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      {imgSrc ? (
        <img src={imgSrc} alt={event.name} className="ev-card-img" />
      ) : (
        <div className="ev-card-img ev-card-placeholder">🎓</div>
      )}
      <div className="ev-card-body">
        <h3>{event.name}</h3>
        <p className="ev-card-meta">{event.date} · {event.time}</p>
        <p><strong>Venue:</strong> {event.venue}</p>
        {event.speaker && (
          <div className="ev-speaker">
            {event.speakerImage && (
              <img src={event.speakerImage} alt={event.speaker} className="ev-speaker-img" />
            )}
            <span>{event.speaker}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Events;