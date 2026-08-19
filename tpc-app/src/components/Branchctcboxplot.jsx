import "./styles/Branchctcboxplot.css";

const data = [
  { branch: "CST", min: 4,   q1: 5,    median: 7,    q3: 12,  max: 32.76 },
  { branch: "CE",  min: 4,   q1: 4.5,  median: 6.45, q3: 9,   max: 19.75 },
  { branch: "ENC", min: 4,   q1: 4.25, median: 5,    q3: 7,   max: 12.49 },
  { branch: "DS",  min: 4,   q1: 4.4,  median: 6,    q3: 7.2, max: 9     },
  { branch: "IT",  min: 4.5, q1: 4.5,  median: 5.3,  q3: 6,   max: 7.6   },
];

const Y_MIN = 0;
const Y_MAX = 35;
const Y_TICKS = [0, 5, 10, 15, 20, 25, 30, 35];

const PAD = { top: 16, right: 16, bottom: 36, left: 44 };

const BranchCTCBoxPlot = () => {
  const W = 480;
  const H = 220;
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top  - PAD.bottom;

  const yScale  = (v) => cH - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * cH;
  const slotW   = cW / data.length;
  const boxW    = slotW * 0.42;

  const tooltipItems = data.map((d) => ({
    branch: d.branch,
    median: d.median,
    iqr: `${d.q1}–${d.q3}`,
    range: `${d.min}–${d.max}`,
  }));

  return (
    <div className="boxplot-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        style={{ display: "block" }}
        aria-label="Box plot of CTC by branch"
      >
        <g transform={`translate(${PAD.left},${PAD.top})`}>

          {/* y-axis grid + labels */}
          {Y_TICKS.map((t) => (
            <g key={t}>
              <line
                x1={0} y1={yScale(t)} x2={cW} y2={yScale(t)}
                stroke="#e5e7eb" strokeDasharray="2,4" strokeWidth={0.8}
              />
              <text
                x={-6} y={yScale(t) + 4}
                textAnchor="end" fontSize={9} fill="#003049"
              >{t}</text>
            </g>
          ))}

          {/* y-axis title */}
          <text
            transform={`translate(-36,${cH / 2}) rotate(-90)`}
            textAnchor="middle" fontSize={10} fill="#003049"
          >LPA</text>

          {/* box plots */}
          {data.map((d, i) => {
            const cx  = slotW * i + slotW / 2;
            const bx  = cx - boxW / 2;
            const cap = boxW * 0.35;

            return (
              <g key={d.branch}>
                {/* whisker centre line */}
                <line
                  x1={cx} y1={yScale(d.max)}
                  x2={cx} y2={yScale(d.min)}
                  stroke="#003049" strokeWidth={1.5}
                />
                {/* upper cap */}
                <line
                  x1={cx - cap} y1={yScale(d.max)}
                  x2={cx + cap} y2={yScale(d.max)}
                  stroke="#003049" strokeWidth={1.5}
                />
                {/* lower cap */}
                <line
                  x1={cx - cap} y1={yScale(d.min)}
                  x2={cx + cap} y2={yScale(d.min)}
                  stroke="#003049" strokeWidth={1.5}
                />
                {/* IQR box */}
                <rect
                  x={bx} y={yScale(d.q3)}
                  width={boxW}
                  height={Math.max(yScale(d.q1) - yScale(d.q3), 2)}
                  fill="#5FA8D3" fillOpacity={0.65}
                  stroke="#003049" strokeWidth={1.5}
                  rx={2}
                />
                {/* median line */}
                <line
                  x1={bx} y1={yScale(d.median)}
                  x2={bx + boxW} y2={yScale(d.median)}
                  stroke="#003049" strokeWidth={2.5}
                />
                {/* branch label */}
                <text
                  x={cx} y={cH + 22}
                  textAnchor="middle" fontSize={10} fill="#003049"
                >{d.branch}</text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* legend */}
      <div className="boxplot-legend">
        <span className="boxplot-legend-item">
          <span className="legend-box iqr-box" /> IQR (Q1–Q3)
        </span>
        <span className="boxplot-legend-item">
          <span className="legend-line median-line" /> Median
        </span>
        <span className="boxplot-legend-item">
          <span className="legend-line whisker-line" /> Min / Max
        </span>
      </div>

      {/* summary row */}
      <div className="boxplot-summary">
        {tooltipItems.map((t) => (
          <div key={t.branch} className="boxplot-summary-cell">
            <span className="summary-branch">{t.branch}</span>
            <span className="summary-median">Median {t.median} LPA</span>
            <span className="summary-range">Range {t.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BranchCTCBoxPlot;
