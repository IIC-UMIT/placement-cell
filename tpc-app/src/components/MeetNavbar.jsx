import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/IIIC-logo.png";
import "../styles/MeetNavbar.css";

const MeetNavbar = () => {
  const navigate = useNavigate();

  return (
    <header className="meet-navbar">
      <div className="meet-navbar-left">
        <img src={logo} alt="IIIC Logo" className="meet-logo" />

        <div className="meet-title">
          <h2>Training & Placement Cell</h2>
          <span>Usha Mittal Institute Of Technology</span>
        </div>
      </div>

      <div className="meet-navbar-right">
        <button
          className="home-btn"
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </div>
    </header>
  );
};

export default MeetNavbar;