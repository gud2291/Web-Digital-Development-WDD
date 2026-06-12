/**
 * §16.2 — apply a SortableList `onReorder(orderedIds)` to a React-Hook-Form
 * `useFieldArray`. Reorders the current values to match `orderedIds` and calls
 * `replace`. Works for any permutation (drag or arrow swap).
 */
export function applyFieldReorder<T>(
  orderedIds: string[],
  currentIds: string[],
  values: T[],
  replace: (vals: T[]) => void
): void {
  const next = orderedIds
    .map((id) => values[currentIds.indexOf(id)])
    .filter((v): v is T => v !== undefined);
  if (next.length === values.length) replace(next);
}

/** §16.2 — reorder a row array to match the given id order (for list-page state). */
export function orderByIds<T>(rows: T[], orderedIds: string[], getId: (r: T) => string): T[] {
  const map = new Map(rows.map((r) => [getId(r), r]));
  const next = orderedIds.map((id) => map.get(id)).filter((r): r is T => r !== undefined);
  return next.length === rows.length ? next : rows;
}
