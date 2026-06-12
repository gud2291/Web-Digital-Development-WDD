"use client";

import * as React from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Mail,
  FileText,
  Rocket,
  Wrench,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { useThemeMode } from "@/hooks/useThemeMode";
import { formatDate } from "@/lib/utils";

type Status = "new" | "viewed" | "replied" | "closed";

interface StatsResponse {
  counts: { contacts: number; newContacts: number; blogs: number; services: number; projects: number; testimonials: number };
  inquiriesDelta: { pct: number; dir: "up" | "down" | "flat" };
  statusBreakdown: Record<Status, number>;
  chartDays: number;
  dailyInquiries: { _id: string; count: number }[];
  recentInquiries: { _id: string; name: string; email: string; service?: string; message: string; status: Status; createdAt: string }[];
}

const PERIODS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last year", value: 365 },
];

const STATUS_META: { key: Status; label: string; color: string }[] = [
  { key: "new", label: "New", color: "#2563EB" },
  { key: "viewed", label: "Viewed", color: "#F59E0B" },
  { key: "replied", label: "Replied", color: "#16A34A" },
  { key: "closed", label: "Closed", color: "#94A3B8" },
];

function fillDays(daily: { _id: string; count: number }[], days: number) {
  const map = new Map(daily.map((d) => [d._id, d.count]));
  const points: { label: string; count: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    points.push({
      label: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      count: map.get(iso) ?? 0,
    });
  }
  return points;
}

export function DashboardClient() {
  const [data, setData] = React.useState<StatsResponse | null>(null);
  const [days, setDays] = React.useState(30);
  const [loading, setLoading] = React.useState(true);
  const mode = useThemeMode();

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/dashboard/stats?days=${days}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load stats"))))
      .then((d: StatsResponse) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const points = data ? fillDays(data.dailyInquiries, data.chartDays || days) : [];
  const chartTotal = points.reduce((s, p) => s + p.count, 0);
  const statusTotal = data ? STATUS_META.reduce((s, m) => s + data.statusBreakdown[m.key], 0) : 0;
  const donutData = data
    ? STATUS_META.map((m) => ({ name: m.label, value: data.statusBreakdown[m.key], color: m.color })).filter(
        (d) => d.value > 0
      )
    : [];

  // §14.18 — chart colours follow the admin theme.
  const isDark = mode === "dark";
  const gridColor = isDark ? "#334155" : "#E5EAF2";
  const axisColor = isDark ? "#94A3B8" : "#64748B";
  const tooltipStyle: React.CSSProperties = {
    borderRadius: 8,
    border: `1px solid ${isDark ? "#334155" : "#E5EAF2"}`,
    background: isDark ? "#1F2937" : "#fff",
    color: isDark ? "#F1F5F9" : "#0F172A",
    fontSize: 12,
  };

  return (
    <>
      {/* Stat tiles */}
      <div className="admin-stat-grid">
        {loading || !data ? (
          <LoadingSkeleton variant="stat" count={4} />
        ) : (
          <>
            <StatTile
              label="Total Inquiries"
              value={data.counts.contacts}
              icon={Mail}
              color="#2563EB"
              delta={data.inquiriesDelta}
            />
            <StatTile label="Total Blogs" value={data.counts.blogs} icon={FileText} color="#8B5CF6" />
            <StatTile label="Total Projects" value={data.counts.projects} icon={Rocket} color="#F59E0B" />
            <StatTile label="Total Services" value={data.counts.services} icon={Wrench} color="#16A34A" />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="dash-split">
        <div className="admin-card">
          <div className="dash-panel-head">
            <h3>Inquiries (Last {days} Days)</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="t-small" style={{ fontWeight: 600 }}>{chartTotal} total</span>
              <select
                className="select dash-period"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                aria-label="Chart period"
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          {loading || !data ? (
            <LoadingSkeleton variant="chart" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={points} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: axisColor }} interval="preserveStartEnd" minTickGap={24} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: axisColor }} width={32} />
                <Tooltip cursor={{ stroke: "#2563EB", strokeWidth: 1 }} contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} fill="url(#dashGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="admin-card">
          <div className="dash-panel-head">
            <h3>Inquiries by Status</h3>
          </div>
          {loading || !data ? (
            <LoadingSkeleton variant="chart" />
          ) : statusTotal === 0 ? (
            <p className="t-small" style={{ padding: "40px 0", textAlign: "center" }}>No inquiries yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2} stroke="none">
                    {donutData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="dash-legend">
                {STATUS_META.map((m) => {
                  const count = data.statusBreakdown[m.key];
                  const pct = statusTotal ? Math.round((count / statusTotal) * 100) : 0;
                  return (
                    <div key={m.key} className="dash-legend__row">
                      <span className="dash-legend__dot" style={{ background: m.color }} />
                      <span className="dash-legend__name">{m.label}</span>
                      <span className="dash-legend__count">{count}</span>
                      <span className="dash-legend__pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent + quick actions */}
      <div className="dash-split">
        <div className="admin-card">
          <div className="dash-panel-head">
            <h3>Recent Inquiries</h3>
            <Link href="/admin/inquiries" className="t-small" style={{ color: "#2563EB", fontWeight: 600 }}>
              View All Inquiries →
            </Link>
          </div>
          {loading || !data ? (
            <LoadingSkeleton variant="row" count={5} />
          ) : data.recentInquiries.length === 0 ? (
            <p className="t-small" style={{ padding: "24px 0", textAlign: "center" }}>No inquiries yet.</p>
          ) : (
            <div>
              {data.recentInquiries.map((c) => (
                <Link key={c._id} href="/admin/inquiries" className="dash-recent__row" style={{ color: "inherit" }}>
                  <span className="dash-recent__name">{c.name}</span>
                  <span className="dash-recent__muted">{c.email}</span>
                  <span className="dash-recent__muted">{c.service || c.message?.slice(0, 30) || "—"}</span>
                  <span className="dash-recent__muted">{formatDate(c.createdAt)}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <StatusBadge kind={c.status} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="dash-panel-head">
            <h3>Quick Actions</h3>
          </div>
          <div className="dash-quick">
            <QuickAction href="/admin/blog/new" icon={Plus} label="Add New Blog" />
            <QuickAction href="/admin/projects/new" icon={Plus} label="Add New Project" />
            <QuickAction href="/admin/services/new" icon={Plus} label="Add New Service" />
            <QuickAction href="/admin/media" icon={Upload} label="Upload Media" />
          </div>
        </div>
      </div>
    </>
  );
}

function StatTile({
  label,
  value,
  icon: Glyph,
  color,
  delta,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  delta?: { pct: number; dir: "up" | "down" | "flat" };
}) {
  return (
    <div className="admin-card dash-tile">
      <div className="dash-tile__top">
        <span className="dash-tile__label">{label}</span>
        <span className="dash-tile__icon" style={{ background: `${color}1A`, color }}>
          <Glyph size={20} />
        </span>
      </div>
      <div className="dash-tile__value">{value.toLocaleString("en-IN")}</div>
      {delta ? (
        <span className={`dash-tile__delta dash-tile__delta--${delta.dir}`}>
          {delta.dir === "up" ? <ArrowUp size={14} /> : delta.dir === "down" ? <ArrowDown size={14} /> : <Minus size={14} />}
          {Math.abs(delta.pct)}% from last 30 days
        </span>
      ) : (
        <span className="dash-tile__delta dash-tile__delta--flat">All time</span>
      )}
    </div>
  );
}

function QuickAction({ href, icon: Glyph, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="dash-quick__btn">
      <Glyph size={16} />
      {label}
    </Link>
  );
}
