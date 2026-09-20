import React from "react";
import { MdEmail, MdPhone } from "react-icons/md";
import "../styles/PlacementOfficerCard.css";


const PlacementOfficerCard = ({ member, onClick }) => {
  return (
    <div
      className="placement-officer-card"
      onClick={() => onClick(member)}
    >
      <div className="placement-image">
        <img src={member.image} alt={member.name} />
      </div>

      <div className="placement-info">
        <h2>{member.name}</h2>

        <h4>{member.role}</h4>

        <p>
          <MdEmail />
          {member.email}
        </p>

        <p>
          <MdPhone />
          {member.phone}
        </p>
      </div>

      <div className="placement-about">
        <p>
          {member.description}
        </p>
      </div>
    </div>
  );
};

export default PlacementOfficerCard;