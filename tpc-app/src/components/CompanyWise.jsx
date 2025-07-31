// import React, { useRef, useEffect } from "react";
// import './styles/YearlyPlaced.css';

// const YearlyPlaced = () => {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     const cx = cw / 2,
//       cy = ch / 2;
//     const rad = Math.PI / 180;
//     let frames = 0;

//     ctx.lineWidth = 2;
//     ctx.strokeStyle = "#";
//     ctx.fillStyle = "#FFFFFF";
//     ctx.font = "14px monospace";

//     // 🌑 Darker Gradient
//     const grd = ctx.createLinearGradient(0, 0, 0, cy);
//     grd.addColorStop(0, "hsla(167, 85%, 30%, 1)"); // Darker teal
//     grd.addColorStop(1, "hsla(167, 85%, 30%, 0.2)"); // Reduced transparency for more depth

//     const oData = {
//       "2019-2020": 109,
//       "2020-2021": 159,
//       "2021-2022": 177,
//       "2022-2023": 199,
//       "2023-2024": 199,
//     };

//     const valuesRy = Object.values(oData);
//     const propsRy = Object.keys(oData);

//     const vData = 4;
//     const hData = valuesRy.length;
//     const offset = 50.5;
//     const chartHeight = ch - 2 * offset;
//     const chartWidth = cw - 2 * offset;
//     const t = 1 / 7;
//     const speed = 2;

//     const A = { x: offset, y: offset };
//     const B = { x: offset, y: offset + chartHeight };
//     const C = { x: offset + chartWidth, y: offset + chartHeight };

//     ctx.beginPath();
//     ctx.moveTo(A.x, A.y);
//     ctx.lineTo(B.x, B.y);
//     ctx.lineTo(C.x, C.y);
//     ctx.stroke();

//     const aStep = (chartHeight - 50) / vData;
//     const Max = Math.ceil(Math.max(...valuesRy) / 10) * 10;
//     const Min = 100;
//     const aStepValue = (Max - Min) / vData;
//     const verticalUnit = aStep / aStepValue;

//     let oDots = valuesRy.map((val, i) => ({
//       x: B.x + (i + 1) * (chartWidth / (hData + 1)),
//       y: B.y - (val - Min) * verticalUnit - 25,
//       val,
//     }));

//     let oFlat = oDots.map((dot) => ({ x: dot.x, y: B.y - 25 }));

//     function animateChart() {
//       let requestId = window.requestAnimationFrame(animateChart);
//       frames += speed;
//       ctx.clearRect(60, 0, cw, ch - 60);
//       for (let i = 0; i < oFlat.length; i++) {
//         if (oFlat[i].y > oDots[i].y) {
//           oFlat[i].y -= speed;
//         }
//       }
//       drawCurve(oFlat);
//       oFlat.forEach((dot, i) => {
//         ctx.fillText(oDots[i].val, dot.x, dot.y - 25);
//         ctx.beginPath();
//         ctx.arc(dot.x, dot.y, 3, 0, 2 * Math.PI);
//         ctx.fill();
//       });
//       if (frames >= (Max - Min) * verticalUnit) {
//         window.cancelAnimationFrame(requestId);
//       }
//     }
//     animateChart();

//     function drawCurve(p) {
//       let pc = controlPoints(p);
//       ctx.beginPath();
//       ctx.moveTo(p[0].x, p[0].y);
//       ctx.quadraticCurveTo(pc[1][1].x, pc[1][1].y, p[1].x, p[1].y);
//       for (let i = 1; i < p.length - 2; i++) {
//         ctx.bezierCurveTo(
//           pc[i][0].x,
//           pc[i][0].y,
//           pc[i + 1][1].x,
//           pc[i + 1][1].y,
//           p[i + 1].x,
//           p[i + 1].y
//         );
//       }
//       let n = p.length - 1;
//       ctx.quadraticCurveTo(pc[n - 1][0].x, pc[n - 1][0].y, p[n].x, p[n].y);
//       ctx.stroke();
//     }

//     function controlPoints(p) {
//       let pc = [];
//       for (let i = 1; i < p.length - 1; i++) {
//         let dx = p[i - 1].x - p[i + 1].x;
//         let dy = p[i - 1].y - p[i + 1].y;
//         pc[i] = [
//           { x: p[i].x - dx * t, y: p[i].y - dy * t },
//           { x: p[i].x + dx * t, y: p[i].y + dy * t },
//         ];
//       }
//       return pc;
//     }
//   }, []);

//   return (
//     <div className="wrapper">
//       <canvas style={{height: "250px", width: "700px"}} ref={canvasRef}></canvas>
//     </div>
//   );
// };

// export default YearlyPlaced;