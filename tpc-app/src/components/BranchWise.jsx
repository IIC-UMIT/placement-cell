import { Doughnut } from "react-chartjs-2";
import "./styles/BranchWise.css";

const CompanyWise = () => {
  const data = {
    labels: ["CST", "CE", "ENC", "DS", "IT"],
    datasets: [
      {
        data: [50, 53, 6, 15, 43], // Placement percentages
        backgroundColor: [
          "#003049", // Dark Blue
          "#1B4965", // Muted Navy
          "#5FA8D3", // Light Blue
          "#8ECae6", // Sky Blue
          "#BFD7EA", // Pale Blue
        ],
        hoverBackgroundColor: [
          "#001F2E", // Darker Shade
          "#173A4C", // Muted Dark Navy
          "#4D94B6", // Medium Blue
          "#6FAFCD", // Bright Sky Blue
          "#9EC3D9", // Softer Blue
        ],
        borderWidth: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%", // Creates the hollow effect
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
    },
  };

  return (
    <div className="chart">
      <div className="chart-wrapper" style={{ width: "450px", height: "650px" }}>
        <Doughnut data={data} options={options} />
        <div className="chart-center">
          <span className="percentage"></span>
          <span className="subtext">Overall Placement</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyWise;
