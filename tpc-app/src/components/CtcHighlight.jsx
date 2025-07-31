// // import React from "react";
// // import "./styles/CtcHighlight.css";
// import { Line } from "react-chartjs-2";

// // const CTCWaveChart = ({ data }) => {
// //   const chartData = {
// //     labels: data.map((item) => ""),
// //     datasets: [
// //       {
// //         label: "CTC Highlights",
// //         data: data.map((item) => item.ctc),
// //         borderColor: "#003049",
// //         backgroundColor: (context) => {
// //           const chart = context.chart;
// //           const { ctx, chartArea } = chart;
// //           if (!chartArea) {
// //             return null;
// //           }
// //           const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
// //           gradient.addColorStop(0, "rgba(0, 48, 73, 0.3)");
// //           gradient.addColorStop(1, "rgba(0, 48, 73, 0)");
// //           return gradient;
// //         },
// //         borderWidth: 2,
// //         tension: 0.4,
// //         pointRadius: 4,
// //         pointHoverRadius: 6,
// //         fill: "start", // Gradient applied only under the curve
// //       },
// //     ],
// //   };

// //   const options = {
// //     responsive: true,
// //     plugins: {
// //       tooltip: {
// //         callbacks: {
// //           label: function (tooltipItem) {
// //             const company = data[tooltipItem.dataIndex].company;
// //             const students = data[tooltipItem.dataIndex].students;
// //             return `${company}: ${tooltipItem.raw} LPA, ${students} students`;
// //           },
// //         },
// //       },
// //     },
// //     scales: {
// //       x: {
// //         display: false,
// //       },
// //       y: {
// //         title: {
// //           display: true,
// //           text: "CTC Offered (LPA)",
// //           color: "#003049",
// //           font: {
// //             size: 14,
// //           },
// //         },
// //         ticks: {
// //           color: "#003049",
// //           font: {
// //             size: 12,
// //           },
// //         },
// //       },
// //     },
// //   };

// //   return (
// //     <div className="chart">
// //       <Line data={chartData} options={options} />
// //     </div>
// //   );
// // };

// // const App = () => {
// //   const companyData = [
// //     { company: "Oracle", ctc: 1, students: 1 },
// //     { company: "Deutsche Bank", ctc: 7, students: 7 },
// //     { company: "JP Morgan Chase & Co.", ctc: 19.75, students: 1 },
// //     { company: "VISA", ctc: 32.76, students: 4 },
// //     { company: "Barclays", ctc: 12.49, students: 13 },
// //     { company: "KPMG", ctc: 5, students: 7 },
// //     { company: "Deloitte USI", ctc: 7.6, students: 16 },
// //     { company: "Bank of America", ctc: 6.45, students: 34 },
// //     { company: "Deloitte IN", ctc: 7.6, students: 14 },
// //     { company: "Rite Technologies", ctc: 4.4, students: 1 },
// //     { company: "NetWeaver", ctc: 4.5, students: 4 },
// //     { company: "Amdocs", ctc: 5.3, students: 12 },
// //     { company: "Accenture", ctc: 4.5, students: 5 },
// //     { company: "Publicis Sapient", ctc: 4.58, students: 9 },
// //     { company: "HSBC", ctc: 9, students: 2 },
// //     { company: "Capgemini", ctc: 4.25, students: 19 },
// //     { company: "ExcelR", ctc: 6, students: 2 },
// //     { company: "Argon & Co.", ctc: 4, students: 1 },
// //     { company: "IIDE", ctc: 7.2, students: 10 },
// //     { company: "Eduvanz", ctc: 6, students: 2 },
// //     { company: "Colgate Palmolive", ctc: 2, students: 2 },
// //     { company: "CleverTap", ctc: 6, students: 1 },
// //   ];

// //   return (
// //     <div className="chart-wrapper">
// //       <CTCWaveChart data={companyData} />
// //     </div>
// //   );
// // };

// // export default App;

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CTCBarChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.company),
    datasets: [
      {
        label: "CTC (LPA)",
        data: data.map((item) => item.ctc),
        backgroundColor: "rgba(0, 48, 73, 0.7)",
        borderColor: "#003049",
        borderWidth: 2,
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function (tooltipItem) {
          const students = data[tooltipItem.dataIndex].students;
          return `CTC: ${tooltipItem.raw} LPA, Students: ${students}`;
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      ticks: {
        display: false,
        padding: 12,
        maxRotation: 75,
        minRotation: 45,
      },
      grid: { display: false },
      barPercentage: 2.0,
      categoryPercentage: 5.0,
    },
    y: {
      beginAtZero: true,
      min: 0,
      max: 35,
      ticks: {
        stepSize: 2,
        color: "#003049",
        font: { size: 12 },
      },
      title: {
        display: true,
        text: "CTC Offered (LPA)",
        color: "#003049",
        font: { size: 14 },
      },
      grid: {
        color: "#e5e7eb",
        borderDash: [2, 4],
      },
    },
  },
};


  return (
    <div style={{ maxWidth: 1200, width: "100%", height: 240 }}>
      <Bar data={chartData} options={options} height={240} />
    </div>
  );
};

const App = () => {
  const companyData = [
    { company: "Oracle", ctc: 1, students: 1 },
    { company: "Deutsche Bank", ctc: 7, students: 7 },
    { company: "JP Morgan Chase & Co.", ctc: 19.75, students: 1 },
    { company: "VISA", ctc: 32.76, students: 4 },
    { company: "Barclays", ctc: 12.49, students: 13 },
    { company: "KPMG", ctc: 5, students: 7 },
    { company: "Deloitte USI", ctc: 7.6, students: 16 },
    { company: "Bank of America", ctc: 6.45, students: 34 },
    { company: "Deloitte IN", ctc: 7.6, students: 14 },
    { company: "Rite Technologies", ctc: 4.4, students: 1 },
    { company: "NetWeaver", ctc: 4.5, students: 4 },
    { company: "Amdocs", ctc: 5.3, students: 12 },
    { company: "Accenture", ctc: 4.5, students: 5 },
    { company: "Publicis Sapient", ctc: 4.58, students: 9 },
    { company: "HSBC", ctc: 9, students: 2 },
    { company: "Capgemini", ctc: 4.25, students: 19 },
    { company: "ExcelR", ctc: 6, students: 2 },
    { company: "Argon & Co.", ctc: 4, students: 1 },
    { company: "IIDE", ctc: 7.2, students: 10 },
    { company: "Eduvanz", ctc: 6, students: 2 },
    { company: "Colgate Palmolive", ctc: 2, students: 2 },
    { company: "CleverTap", ctc: 6, students: 1 },
  ];

  return (
    <div>
      <CTCBarChart data={companyData} />
    </div>
  );
};

export default App;

