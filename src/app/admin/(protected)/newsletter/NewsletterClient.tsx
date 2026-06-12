"use client";

import * as React from "react";
import { DataTable, type DataTableColumn, type DataTableFilter } from "@/components/admin/DataTable";
import { formatDate } from "@/lib/utils";

interface Subscriber {
  email: string;
  source: string;
  unsubscribed: boolean;
  subscribedAt: string;
}

export function NewsletterClient({ initial }: { initial: Subscriber[] }) {
  const active = initial.filter((s) => !s.unsubscribed).length;

  const columns: DataTableColumn<Subscriber>[] = [
    {
      key: "email",
      header: "Email",
      sortValue: (r) => r.email.toLowerCase(),
      csvValue: (r) => r.email,
      render: (r) => <span style={{ fontWeight: 600 }}>{r.email}</span>,
    },
    {
      key: "source",
      header: "Source",
      width: "160px",
      sortValue: (r) => r.source,
      csvValue: (r) => r.source,
      render: (r) => r.source || "—",
    },
    {
      key: "status",
      header: "Status",
      width: "140px",
      sortValue: (r) => String(r.unsubscribed),
      csvValue: (r) => (r.unsubscribed ? "unsubscribed" : "active"),
      render: (r) => (
        <span className={`admin-status admin-status--${r.unsubscribed ? "closed" : "published"}`}>
          {r.unsubscribed ? "Unsubscribed" : "Active"}
        </span>
      ),
    },
    {
      key: "subscribedAt",
      header: "Subscribed",
      width: "150px",
      sortValue: (r) => r.subscribedAt,
      csvValue: (r) => r.subscribedAt,
      render: (r) => <span className="t-small">{formatDate(r.subscribedAt)}</span>,
    },
  ];

  const filters: DataTableFilter<Subscriber>[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "unsubscribed", label: "Unsubscribed" },
      ],
      match: (r, v) => (v === "unsubscribed") === r.unsubscribed,
    },
  ];

  return (
    <DataTable
      rows={initial}
      rowKey={(r) => r.email}
      columns={columns}
      search={(r) => `${r.email} ${r.source}`}
      searchPlaceholder="Search email…"
      urlKey="newsletter"
      filters={filters}
      selectable
      exportFilename="wdd-newsletter"
      toolbar={
        <span className="t-small" style={{ color: "var(--c-text-muted)" }}>
          {active} active / {initial.length} total
        </span>
      }
    />
  );
}
