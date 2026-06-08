"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: Array<{ date: string; totalRelationships: number; newRelationships: number; avgScore: number }>;
}

export function TrustMetricsChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="totalRelationships"
          stroke="hsl(221.2 83.2% 53.3%)"
          name="Total Relationships"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="newRelationships"
          stroke="hsl(142.1 76.2% 36.3%)"
          name="New (daily)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
