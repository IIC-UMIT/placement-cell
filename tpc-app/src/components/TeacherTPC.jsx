import React from "react";
import MeetTeamCard from "./MeetTeamCard";
import "./styles/TeacherTPC.css";

const TeacherTPC = ({ teachers = [], onTeacherClick }) => {
    const total = teachers.length;

    return (
        <section className="teacher-tpc-section">

            {/* =========================================
                HEADING
            ========================================= */}
            <div className="teacher-section-heading">

                <span>OUR TEAM</span>

                <h2>Teacher Coordinators</h2>

                <p>
                    Faculty coordinators supporting placement drives,
                    training programs, and campus recruitment activities.
                </p>

            </div>


            {/* =========================================
                TEACHER CARDS SINGLE-ROW LAYOUT (ALWAYS VISIBLE)
            ========================================= */}
            {total > 0 && (

                <div className="teacher-row-container">

                    <div className="teacher-row">

                        {teachers.map((teacher, index) => (

                            <div
                                key={teacher.id ?? index}
                                className="teacher-card"
                            >
                                <MeetTeamCard
                                    member={teacher}
                                    onClick={onTeacherClick}
                                />
                            </div>

                        ))}

                    </div>

                </div>

            )}


            {/* =========================================
                NO TEACHERS MESSAGE
            ========================================= */}
            {total === 0 && (

                <p className="no-teachers">
                    No Teacher Coordinators available.
                </p>

            )}

        </section>
    );
};

export default TeacherTPC;