import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import { Outlet, useNavigate } from "react-router-dom";
import '../styles/TPODashboard.css';
// import logo from '../assets/logo.png'; // Import the logo if necessary

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const [sideBar, setSideBar] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSideBar(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
        if (window.innerWidth < 768) {
            setSideBar(false);
        }
    };

    const handleLogout = async () => {
        try {
            await firebase.auth().signOut();
            navigate("/login");
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <div className="dashboardContainer">
            <div className='sidebarContent'>
                <div className="dashboardContent">
                    <div
                        className="sidebarControl"
                        onClick={() => {
                            setSideBar(!sideBar);
                        }}
                    >
                        {sideBar ? (
                            <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2 7.81125V16.1913C2 17.6813 2.36 18.9212 3.05 19.8713C3.34 20.2913 3.71 20.6612 4.13 20.9513C4.95 21.5513 5.99 21.9012 7.22 21.9812V2.03125C3.94 2.24125 2 4.37125 2 7.81125Z" fill="#ffffff"></path> <path d="M20.9507 4.13C20.6607 3.71 20.2907 3.34 19.8707 3.05C18.9207 2.36 17.6807 2 16.1907 2H8.7207V22H16.1907C19.8307 22 22.0007 19.83 22.0007 16.19V7.81C22.0007 6.32 21.6407 5.08 20.9507 4.13ZM15.5007 14.03C15.7907 14.32 15.7907 14.8 15.5007 15.09C15.3507 15.24 15.1607 15.31 14.9707 15.31C14.7807 15.31 14.5907 15.24 14.4407 15.09L11.8807 12.53C11.5907 12.24 11.5907 11.76 11.8807 11.47L14.4407 8.91C14.7307 8.62 15.2107 8.62 15.5007 8.91C15.7907 9.2 15.7907 9.68 15.5007 9.97L13.4807 12L15.5007 14.03Z" fill="#ffffff"></path> </g></svg>
                        ) : (
                            <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7.81 2C6.32 2 5.08 2.36 4.13 3.05C3.71 3.34 3.34 3.71 3.05 4.13C2.36 5.08 2 6.32 2 7.81V16.19C2 19.83 4.17 22 7.81 22H15.28V2H7.81ZM12.12 12.53L9.56 15.09C9.41 15.24 9.22 15.31 9.03 15.31C8.84 15.31 8.65 15.24 8.5 15.09C8.21 14.8 8.21 14.32 8.5 14.03L10.52 12L8.5 9.97C8.2 9.68 8.2 9.2 8.5 8.91C8.8 8.62 9.27 8.62 9.56 8.91L12.12 11.47C12.41 11.76 12.41 12.24 12.12 12.53Z" fill="#ffffff"></path> <path d="M16.7793 2.03125V21.9812C18.0093 21.9012 19.0493 21.5513 19.8693 20.9513C20.2893 20.6612 20.6593 20.2913 20.9493 19.8713C21.6393 18.9212 21.9993 17.6813 21.9993 16.1913V7.81125C21.9993 4.37125 20.0593 2.24125 16.7793 2.03125Z" fill="#ffffff"></path> </g></svg>
                        )}
                    </div>
                    {/* <img
                    src={logo}
                    alt="logo"
                    className="navbarLogo"
                    onClick={() => handleNavigation("/")}
                /> */}
                    <div
                        className={sideBar ? "sidebar sidebarOpen" : "sidebar sidebarClosed"}
                    >
                        <h3>Recruiter Dashboard</h3>
                        <div className="flex flex-col space-y-4">
                            <button
                                className="sidebarButton"
                                onClick={() => handleNavigation("/Recruiter/Dashboard")}
                            >
                                Home
                            </button>
                            <button
                                className="sidebarButton"
                                onClick={() => handleNavigation("/Recruiter/JobDescription")}
                            >
                                Job Description
                            </button>
                            {/* <button
                            className="sidebarButton"
                            onClick={() => handleNavigation("/Student/Resume")}
                        >
                           Resume
                        </button> */}
                            <button
                                className="sidebarButton"
                                onClick={() => handleNavigation("/Recruiter/RecruiterJDManager")}
                            >
                                Recruitment Status
                            </button>
                           
                            {/* <button
                            className="sidebarButton"
                            onClick={() => handleNavigation("/Student/Profile")}
                        >
                            Announcements
                        </button>
                        <button
                            className="sidebarButton"
                            onClick={() => handleNavigation("/Student/Profile")}
                        >
                            Event Dashboard
                        </button> */}
                            <button className="sidebarButton" onClick={handleLogout}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
                <div className="outletContainer">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;



