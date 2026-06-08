"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: Array<{ date: string; volume: string; txCount: number }>;
  title?: string;
}

export function VolumeChart({ data, title = "Daily Volume" }: Props) {
  const formatted = data.map((d) => ({
    date: d.date,
    volume: Number(d.volume),
    txCount: d.txCount,
  }));

  return (
    <div>
      {title && <p className="text-sm font-medium mb-4">{title}</p>}
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={formatted}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v) =>
              new Intl.NumberFormat("en", { notation: "compact" }).format(v)
            }
          />
          <Tooltip
            formatter={(v: number) => [
              new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v),
              "Volume",
            ]}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="hsl(221.2 83.2% 53.3%)"
            fill="url(#colorVolume)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
