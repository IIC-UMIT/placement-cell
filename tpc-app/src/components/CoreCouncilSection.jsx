import React from "react";
import MeetTeamCardCore from "./MeetTeamCardCore";
import "./styles/CoreCouncilSection.css";

const CoreCouncilSection = ({ members, onMemberClick }) => {
  return (
    <section className="core-council-section">

      <div className="section-heading">

        <span>OUR TEAM</span>

        <h2>Core Council</h2>

        <p>
          The Core Council consists of dedicated coordinators responsible for
          managing placement drives, industry collaborations, training
          activities, and ensuring smooth execution of recruitment processes.
        </p>

      </div>

      <div className="core-grid">

        {members.map((member) => (
          <MeetTeamCardCore
            key={member.id}
            member={member}
            onClick={onMemberClick}
          />
        ))}

      </div>

    </section>
  );
};

export default CoreCouncilSection;