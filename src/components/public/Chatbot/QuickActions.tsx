"use client";

interface QuickAction {
  label: string;
  payload: string;
}

interface Props {
  actions: QuickAction[];
  disabled?: boolean;
  onPick: (payload: string) => void;
}

export function QuickActions({ actions, disabled, onPick }: Props) {
  if (actions.length === 0) return null;
  return (
    <div className="chat-window__quick-actions">
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          className="chat-window__quick"
          disabled={disabled}
          onClick={() => onPick(a.payload)}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
