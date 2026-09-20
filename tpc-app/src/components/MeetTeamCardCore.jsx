import React from "react";
import "./styles/MeetTeamCardCore.css";

const MeetTeamCardCore = ({ member, onClick }) => {

    const role =
        member.name === "Misba Lakhawala"
            ? "Head"
            : member.name === "Shravani Thasal"
                ? "Co-Head"
                : null;

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

            {/* Div 2: Name + Role Container */}
            <div className="team-name-div">

                <h3 className="team-name">
                    {member.name}
                </h3>

                {role && (
                    <p className="team-role">
                        {role}
                    </p>
                )}

            </div>

        </div>
    );
};

export default MeetTeamCardCore;