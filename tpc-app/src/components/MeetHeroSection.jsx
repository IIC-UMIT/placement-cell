import React from "react";
import { FaUsers } from "react-icons/fa";
import "../styles/MeetHeroSection.css";

import heroImage from "../assets/MeetPage/college.png";   // replace with your image

const MeetHeroSection = () => {
  return (
    <section
      className="meet-hero"
      style={{
        backgroundImage: `linear-gradient(rgba(8,26,65,.78), rgba(8,26,65,.78)), url(${heroImage})`,
      }}
    >
      <div className="hero-content">

        <span className="hero-badge">
          TRAINING & PLACEMENT CELL
        </span>

        <h1>
          Meet <span>Our Team</span>
        </h1>

        <div className="hero-divider">
          <span></span>
          <FaUsers />
          <span></span>
        </div>

        <p>
          Dedicated professionals and student coordinators working together
          to bridge the gap between students and the corporate world by
          creating outstanding placement opportunities.
        </p>

      </div>
    </section>
  );
};

export default MeetHeroSection;