import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LabelList, Cell
} from "recharts";

const data = [
  { name: "Colgate Palmolive", stipend: 25000, offers: 19 },
  { name: "JP Morgan Chase", stipend: 75000, offers: 1 },
  { name: "GE Aerospace", stipend: 40000, offers: 3 },
  { name: "NVIDIA", stipend: 40000, offers: 5 },
  { name: "KPMG", stipend: 20000, offers: 2 },
  { name: "Siemens", stipend: 15000, offers: 2 },
];

const formatStipend = (value) =>
  value >= 1000 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value}`;

const InternshipStatistics = () => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
        >
          <XAxis
            type="number"
            dataKey="stipend"
            tickFormatter={formatStipend}
            tick={{ fill: "#003049", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#003049", fontSize: 11 }}
            width={110}              /* enough room for long names */
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`₹${value.toLocaleString()}`, "Stipend"]}
            cursor={{ fill: "rgba(0,48,73,0.06)" }}
          />
          <Bar dataKey="stipend" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((_, i) => (
              <Cell key={i} fill="#003049" fillOpacity={1 - i * 0.1} />
            ))}
            <LabelList
              dataKey="stipend"
              position="right"
              formatter={formatStipend}
              style={{ fill: "#003049", fontSize: 11, fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InternshipStatistics;