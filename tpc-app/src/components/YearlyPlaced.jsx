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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const YearlyPlaced = () => {
  const data = {
    labels: ["19-20", "20-21", "21-22", "22-23", "23-24"],
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
     layout: {
    padding: {
      top: 20,    // ← add this — gives breathing room so top points aren't clipped
      right: 10,
    }
  },
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
    <div style={{ width: "90%", margin: "auto", paddingTop: "8px" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default YearlyPlaced;
