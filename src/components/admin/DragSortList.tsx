"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@/components/Icon";

interface Props<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (next: T[]) => void;
  render: (item: T, index: number) => React.ReactNode;
}

export function DragSortList<T>({ items, getId, onReorder, render }: Props<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const ids = items.map(getId);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, i) => (
            <SortableRow key={getId(item)} id={getId(item)}>
              {render(item, i)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: "#fff",
    border: "1px solid var(--c-border)",
    borderRadius: 10,
    padding: 14,
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        style={{
          background: "transparent",
          border: 0,
          cursor: "grab",
          color: "var(--c-text-subtle)",
          padding: 4,
        }}
      >
        <Icon name="menu" size={16} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
