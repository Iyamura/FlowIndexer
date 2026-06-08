"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: Array<{ country: string; volume: string; txCount: number }>;
}

export function CountryChart({ data }: Props) {
  const formatted = data.slice(0, 10).map((d) => ({
    country: d.country,
    volume: Number(d.volume),
    txCount: d.txCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={formatted} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => new Intl.NumberFormat("en", { notation: "compact" }).format(v)}
        />
        <YAxis dataKey="country" type="category" tick={{ fontSize: 11 }} width={40} />
        <Tooltip
          formatter={(v: number) => [
            new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v),
            "Volume",
          ]}
        />
        <Bar dataKey="volume" fill="hsl(221.2 83.2% 53.3%)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
