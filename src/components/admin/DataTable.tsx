"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2, Download, ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
import { useAdminSearchStore } from "@/store/adminSearch";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  csvValue?: (row: T) => string | number;
  inlineEdit?: {
    value: (row: T) => string;
    onSave: (row: T, value: string) => void | Promise<void>;
    placeholder?: string;
  };
  width?: string;
}

/** §15.9 — a filter dropdown rendered below the search toolbar. */
export interface DataTableFilter<T> {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  /** Returns true if the row passes the chosen value. */
  match: (row: T, value: string) => boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface Props<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  search?: (row: T) => string;
  searchPlaceholder?: string;
  pageSize?: number;
  empty?: React.ReactNode;
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onBulkDelete?: (rows: T[]) => void | Promise<void>;
  statusOptions?: { value: string; label: string }[];
  onBulkStatus?: (rows: T[], status: string) => void | Promise<void>;
  exportFilename?: string;
  loading?: boolean;
  /** §15.9 — filter chips below the search bar. */
  filters?: DataTableFilter<T>[];
  /** §15.9 — persist search/sort/page/filters to the URL under this key. */
  urlKey?: string;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  search,
  searchPlaceholder = "Search…",
  pageSize: initialPageSize = 20,
  empty,
  toolbar,
  onRowClick,
  selectable,
  onBulkDelete,
  statusOptions,
  onBulkStatus,
  exportFilename = "export",
  loading,
  filters,
  urlKey,
}: Props<T>) {
  const confirm = useConfirm();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlEnabled = !!urlKey;

  // Hydrate initial state from the URL once (so refresh keeps filters).
  const initial = React.useMemo(() => {
    const get = (k: string) => (urlEnabled ? searchParams.get(k) ?? "" : "");
    const f: Record<string, string> = {};
    (filters ?? []).forEach((flt) => {
      const v = get(`f_${flt.key}`);
      if (v) f[flt.key] = v;
    });
    return {
      q: get("q"),
      sort: get("sort") || null,
      dir: (get("dir") === "desc" ? "desc" : "asc") as "asc" | "desc",
      page: Number(get("page")) || 1,
      size: Number(get("size")) || initialPageSize,
      filters: f,
    };
    // Only read the URL on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const query = useAdminSearchStore((s) => s.query);
  const setQuery = useAdminSearchStore((s) => s.setQuery);
  const setPlaceholder = useAdminSearchStore((s) => s.setPlaceholder);
  const reset = useAdminSearchStore((s) => s.reset);

  const [searchInput, setSearchInput] = React.useState(initial.q);
  const [page, setPage] = React.useState(initial.page);
  const [pageSize, setPageSize] = React.useState(initial.size);
  const [sortKey, setSortKey] = React.useState<string | null>(initial.sort);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">(initial.dir);
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>(initial.filters);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [editing, setEditing] = React.useState<{ rowId: string; colKey: string; value: string } | null>(null);
  const [busy, setBusy] = React.useState(false);

  // Register placeholder + seed the shared query from the URL on mount.
  React.useEffect(() => {
    if (search) setPlaceholder(searchPlaceholder);
    if (initial.q) setQuery(initial.q);
    return () => {
      if (search) reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // §15.9 — debounce the search input (300ms) into the shared query.
  React.useEffect(() => {
    const id = window.setTimeout(() => setQuery(searchInput), 300);
    return () => window.clearTimeout(id);
  }, [searchInput, setQuery]);

  // Reset to page 1 when the result set changes (skip first run to honour URL).
  const firstRun = React.useRef(true);
  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setPage(1);
  }, [query, rows.length, pageSize, filterValues]);

  // §15.9 — persist state to the URL.
  React.useEffect(() => {
    if (!urlEnabled) return;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sortKey) {
      params.set("sort", sortKey);
      params.set("dir", sortDir);
    }
    if (page > 1) params.set("page", String(page));
    if (pageSize !== initialPageSize) params.set("size", String(pageSize));
    for (const [k, v] of Object.entries(filterValues)) if (v) params.set(`f_${k}`, v);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [urlEnabled, query, sortKey, sortDir, page, pageSize, filterValues, pathname, router, initialPageSize]);

  const filtered = React.useMemo(() => {
    let list = rows;
    if (filters?.length) {
      for (const f of filters) {
        const v = filterValues[f.key];
        if (v) list = list.filter((r) => f.match(r, v));
      }
    }
    if (search && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) => search(r).toLowerCase().includes(q));
    }
    return list;
  }, [rows, filters, filterValues, search, query]);

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize);
  const selectedRows = React.useMemo(
    () => sorted.filter((r) => selected.has(rowKey(r))),
    [sorted, selected, rowKey]
  );

  const onSort = (key: string) => {
    const col = columns.find((c) => c.key === key);
    if (!col?.sortValue) return;
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allVisibleSelected = visible.length > 0 && visible.every((r) => selected.has(rowKey(r)));
  const toggleAllVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visible.forEach((r) => next.delete(rowKey(r)));
      else visible.forEach((r) => next.add(rowKey(r)));
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedRows.length === 0) return;
    const ok = await confirm({
      title: `Delete ${selectedRows.length} item${selectedRows.length > 1 ? "s" : ""}?`,
      message: "This action is permanent and cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await onBulkDelete(selectedRows);
      toast.success(`Deleted ${selectedRows.length} item${selectedRows.length > 1 ? "s" : ""}`);
      clearSelection();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk delete failed");
    } finally {
      setBusy(false);
    }
  };

  const handleBulkStatus = async (status: string) => {
    if (!onBulkStatus || !status || selectedRows.length === 0) return;
    setBusy(true);
    try {
      await onBulkStatus(selectedRows, status);
      toast.success("Status updated");
      clearSelection();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Status update failed");
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const list = selectedRows.length ? selectedRows : sorted;
    const cols = columns.filter((c) => c.csvValue || c.sortValue);
    const header = cols.length ? cols.map((c) => c.header) : ["value"];
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = list.map((r) =>
      (cols.length ? cols.map((c) => (c.csvValue ?? c.sortValue)!(r)) : [search ? search(r) : rowKey(r)])
        .map(escape)
        .join(",")
    );
    const csv = [header.map(escape).join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${list.length} rows`);
  };

  const commitEdit = async (row: T, col: DataTableColumn<T>) => {
    if (!editing || !col.inlineEdit) return;
    const value = editing.value;
    setEditing(null);
    try {
      await col.inlineEdit.onSave(row, value);
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const activeFilterCount = Object.values(filterValues).filter(Boolean).length;
  const clearFilters = () => {
    setFilterValues({});
    setSearchInput("");
  };

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-toolbar">
        {search ? (
          <input
            className="input"
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        ) : null}
        <div style={{ flex: 1 }} />
        {toolbar}
      </div>

      {/* §15.9 — filter chips */}
      {filters?.length ? (
        <div className="admin-filterbar">
          {filters.map((f) => (
            <label key={f.key} className="admin-filterbar__group">
              <span>{f.label}</span>
              <select
                className="select"
                value={filterValues[f.key] ?? ""}
                onChange={(e) =>
                  setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
              >
                <option value="">All</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {activeFilterCount > 0 || searchInput ? (
            <button type="button" className="admin-icon-btn" onClick={clearFilters}>
              <X size={13} /> Clear
            </button>
          ) : null}
        </div>
      ) : null}

      {/* §15.8 — sticky bulk-action bar */}
      {selectable && selectedRows.length > 0 ? (
        <div className="admin-bulkbar">
          <span className="admin-bulkbar__count">{selectedRows.length} selected</span>
          <div style={{ flex: 1 }} />
          {onBulkStatus && statusOptions?.length ? (
            <select
              className="select admin-bulkbar__select"
              defaultValue=""
              disabled={busy}
              onChange={(e) => {
                const v = e.target.value;
                e.target.value = "";
                if (v) handleBulkStatus(v);
              }}
            >
              <option value="">Change status…</option>
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : null}
          <button type="button" className="admin-icon-btn" onClick={exportCsv} disabled={busy}>
            <Download size={14} /> Export CSV
          </button>
          {onBulkDelete ? (
            <button
              type="button"
              className="admin-icon-btn admin-icon-btn--danger"
              onClick={handleBulkDelete}
              disabled={busy}
            >
              <Trash2 size={14} /> Delete
            </button>
          ) : null}
          <button type="button" className="admin-icon-btn" onClick={clearSelection} disabled={busy}>
            Clear
          </button>
        </div>
      ) : null}

      {loading ? (
        <div style={{ padding: 16 }}>
          <LoadingSkeleton variant="row" count={6} />
        </div>
      ) : sorted.length === 0 ? (
        <div className="admin-table-empty">
          {empty ?? <EmptyState title="No items found" description="Try adjusting your search or filters." />}
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  {selectable ? (
                    <th style={{ width: 44 }}>
                      <input
                        type="checkbox"
                        aria-label="Select all"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                      />
                    </th>
                  ) : null}
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      onClick={() => onSort(c.key)}
                      style={{ width: c.width, cursor: c.sortValue ? "pointer" : "default" }}
                    >
                      <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                        {c.header}
                        {c.sortValue ? (
                          sortKey === c.key ? (
                            sortDir === "asc" ? (
                              <ArrowUp size={12} />
                            ) : (
                              <ArrowDown size={12} />
                            )
                          ) : (
                            <ArrowUpDown size={12} style={{ opacity: 0.4 }} />
                          )
                        ) : null}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const id = rowKey(row);
                  return (
                    <tr
                      key={id}
                      className={onRowClick ? "admin-table__row--click" : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {selectable ? (
                        <td style={{ width: 44 }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            aria-label="Select row"
                            checked={selected.has(id)}
                            onChange={() => toggleRow(id)}
                          />
                        </td>
                      ) : null}
                      {columns.map((c) => {
                        const isEditing = editing?.rowId === id && editing.colKey === c.key;
                        return (
                          <td
                            key={c.key}
                            data-label={c.header}
                            style={{ width: c.width }}
                            onClick={
                              c.inlineEdit
                                ? (e) => {
                                    e.stopPropagation();
                                    setEditing({ rowId: id, colKey: c.key, value: c.inlineEdit!.value(row) });
                                  }
                                : undefined
                            }
                          >
                            {isEditing && c.inlineEdit ? (
                              <input
                                className="input admin-inline-edit"
                                autoFocus
                                placeholder={c.inlineEdit.placeholder}
                                value={editing.value}
                                onChange={(e) => setEditing({ rowId: id, colKey: c.key, value: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") commitEdit(row, c);
                                  if (e.key === "Escape") setEditing(null);
                                }}
                                onBlur={() => setEditing(null)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              c.render(row)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            className="admin-table-toolbar"
            style={{ borderTop: "1px solid var(--c-border)", borderBottom: 0 }}
          >
            <span className="t-small">
              {sorted.length} item{sorted.length === 1 ? "" : "s"}
            </span>
            <label className="t-small" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Rows:
              <select
                className="select"
                style={{ height: 32, width: 76 }}
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {Array.from(new Set([initialPageSize, ...PAGE_SIZE_OPTIONS]))
                  .sort((a, b) => a - b)
                  .map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
              </select>
            </label>
            <div style={{ flex: 1 }} />
            <span className="t-small">
              Page {page} of {pages}
            </span>
            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
