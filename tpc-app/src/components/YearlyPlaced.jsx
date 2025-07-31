
// import React from "react";
// import { Bar } from "react-chartjs-2";
// import "chart.js/auto"; 

// const StatChart = () => {
//     const series = ["2021", "2022", "2023", "2024", "2025"];
//     const labels = ["CE", "CST", "ENC", "DS", "IT"];
//     const colors = ["#1B4965", "#5FA8D3", "CAE9FF", "#BBE1FA", "#003049"];

//     const dataValues = [
//         [0, 45, 5, 22, 40],  // 2021
//         [49, 45, 5, 23, 40],  // 2022
//         [53, 50, 6, 15, 43],  // 2023
//         [56, 54, 8, 19, 45],  // 2024
//         [0, 0, 0, 0, 0]       // 2025 (No values provided)
//     ];

//     const chartData = {
//         labels: labels,
//         datasets: series.map((serie, index) => ({
//             label: serie,
//             data: dataValues[index],
//             backgroundColor: colors[index % colors.length],
//         })),
//     };

//     return (
//         <div style={{ width: "85vw", maxWidth: "400px", maxHeight: "250px",margin: "auto" }}>
//             <Bar data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
//         </div>
//     );
// };

// export default StatChart;

// import { Bar } from "react-chartjs-2";
// import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
// import "./styles/BranchWise.css";

// ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// const YearlyPlaced = () => {
//   const data = {
//     labels: ["2019-2020", "2020-2021", "2021-2022", "2022-2023", "2023-2024"],
//     datasets: [
//       {
//         label: "Students Placed",
//         data: [109, 159, 177, 199, 199], // 167 + 32 = 199
//         backgroundColor: (context) => {
//           const chart = context.chart;
//           const { ctx, chartArea } = chart;

//           if (!chartArea) return "#003049";

//           const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
//           gradient.addColorStop(0, "#003049");
//           gradient.addColorStop(1, "#005577");
//           return gradient;
//         },
//         borderRadius: 8,
//         barThickness: 40,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         display: false,
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: {
//           stepSize: 50,
//         },
//       },
//     },
//   };

//   return (
//     <div>
//       <Bar data={data} options={options} />
//     </div>
//   );
// };

// export default YearlyPlaced;

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./styles/BranchWise.css";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const YearlyPlaced = () => {
  const data = {
    labels: ["2019-2020", "2020-2021", "2021-2022", "2022-2023", "2023-2024"],
    datasets: [
      {
        label: "Students Placed",
        data: [109, 159, 177, 199, 199],
        fill: true,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "#005577");
          gradient.addColorStop(1, "#003049");
          return gradient;
        },
        borderColor: "#003049",
        borderWidth: 3,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#003049",
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4, // This adds the wave-like curve to the line
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#003049",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 50,
        },
        grid: {
          color: "#e0e0e0",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ width: "90%", margin: "auto" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default YearlyPlaced;
