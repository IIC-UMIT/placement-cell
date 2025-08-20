import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDatabase, ref, get } from "firebase/database";
import '../styles/LandingPage.css';
import BranchWise from "../components/BranchWise";
import CtcHighlight from "../components/CtcHighlight";
import InternshipStatistics from '../components/InternshipStat';
import YearlyPlaced from '../components/YearlyPlaced';

function Home() {
  const navigate = useNavigate();
  const [logos, setLogos] = useState([]);
  const [activated, setActivated] = useState(false);
  const [counters, setCounters] = useState([
    { label: "Student Placed", count: 167, value: 0 },
    { label: "Internship Offers", count: 32, value: 0 },
    { label: "Recruiters", count: 29, value: 0 },
    { label: "Highest Offer(LPA)", count: 33, value: 0 },
  ]);
  const students = [
    {
      name: "Shruti Rane",
      quote: "I am excited to start my journey at Visa. The experience and learning at college prepared me well!",
      packageAmount: "INR 32 LPA",
      company: "Visa",
    },
    {
      name: "Kirtee Sinha",
      quote: "Joining Visa is a dream come true! Thanks to the placement cell for their guidance.",
      packageAmount: "INR 32 LPA",
      company: "Visa",
    },
    {
      name: "Alam Sanjana",
      quote: "I am thrilled to be part of Visa. The hard work has truly paid off!",
      packageAmount: "INR 32 LPA",
      company: "Visa",
    },
  ];

  useEffect(() => {
    const fetchLogos = async () => {
      const db = getDatabase();
      const logosRef = ref(db, "CompanyLogos"); // Adjust path if necessary

      try {
        const snapshot = await get(logosRef);
        if (snapshot.exists()) {
          setLogos(Object.values(snapshot.val())); // Convert object to array
        }
      } catch (error) {
        console.error("Error fetching logos:", error);
      }
    };

    fetchLogos();
  }, []);

  const updateCount = (index) => {
    setCounters(prevCounters => {
      const target = prevCounters[index].count;
      const currentCount = prevCounters[index].value;

      // Increment the current count towards the target
      if (currentCount < target) {
        return prevCounters.map((counter, i) => (
          i === index ? { ...counter, value: Math.min(currentCount + Math.ceil(target / 200), target) } : counter
        ));
      } else {
        return prevCounters; // No change if the count is already at the target
      }
    });
  };

  const handleScroll = useCallback(() => {
    if (!activated) {
      const containerPosition = document.querySelector('.container-counter').getBoundingClientRect().top;
      const screenPosition = window.innerHeight;

      if (containerPosition < screenPosition) {
        setActivated(true); // Prevent re-triggering
        counters.forEach((_, index) => {
          setCounters(prevCounters => {
            const newCounters = [...prevCounters];
            newCounters[index].value = 0; // Reset to 0 before counting up
            return newCounters;
          });
          updateCount(index);
        });
      }
    }
  }, [activated, counters]);

  useEffect(() => {
    const handleScrollEvent = () => handleScroll();
    window.addEventListener('scroll', handleScrollEvent);
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, [activated, counters, handleScroll]);

  useEffect(() => {
    if (activated) {
      const intervalId = setInterval(() => {
        setCounters(prevCounters => {
          return prevCounters.map((counter, index) => {
            const target = counter.count;
            if (counter.value < target) {
              return { ...counter, value: Math.min(counter.value + Math.ceil(target / 200), target) };
            }
            return counter;
          });
        });
      }, 20);

      return () => clearInterval(intervalId); // Clear interval on cleanup
    }
  }, [activated]);  // Ensure the dependency array is correct

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div>
      <div className="home">
        {/* NAVBAR */}
        <nav className="nav">
          <div className="logo">
            <img src="https://res.cloudinary.com/dvy2put4o/image/upload/v1743264142/IIIC-logo_it2ccp.png" alt="Logo" width={50} height={50} />
            <h3>Usha Mittal Institute of Technology</h3>
          </div>
        </nav>

        {/* HOME */}
        <div className="home-section">
          <div className="welcome-message">
            <h1>
              <span className="offset-header offset-header-odd"><span>Welcome To </span></span><br />
              <span className="offset-header offset-header-even"><span>Industry Institute Interaction Cell</span></span>
            </h1>
            <p> Empowering Women in Engineering: Where Innovation Meets Excellence.</p>
            <div className="social-media">
              <a href="https://in.linkedin.com/company/tpc-umit-sndt?trk=public_post_follow-view-profile" target="_blank" rel="noopener noreferrer" className="social-icon">
                <img src="https://res.cloudinary.com/dvy2put4o/image/upload/v1743264118/linkedin_tuza1t.png" alt="LinkedIn" />
              </a>
              <a href="https://www.instagram.com/iiic.umit/" target="_blank" rel="noopener noreferrer" className="social-icon">
                <img src="https://res.cloudinary.com/dvy2put4o/image/upload/v1743264113/instagram_unby4b.png" alt="Instagram" />
              </a>
            </div>
          </div>
          <div className="login-buttons">
            <button onClick={() => handleLogin()}>
              <svg fill="#FFFFFF" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="25px" height="30px" viewBox="0 0 600 481.119" xmlSpace="preserve"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g id="Layer_2_31_"> <g> <path d="M80.13,89.836c6.763,3.805,64.945,31.734,64.945,31.734s-0.016,30.356-0.016,38.571 c0,105.197-43.24,115.07-31.602,123.201c2.563,1.789,33.903,2.949,73.783,3.484c14.103,9.342,32.798,15.057,53.318,15.133 c20.521-0.076,39.216-5.791,53.318-15.133c39.88-0.535,71.221-1.695,73.782-3.484c11.641-8.131-31.6-18.004-31.6-123.201 c0-8.215-0.016-38.57-0.016-38.57s26.062-12.512,45.329-21.928v44.448c-3.342,1.97-5.689,5.452-5.689,9.603 c0,3.674,1.864,6.788,4.583,8.846c0,0-4.832,27.166-6.395,35.154c-1.563,7.988,27.559,6.387,26.247,0 c-1.311-6.387-6.394-35.154-6.394-35.154c2.719-2.058,4.585-5.172,4.585-8.846c0-4.15-2.339-7.633-5.679-9.603V94.104 c4.084-2.029,7.104-3.563,8.355-4.268c6.763-3.807,7.763-9.605-1.862-14.318C360.155,56.442,260.8,7.817,250.976,3.131 C246.877,1.178,243.474,0.268,240.56,0c-2.914,0.268-6.318,1.178-10.416,3.131c-9.824,4.686-109.18,53.311-148.151,72.387 C72.368,80.231,73.368,86.03,80.13,89.836z"></path> <path d="M353.227,343.084c-15.685-5.656-42.989-21.961-47.666-24.477c-1.213-0.705-2.616-1.117-4.121-1.117 c-3.282,0-6.105,1.928-7.423,4.715c-12.888,21.572-36.735,84.145-53.457,85.754c-16.722-1.609-40.57-64.182-53.457-85.754 c-1.316-2.787-4.14-4.715-7.423-4.715c-1.504,0-2.908,0.412-4.121,1.117c-4.677,2.516-31.981,18.82-47.666,24.477 c-52.65,18.984-76.33,38.346-76.33,51.547c0,13.188,0,86.488,0,86.488H240.56h188.997c0,0,0-73.301,0-86.488 C429.557,381.43,405.877,362.069,353.227,343.084z"></path> </g> </g> </g> </g></svg>
              Student</button>
            <button onClick={() => handleLogin()}>
              <svg fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" enableBackground="new 0 0 100 100" xmlSpace="preserve" stroke="#ffffff" width="30px" height="30px"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M37.3,31.9h21.8c1.1,0,2-0.9,2-2v-4c0-3.3-2.7-5.9-5.9-5.9H41.3c-3.3,0-5.9,2.7-5.9,5.9v4 C35.3,31,36.2,31.9,37.3,31.9z"></path> <path d="M70,24.9h-2c-0.6,0-1,0.4-1,1v4c0,4.4-3.6,7.9-7.9,7.9H37.3c-4.4,0-7.9-3.6-7.9-7.9v-4c0-0.6-0.4-1-1-1h-2 c-3.3,0-5.9,2.7-5.9,5.9v40.6c0,3.3,2.7,5.9,5.9,5.9h20c2.8,0,3.1-2.3,3.1-3.1V52.8c0-2.3,1.3-2.8,2-2.8h21.6c2.4,0,2.8-2.1,2.8-2.8 V31C76,27.6,73.3,24.9,70,24.9z"></path> <path d="M78.4,60.4H56.6c-0.6,0-1.1-0.5-1.1-1.1v-2.2c0-0.6,0.5-1.1,1.1-1.1h21.8c0.6,0,1.1,0.5,1.1,1.1v2.2 C79.5,59.9,79,60.4,78.4,60.4z M78.4,70.2H56.6c-0.6,0-1.1-0.5-1.1-1.1v-2.2c0-0.6,0.5-1.1,1.1-1.1h21.8c0.6,0,1.1,0.5,1.1,1.1v2.2 C79.5,69.7,79,70.2,78.4,70.2z M78.4,80H56.6c-0.6,0-1.1-0.5-1.1-1.1v-2.2c0-0.6,0.5-1.1,1.1-1.1h21.8c0.6,0,1.1,0.5,1.1,1.1v2.2 C79.5,79.5,79,80,78.4,80z"></path> </g></svg>
              Recruiter</button>
            <button onClick={() => handleLogin()}><svg fill="#ffffff" width="30px" height="30px" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><circle cx="44.6" cy="36.2" r="16.1"></circle><path d="M48.8,79.6c2.8,0,1.2-1.9,1.2-1.9h0a19.22,19.22,0,0,1-4.2-12,18.65,18.65,0,0,1,1.7-7.9l.2-.4a1.17,1.17,0,0,0-.9-1.9h0a17.7,17.7,0,0,0-2.3-.1A24.35,24.35,0,0,0,20.4,76.3c0,1.2.4,3.5,4.2,3.5H48.3C48.7,79.6,48.7,79.6,48.8,79.6Z"></path><path d="M65.3,51.2A14.25,14.25,0,1,0,79.5,65.5,14.25,14.25,0,0,0,65.3,51.2Zm0,4.5a3.22,3.22,0,0,1,3.2,3.2,3.06,3.06,0,0,1-.7,2l2.3,4.3c.1.2,0,.4-.2.4a2.7,2.7,0,0,0-1.1.5c-.2.1-.4,0-.4-.1l-2.2-4.1a3.08,3.08,0,0,1-.9.1,3.22,3.22,0,0,1-3.2-3.2A3.08,3.08,0,0,1,65.3,55.7Zm-2,8.2L61.1,68a3.26,3.26,0,0,1,1,2.3,3.2,3.2,0,1,1-3.2-3.2h.4l2.3-4.3c.1-.2.2-.2.5-.1a2.87,2.87,0,0,0,1.1.6C63.3,63.7,63.4,63.9,63.3,63.9Zm8.3,9.8a3.29,3.29,0,0,1-3-1.9H64.2c-.2,0-.4-.2-.2-.4a2.48,2.48,0,0,0,.1-.9v-.2c0-.2.1-.4.2-.4h4.2a3.12,3.12,0,0,1,3.1-2.6,3.22,3.22,0,0,1,3.2,3.2A3.44,3.44,0,0,1,71.6,73.7Z"></path></g></svg>
              Coordinator</button>
          </div>
        </div>

        {/* COMPANY LOGO */}
        <div className="slider">
          <div className="slider-text">
            <h1><b>Our Industry Recruiters</b></h1>
          </div>
          <div className="slide-track">
            {logos.concat(logos).concat(logos).map((logo, index) => ( // Duplicate for smooth scrolling
              <div className="slide" key={index}>
                <img className="move" src={logo} alt={`Company Logo ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* ABOUT US */}
        <div className="about-container">
          <div className='about-content'>
            <h1>About Us</h1>
            <p>
              The Industry-Institute Interaction Cell (IIIC), UMIT is dedicated to enhancing student employability by bridging the gap between academia and industry. We strive to equip students with the necessary skills, knowledge, and exposure to excel in the corporate world.
              Our initiatives include placement drives, internships, workshops, mock interviews, and industry interactions to prepare students for real-world challenges. We collaborate with top companies to provide career opportunities, resume-building support, and technical & soft skills training.
            </p>
          </div>
          <div className='aboutImg'>
            <img src="https://res.cloudinary.com/dvy2put4o/image/upload/v1743263375/Untitled_3240_x_1080_px_1080_x_1080_px_o5k7hu.png" alt="AboutUS" />
          </div>
        </div>

        {/* STATISTICS */}
        <div className="container-counter">
          <div className="counters">
            <div>
              {counters.map((counter, index) => (
                <div className="counter" key={counter.label}>
                  <h1>{counter.value}</h1>
                  <h3>{counter.label}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="layout">
          <div className="charts-grid">
            <div className="line-chart-container">
              <h2>CTC Highlight</h2>
              {/* <Line data={lineData} options={{ scales: { y: { beginAtZero: true } } }} /> */}
              <CtcHighlight />
            </div>
            <div className="barlayout flex flex-direction row mt-3" style={{ gap: "20px" }}>
              <div className="chart-container">
              <h2>Internship Offers</h2>
              <InternshipStatistics />
              </div>
              <div className="chart-container">
                <h2>Yearly Placements</h2>
                {/* <Bar data={barData} options={{ scales: { y: { beginAtZero: true } } }} /> */}
                
                <YearlyPlaced />
              </div>
            </div>
          </div>
          <div className="dougnut-chart-container">
            <h2>Branch-wise Placements</h2>
            {/* <Doughnut data={doughnutData} width="200px" height="200px" /> */}
            <BranchWise />
          </div>
        </div>

        {/* HIGHEST PLACED */}
        <section className="top-students">
          <div className="d-flex flex-wrap gap-3 p-3 justify-content-center">
            {students.map((student, index) => (
              <div
                key={index}
                className="position-relative p-3 shadow-lg student-card"
              >
                {/* Expanding Circle Effect */}
                <div className="expanding-circle"></div>

                {/* Card Content */}
                <div className="d-flex flex-column h-100 justify-content-between position-relative z-1">
                  <div>
                    <h2 className="fs-4 fw-bold mb-2">{student.name}</h2>
                    {/* <p className="text-secondary color-white">{student.company}</p> */}
                  </div>
                  <div className="mt-3">
                    <p><strong>Package:</strong> {student.packageAmount}</p>
                    {/* <p><strong>Company:</strong> {student.company}</p> */}
                  </div>
                </div>

                {/* Overlay with Quotes on Hover */}
                <div className="overlay d-flex align-items-flex-start justify-content-center">
                  <div className="text-center mt-3">
                    <p className="fw-medium">"{student.quote}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------COORDINATORS MESSAGE---------  */}
        <div className="message">
          <div className="coordinator-message">
            <img
              src="https://res.cloudinary.com/dvy2put4o/image/upload/v1742579788/mpiaax8kwdwgx9jwpisu.jpg"
              alt="Coordinator"
              className="coordinator-image"
            />
            <div className="message-content">
              <h2>Dr. Vilas Kharat</h2>
              <p>IIIC UMIT Co-ordinator</p>
              <p id="message">Welcome to the placement cell. We are dedicated to providing our students with the best career opportunities. Our team is here to assist you in achieving your professional goals. We believe in creating a supportive environment that fosters growth and development.</p>
              <div className="teambutton">
                <button onClick={() => navigate('/Team')} className="nav-button">Our Team</button>
              </div>
            </div>
          </div>
        </div>
        <script src="message.js"></script>

        <div className='feed'>
          <div className="elfsight-app-bac7a5aa-fa12-4ca3-a6a3-1c24c5b793a0" data-elfsight-app-lazy></div>
          {/* Update Section */}
          {/* <div className="update-section">
              <h2>Latest Announcements</h2>
              <ul>
                <li>Admission to M.Tech and PhD programs</li>
                <li>Faculty Recruitment 2024</li>
                <li>JRF Recruitment</li>
                <li>Internship Advertisement under ISEA Project</li>
              </ul>
            </div> */}
        </div>

        {/* FOOTER */}
        <footer>
          <div className="footer-title">
            <img src="https://res.cloudinary.com/dvy2put4o/image/upload/v1743264142/IIIC-logo_it2ccp.png" alt="logo" width="150px" height="150px" />
            <h1>IIIC Usha Mittal Institute of Technology</h1>
          </div>
          <div className="footer-content">
            <div className="footer-section footer-social-media">
              <h2>Follow Us</h2>
              <div className="footer-social-icons">
                <a href="https://in.linkedin.com/company/tpc-umit-sndt?trk=public_post_follow-view-profile" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
                  <img src="https://res.cloudinary.com/dvy2put4o/image/upload/v1743264118/linkedin_tuza1t.png" alt="LinkedIn" />
                </a>
                <a href="https://www.instagram.com/iiic.umit/" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
                  <img src="https://res.cloudinary.com/dvy2put4o/image/upload/v1743264113/instagram_unby4b.png" alt="Instagram" />
                </a>
              </div>
            </div>

            <div className="footer-section links">
              <h2>Quick Links</h2>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/Events">Events</Link></li>
                <li><Link to="/Team">Team</Link></li>
              </ul>
            </div>
            <div className="footer-section contact">
              <h2>Connect</h2>
              <p className="contact-info">
                <a href="mailto:placements@umit.sndt.ac.in">placements@umit.sndt.ac.in</a>
              </p>
              <p className="contact-info">
                <a href="tel:+919820161954">+91 9820161954</a>
              </p>
              <p className="contact-info">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=3RPJ+H5Q,+Juhu-Tara+Road,+Sir+Vitthaldas+Vidyavihar,+Santacruz(W),+Mumbai,+Maharashtra+400049"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  UMIT, SNDT Women's University, Juhu-Tara Road, Sir Vitthaldas Vidyavihar, Santacruz(W), Mumbai 400049
                </a>
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>Developed by Sanjana Shetty, Tejashree Deore, Ketaki Sakhadeo</p>
            <p>&copy; 2025 Training and Placement Cell. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
      <style>
        {`
          @media (max-width: 768px) {
            .bar-grid {
              flex-direction: column !important;
            }
          }
        `}
      </style>
    </div >
  );
};
export default Home;
