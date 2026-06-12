"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Point {
  _id: string;
  count: number;
}

interface Props {
  data: Point[];
}

export function InquiriesChart({ data }: Props) {
  // Fill missing days for a smooth 30-day chart
  const dataMap = new Map(data.map((d) => [d._id, d.count]));
  const points: { date: string; label: string; count: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    points.push({
      date: iso,
      label: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      count: dataMap.get(iso) ?? 0,
    });
  }

  return (
    <div className="admin-card" style={{ height: 320 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Inquiries — last 30 days</h3>
        <span className="t-small" style={{ fontSize: 12 }}>
          {points.reduce((s, p) => s + p.count, 0)} total
        </span>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={points} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E5EAF2" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} width={32} />
          <Tooltip
            cursor={{ stroke: "#2563EB", strokeWidth: 1 }}
            contentStyle={{ borderRadius: 8, border: "1px solid #E5EAF2", fontSize: 12 }}
          />
          <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} fill="url(#gradPrimary)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
