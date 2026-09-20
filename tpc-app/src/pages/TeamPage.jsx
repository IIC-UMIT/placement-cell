import React, { useState } from "react";

import MeetNavbar from "../components/MeetNavbar";
import MeetHeroSection from "../components/MeetHeroSection";
import MeetMemberModal from "../components/MeetMemberModal";
import PlacementOfficerCard from "../components/PlacementOfficerCard";
import CoreCouncilSection from "../components/CoreCouncilSection";
import JuniorCouncilSection from "../components/JuniorCouncilSection";
import TeacherTPC from "../components/TeacherTPC";

import {
  placementOfficer,
  coreCouncil,
  juniorCouncil,
  teacherCoordinators,
} from "../components/teamData";

import "../styles/TeamPage.css";

const TeamPage = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <div className="team-page">

      <MeetNavbar />

      <MeetHeroSection />

    

      {/* ============== Placement Officer ============== */}

      <section className="placement-section">

    <div className="placement-title">
        <h2>Placement Officer</h2>
    </div>

    <PlacementOfficerCard
        member={placementOfficer}
        onClick={setSelectedMember}
    />

</section>


{/* ================= Teacher Coordinators ================= */}

<TeacherTPC
    teachers={teacherCoordinators}
    onTeacherClick={setSelectedMember}
/>


{/* ================= Member Modal ================= */}

      {/* ================= Core Council ================= */}

<CoreCouncilSection
    members={coreCouncil}
    onMemberClick={setSelectedMember}
/>


{/* ================= Junior Council ================= */}

<JuniorCouncilSection
    members={juniorCouncil}
    onMemberClick={setSelectedMember}
/>



<MeetMemberModal
    member={selectedMember}
    onClose={() => setSelectedMember(null)}
/>

    </div>
  );
};

export default TeamPage;