"use client";

import * as React from "react";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { adminApi } from "@/lib/adminApi";

interface Props<T> {
  items: T[];
  getId: (item: T) => string;
  /** Renders the row's main content + the parent's own actions (Edit/Delete/etc). */
  render: (item: T, index: number) => React.ReactNode;
  /** Optimistic reorder — the parent updates its own state to match these ids. */
  onReorder: (orderedIds: string[]) => void;
  /**
   * When provided, the new order is PATCHed to this endpoint as `{ ids }` and a
   * toast/rollback flow runs. Omit for local lists (e.g. RHF field arrays saved
   * with their parent form).
   */
  reorderEndpoint?: string;
  /** Shown when there are no items. */
  empty?: React.ReactNode;
}

/**
 * §16.2/16.3/16.5/16.6 — the single reorder UI. Drag (mouse + 200ms long-press
 * on touch) OR ↑/↓ arrows. On change it optimistically reorders, then (when an
 * endpoint is given) PATCHes the full ordered id array and toasts / rolls back.
 */
export function SortableList<T>({ items, getId, render, onReorder, reorderEndpoint, empty }: Props<T>) {
  const [saving, setSaving] = React.useState(false);
  const [flashId, setFlashId] = React.useState<string | null>(null);
  const flashTimer = React.useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = items.map(getId);

  React.useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    []
  );

  const flash = (id: string) => {
    setFlashId(id);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashId(null), 200);
  };

  const applyOrder = React.useCallback(
    async (nextIds: string[], prevIds: string[]) => {
      onReorder(nextIds); // optimistic
      if (!reorderEndpoint) return;
      setSaving(true);
      try {
        await adminApi.patch(reorderEndpoint, { ids: nextIds });
        toast.success("Order saved", { duration: 2000 });
      } catch (err) {
        onReorder(prevIds); // rollback
        toast.error(err instanceof Error ? err.message : "Reorder failed");
      } finally {
        setSaving(false);
      }
    },
    [onReorder, reorderEndpoint]
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const prevIds = [...ids];
    const nextIds = arrayMove(ids, oldIndex, newIndex);
    void applyOrder(nextIds, prevIds);
  };

  const swap = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (saving || target < 0 || target >= ids.length) return;
    const prevIds = [...ids];
    const nextIds = arrayMove(ids, index, target);
    flash(ids[index]);
    void applyOrder(nextIds, prevIds);
  };

  if (items.length === 0) {
    return <div className="sortable-empty">{empty ?? "No items yet."}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={`sortable-list ${saving ? "is-saving" : ""}`}>
          {items.map((item, i) => {
            const id = getId(item);
            return (
              <SortableRow
                key={id}
                id={id}
                disabled={saving}
                isFirst={i === 0}
                isLast={i === items.length - 1}
                flash={flashId === id}
                onUp={() => swap(i, -1)}
                onDown={() => swap(i, 1)}
              >
                {render(item, i)}
              </SortableRow>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface RowProps {
  id: string;
  disabled: boolean;
  isFirst: boolean;
  isLast: boolean;
  flash: boolean;
  onUp: () => void;
  onDown: () => void;
  children: React.ReactNode;
}

function SortableRow({ id, disabled, isFirst, isLast, flash, onUp, onDown, children }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    scale: isDragging ? 1.02 : 1,
    boxShadow: isDragging ? "0 18px 40px rgba(15, 23, 42, .22)" : undefined,
    zIndex: isDragging ? 20 : undefined,
    position: "relative",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-row ${flash ? "sortable-row--flash" : ""} ${disabled ? "sortable-row--saving" : ""}`}
    >
      <button
        type="button"
        className="sortable-row__grip"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>
      <div className="sortable-row__body">{children}</div>
      <div className="sortable-row__arrows">
        <button
          type="button"
          className="sortable-row__arrow"
          aria-label="Move up"
          disabled={isFirst || disabled}
          onClick={onUp}
        >
          <ChevronUp size={16} />
        </button>
        <button
          type="button"
          className="sortable-row__arrow"
          aria-label="Move down"
          disabled={isLast || disabled}
          onClick={onDown}
        >
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
}
