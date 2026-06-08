"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = [
  "hsl(221.2 83.2% 53.3%)",
  "hsl(142.1 76.2% 36.3%)",
  "hsl(47.9 95.8% 53.1%)",
  "hsl(0 72.2% 50.6%)",
  "hsl(280 100% 70%)",
];

interface Props {
  data: Array<{ assetCode: string; volume: string; txCount: number }>;
}

export function AssetPieChart({ data }: Props) {
  const formatted = data.slice(0, 5).map((d) => ({
    name: d.assetCode,
    value: Number(d.volume),
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={formatted}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {formatted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) =>
            new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
