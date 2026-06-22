"use client";

import * as React from "react";
import { DataTable, type DataTableColumn, type DataTableFilter } from "@/components/admin/DataTable";
import { formatDate } from "@/lib/utils";

type SentVia = "download" | "email" | "whatsapp";

export interface QuotationRow {
  _id: string;
  quotationNo: string;
  clientName: string;
  email: string;
  phone: string;
  serviceTitle: string;
  costRange: string;
  sentVia: SentVia;
  pdfUrl: string;
  createdAt: string;
}

const SENT_VIA: { value: SentVia; label: string; color: string; bg: string }[] = [
  { value: "download", label: "Download", color: "#1D4ED8", bg: "#DBEAFE" },
  { value: "email", label: "Email", color: "#7C3AED", bg: "#EDE9FE" },
  { value: "whatsapp", label: "WhatsApp", color: "#15803D", bg: "#DCFCE7" },
];

function SentViaPill({ via }: { via: SentVia }) {
  const c = SENT_VIA.find((s) => s.value === via) ?? SENT_VIA[0];
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 999,
        color: c.color,
        background: c.bg,
      }}
    >
      {c.label}
    </span>
  );
}

export function QuotationsClient({ initial }: { initial: QuotationRow[] }) {
  const filters: DataTableFilter<QuotationRow>[] = [
    {
      key: "sentVia",
      label: "Sent via",
      options: SENT_VIA.map((s) => ({ value: s.value, label: s.label })),
      match: (r, v) => r.sentVia === v,
    },
    {
      key: "range",
      label: "Created",
      options: [
        { value: "7", label: "Last 7 days" },
        { value: "30", label: "Last 30 days" },
        { value: "90", label: "Last 90 days" },
      ],
      match: (r, v) => new Date(r.createdAt).getTime() >= Date.now() - Number(v) * 86400000,
    },
  ];

  const columns: DataTableColumn<QuotationRow>[] = [
    {
      key: "quotationNo",
      header: "Quote #",
      width: "110px",
      sortValue: (r) => r.quotationNo,
      render: (r) => <span style={{ fontWeight: 700 }}>{r.quotationNo}</span>,
    },
    {
      key: "clientName",
      header: "Client",
      sortValue: (r) => r.clientName.toLowerCase(),
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.clientName}</div>
          <div className="t-small" style={{ fontSize: 12 }}>{r.email || "—"}</div>
        </div>
      ),
    },
    { key: "phone", header: "Phone", width: "140px", render: (r) => r.phone || "—" },
    { key: "serviceTitle", header: "Service", sortValue: (r) => r.serviceTitle, render: (r) => r.serviceTitle || "—" },
    { key: "costRange", header: "Cost shown", width: "150px", render: (r) => r.costRange || "—" },
    {
      key: "sentVia",
      header: "Sent via",
      width: "120px",
      sortValue: (r) => r.sentVia,
      render: (r) => <SentViaPill via={r.sentVia} />,
    },
    {
      key: "createdAt",
      header: "Date",
      width: "130px",
      sortValue: (r) => r.createdAt,
      render: (r) => <span className="t-small">{formatDate(r.createdAt)}</span>,
    },
    {
      key: "pdf",
      header: "",
      width: "70px",
      render: (r) =>
        r.pdfUrl ? (
          <a href={r.pdfUrl} target="_blank" rel="noopener noreferrer" className="admin-icon-btn">
            PDF
          </a>
        ) : (
          <span className="t-small">—</span>
        ),
    },
  ];

  return (
    <DataTable
      rows={initial}
      rowKey={(r) => r._id}
      columns={columns}
      search={(r) => `${r.quotationNo} ${r.clientName} ${r.email} ${r.phone} ${r.serviceTitle}`}
      searchPlaceholder="Search by number, client, phone, service…"
      urlKey="quotations"
      filters={filters}
      exportFilename="quotations"
    />
  );
}
