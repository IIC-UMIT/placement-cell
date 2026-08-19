import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid
} from "recharts";

const data = [
  { company: "NVIDIA",            ctc: 40 },
  { company: "Google",            ctc: 32 },
  { company: "Microsoft",         ctc: 28 },
  { company: "Amazon",            ctc: 22 },
  { company: "JP Morgan",         ctc: 18 },
  { company: "GE Aerospace",      ctc: 14 },
  { company: "Visa",              ctc: 32 },
  { company: "Capgemini",         ctc: 8  },
  { company: "Infosys",           ctc: 7  },
  { company: "TCS",               ctc: 7  },
  { company: "Wipro",             ctc: 6  },
  { company: "Cognizant",         ctc: 5  },
  { company: "KPMG",              ctc: 8  },
  { company: "Siemens",           ctc: 6  },
  { company: "Colgate Palmolive", ctc: 6  },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(0,0,0,0.75)",
        borderRadius: "6px",
        padding: "6px 10px",
        border: "none",
      }}>
        <p style={{ color: "#fff", margin: 0, fontSize: 11, fontWeight: 600 }}>
          {payload[0].payload.company}
        </p>
        <p style={{ color: "#5FA8D3", margin: "2px 0 0", fontSize: 11 }}>
          {payload[0].value} LPA
        </p>
      </div>
    );
  }
  return null;
};

const CtcHighlight = ({ activeIndex, setActiveIndex }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, left: -20, bottom: 8 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#e0e0e0"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="company"
            tick={false}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={false}          
            axisLine={false}
            tickLine={false}
            label={null}          
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={false}         
          />
          <Bar
            dataKey="ctc"
            radius={[4, 4, 0, 0]}
            barSize={18}
            maxBarSize={24}
            onMouseEnter={(_, index) => setActiveIndex?.(index)}
            onMouseLeave={() => setActiveIndex?.(null)}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill="#003049"
                fillOpacity={
                  activeIndex === null || activeIndex === undefined || activeIndex === i
                    ? 1
                    : 0.35        
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CtcHighlight;
