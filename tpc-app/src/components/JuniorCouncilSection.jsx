import React, { useEffect, useState } from "react";
import MeetTeamCard from "./MeetTeamCard";
import "./styles/JuniorCouncilSection.css";

const JuniorCouncilSection = ({ members = [], onMemberClick }) => {
    const [center, setCenter] = useState(0);

    const total = members.length;

    // =========================================
    // MOVE TO NEXT MEMBER
    // =========================================
    const nextMember = () => {
        if (total <= 1) return;

        setCenter((prev) => (prev + 1) % total);
    };

    // =========================================
    // MOVE TO PREVIOUS MEMBER
    // =========================================
    const previousMember = () => {
        if (total <= 1) return;

        setCenter((prev) => (prev - 1 + total) % total);
    };

    // =========================================
    // RESET CENTER IF MEMBERS CHANGE
    // =========================================
    useEffect(() => {
        if (center >= total && total > 0) {
            setCenter(0);
        }
    }, [total, center]);

    // =========================================
    // AUTOMATIC CAROUSEL
    // =========================================
    useEffect(() => {
        if (total <= 1) return;

        const interval = setInterval(() => {
            setCenter((prev) => (prev + 1) % total);
        }, 3000);

        return () => clearInterval(interval);
    }, [total]);

    // =========================================
    // GET CARD POSITION
    // =========================================
    const getCardClass = (index) => {
        if (total === 0) {
            return "hidden";
        }

        // Center card
        if (index === center) {
            return "center";
        }

        // First card on the left
        if (index === (center - 1 + total) % total) {
            return "left-1";
        }

        // Second card on the left
        if (index === (center - 2 + total) % total) {
            return "left-2";
        }

        // First card on the right
        if (index === (center + 1) % total) {
            return "right-1";
        }

        // Second card on the right
        if (index === (center + 2) % total) {
            return "right-2";
        }

        // Everything else stays hidden
        return "hidden";
    };

    return (
        <section className="junior-section">

            {/* =========================================
                HEADING
            ========================================= */}
            <div className="section-heading">

                <span>OUR TEAM</span>

                <h2>Junior Council</h2>

                <p>
                    Student coordinators assisting in placement drives,
                    training programs, and campus recruitment activities.
                </p>

            </div>

            {/* =========================================
                CAROUSEL (ALWAYS VISIBLE)
            ========================================= */}
            {total > 0 && (

                <div className="jc-carousel">

                    {/* PREVIOUS BUTTON */}
                    <button
                        type="button"
                        className="jc-arrow jc-prev"
                        onClick={previousMember}
                        aria-label="Previous Junior Council member"
                    >
                        ‹
                    </button>


                    {/* VIEWPORT */}
                    <div className="jc-viewport">

                        {members.map((member, index) => {

                            const cardClass = getCardClass(index);

                            return (
                                <div
                                    key={member.id ?? index}
                                    className={`jc-card ${cardClass}`}
                                >
                                    <MeetTeamCard
                                        member={member}
                                        onClick={onMemberClick}
                                    />
                                </div>
                            );

                        })}

                    </div>


                    {/* NEXT BUTTON */}
                    <button
                        type="button"
                        className="jc-arrow jc-next"
                        onClick={nextMember}
                        aria-label="Next Junior Council member"
                    >
                        ›
                    </button>

                </div>
            )}


            {/* NO MEMBERS MESSAGE */}
            {total === 0 && (
                <p className="no-members">
                    No Junior Council members available.
                </p>
            )}

            

        </section>
    );
};

export default JuniorCouncilSection;