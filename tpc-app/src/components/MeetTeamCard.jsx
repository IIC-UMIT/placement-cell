import React from "react";
import "./styles/MeetTeamCard.css";

const MeetTeamCard = ({ member, onClick }) => {
    return (
        <div
            className="meet-team-card"
            onClick={() => onClick && onClick(member)}
        >
            {/* Div 1: Fixed Photo Container */}
            <div className="team-photo-div">
                <img
                    src={member.image}
                    alt={member.name}
                    className="team-photo"
                />
            </div>

            {/* Div 2: Dedicated Small Name Container */}
            <div className="team-name-div">
                <h3 className="team-name">{member.name}</h3>
            </div>
        </div>
    );
};

export default MeetTeamCard;