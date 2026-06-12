import * as React from "react";

interface Props {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: Props) {
  return (
    <div className="admin-page-head">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: 10 }}>{actions}</div> : null}
    </div>
  );
}
