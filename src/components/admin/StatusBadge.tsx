interface Props {
  kind:
    | "new"
    | "viewed"
    | "replied"
    | "closed"
    | "draft"
    | "published"
    | "visible"
    | "hidden";
  label?: string;
}

const DEFAULT_LABEL: Record<Props["kind"], string> = {
  new: "New",
  viewed: "Viewed",
  replied: "Replied",
  closed: "Closed",
  draft: "Draft",
  published: "Published",
  visible: "Visible",
  hidden: "Hidden",
};

export function StatusBadge({ kind, label }: Props) {
  return <span className={`admin-status admin-status--${kind}`}>{label ?? DEFAULT_LABEL[kind]}</span>;
}
