"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminApi } from "@/lib/adminApi";

interface KbEntry {
  _id: string;
  title: string;
  content: string;
  category: string;
}

interface Props {
  initial: KbEntry[];
}

export function ChatbotClient({ initial }: Props) {
  const [rows, setRows] = React.useState(initial);
  const [editing, setEditing] = React.useState<KbEntry | null>(null);
  const [deleting, setDeleting] = React.useState<KbEntry | null>(null);
  const [busy, setBusy] = React.useState(false);

  const save = async (entry: KbEntry) => {
    setBusy(true);
    try {
      if (entry._id) {
        const updated = await adminApi.put<KbEntry>(`/api/admin/chatbot/${entry._id}`, {
          title: entry.title,
          content: entry.content,
          category: entry.category,
        });
        setRows((p) => p.map((r) => (r._id === updated._id ? updated : r)));
      } else {
        const created = await adminApi.post<KbEntry>("/api/admin/chatbot", {
          title: entry.title,
          content: entry.content,
          category: entry.category,
        });
        setRows((p) => [created, ...p]);
      }
      toast.success("Saved");
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminApi.delete(`/api/admin/chatbot/${deleting._id}`);
      setRows((p) => p.filter((r) => r._id !== deleting._id));
      toast.success("Deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const columns: DataTableColumn<KbEntry>[] = [
    {
      key: "title",
      header: "Title",
      sortValue: (r) => r.title.toLowerCase(),
      render: (r) => <div style={{ fontWeight: 600 }}>{r.title}</div>,
    },
    { key: "category", header: "Category", sortValue: (r) => r.category, width: "140px", render: (r) => r.category },
    {
      key: "content",
      header: "Excerpt",
      render: (r) => <span className="t-small">{r.content.slice(0, 90)}{r.content.length > 90 ? "…" : ""}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "140px",
      render: (r) => (
        <div className="admin-table-actions">
          <button type="button" className="admin-icon-btn" onClick={() => setEditing(r)}>
            <Icon name="code" size={12} /> Edit
          </button>
          <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => setDeleting(r)}>
            <Icon name="x" size={12} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        rows={rows}
        rowKey={(r) => r._id}
        columns={columns}
        search={(r) => `${r.title} ${r.category} ${r.content}`}
        searchPlaceholder="Search KB…"
        toolbar={
          <Btn
            size="sm"
            type="button"
            onClick={() => setEditing({ _id: "", title: "", content: "", category: "general" })}
          >
            <Icon name="plus" size={12} /> New entry
          </Btn>
        }
      />

      {editing && (
        <ChatbotEditModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={save}
          busy={busy}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete KB entry?"
        message={deleting ? `Delete "${deleting.title}"?` : ""}
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

function ChatbotEditModal({
  initial,
  onClose,
  onSave,
  busy,
}: {
  initial: KbEntry;
  onClose: () => void;
  onSave: (entry: KbEntry) => void;
  busy: boolean;
}) {
  const [entry, setEntry] = React.useState(initial);

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--lg" onClick={(e) => e.stopPropagation()}>
        <h3>{initial._id ? "Edit KB entry" : "New KB entry"}</h3>
        <div className="admin-modal__body" style={{ display: "grid", gap: 14 }}>
          <div className="field">
            <label className="field__label">Title</label>
            <input className="input" value={entry.title} onChange={(e) => setEntry({ ...entry, title: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label">Category</label>
            <input className="input" value={entry.category} onChange={(e) => setEntry({ ...entry, category: e.target.value })} />
          </div>
          <div className="field">
            <label className="field__label">Content</label>
            <textarea
              className="textarea"
              value={entry.content}
              onChange={(e) => setEntry({ ...entry, content: e.target.value })}
              style={{ minHeight: 160 }}
            />
          </div>
        </div>
        <div className="admin-modal__actions">
          <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
          <Btn
            type="button"
            disabled={busy || !entry.title.trim() || !entry.content.trim()}
            onClick={() => onSave(entry)}
          >
            {busy ? "Saving…" : "Save"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
