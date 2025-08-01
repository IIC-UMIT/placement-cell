// src/chartSetup.js

import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
  } from 'chart.js';
  
  ChartJS.register(
    LineElement,
    PointElement,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
  );
  