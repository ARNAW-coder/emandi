import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = { GREEN: "#16a34a", YELLOW: "#eab308", RED: "#dc2626" };

export default function MandiDensityChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="currentlyWaiting">
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[entry.density]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}