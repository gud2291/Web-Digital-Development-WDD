"use client";

import * as React from "react";
import { useEditor, EditorContent, BubbleMenu, FloatingMenu, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { Node, mergeAttributes } from "@tiptap/core";
import toast from "react-hot-toast";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Link2,
  Image as ImageIcon,
  Youtube,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
  Undo2,
  Redo2,
  type LucideIcon,
} from "lucide-react";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/** Minimal atom node for YouTube/Vimeo embeds. */
const Iframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: "iframe" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "tiptap-embed" },
      ["iframe", mergeAttributes(HTMLAttributes, { frameborder: "0", allowfullscreen: "true" })],
    ];
  },
});

/** Convert a YouTube/Vimeo watch URL into its embeddable form. */
function toEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function TipTapEditor({ value, onChange, placeholder = "Start writing…" }: Props) {
  const editorRef = React.useRef<Editor | null>(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [counts, setCounts] = React.useState({ chars: 0, words: 0, read: 0 });
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [, force] = React.useReducer((n: number) => n + 1, 0);
  const saveTimer = React.useRef<number | null>(null);

  const recompute = (editor: Editor) => {
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setCounts({ chars: text.length, words, read: Math.max(1, Math.ceil(words / 200)) });
  };

  const uploadAndInsert = async (file: File) => {
    const id = toast.loading("Uploading image…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Upload failed");
      }
      const doc = (await res.json()) as { url: string };
      editorRef.current?.chain().focus().setImage({ src: doc.url }).run();
      toast.success("Image inserted", { id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed", { id });
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Iframe,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "tiptap-content" },
      handlePaste: (_view, event) => {
        const files = event.clipboardData?.files;
        if (files && files.length && files[0].type.startsWith("image/")) {
          event.preventDefault();
          void uploadAndInsert(files[0]);
          return true;
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = (event as DragEvent).dataTransfer?.files;
        if (files && files.length && files[0].type.startsWith("image/")) {
          event.preventDefault();
          void uploadAndInsert(files[0]);
          return true;
        }
        return false;
      },
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor;
      recompute(editor);
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      recompute(editor);
      setStatus("saving");
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        setStatus("saved");
        setSavedAt(Date.now());
      }, 800);
    },
  });

  // Re-render the "saved Ns ago" label.
  React.useEffect(() => {
    const id = window.setInterval(() => force(), 5000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) {
    return (
      <div className="tiptap-editor">
        <div className="tiptap-content" style={{ color: "var(--c-text-muted)" }}>Loading editor…</div>
      </div>
    );
  }

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertEmbed = () => {
    const raw = window.prompt("Paste a YouTube or Vimeo URL");
    if (!raw) return;
    const src = toEmbedUrl(raw);
    if (!src) {
      toast.error("Unsupported URL — use a YouTube or Vimeo link");
      return;
    }
    editor.chain().focus().insertContent({ type: "iframe", attrs: { src } }).run();
  };

  const savedAgo = savedAt ? Math.round((Date.now() - savedAt) / 1000) : 0;
  const statusLabel =
    status === "saving" ? "Saving…" : status === "saved" ? `Saved · ${savedAgo}s ago` : "";

  return (
    <div className="tiptap-editor">
      <div className="tiptap-toolbar">
        <Group>
          <Btn icon={Bold} title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
          <Btn icon={Italic} title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
          <Btn icon={UnderlineIcon} title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
          <Btn icon={Strikethrough} title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} />
        </Group>
        <Group>
          <Btn icon={Heading1} title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
          <Btn icon={Heading2} title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
          <Btn icon={Heading3} title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        </Group>
        <Group>
          <Btn icon={List} title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <Btn icon={ListOrdered} title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <Btn icon={Quote} title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          <Btn icon={Code2} title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
          <Btn icon={Minus} title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        </Group>
        <Group>
          <Btn icon={AlignLeft} title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} />
          <Btn icon={AlignCenter} title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} />
          <Btn icon={AlignRight} title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} />
        </Group>
        <Group>
          <Btn icon={Link2} title="Link" active={editor.isActive("link")} onClick={setLink} />
          <Btn icon={ImageIcon} title="Insert image" onClick={() => setPickerOpen(true)} />
          <Btn icon={Youtube} title="Embed video" onClick={insertEmbed} />
          <Btn icon={TableIcon} title="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
        </Group>
        <Group>
          <Btn icon={Undo2} title="Undo" onClick={() => editor.chain().focus().undo().run()} />
          <Btn icon={Redo2} title="Redo" onClick={() => editor.chain().focus().redo().run()} />
        </Group>
      </div>

      {/* §15.5 — inline formatting on selected text */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 120 }} className="tiptap-bubble">
        <Btn icon={Bold} title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <Btn icon={Italic} title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Btn icon={UnderlineIcon} title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <Btn icon={Link2} title="Link" active={editor.isActive("link")} onClick={setLink} />
      </BubbleMenu>

      {/* §15.5 — block menu on empty lines (slash-style inserter) */}
      <FloatingMenu editor={editor} tippyOptions={{ duration: 120 }} className="tiptap-floating">
        <Btn icon={Heading2} title="Heading" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <Btn icon={List} title="List" onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <Btn icon={Quote} title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <Btn icon={Code2} title="Code" onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <Btn icon={ImageIcon} title="Image" onClick={() => setPickerOpen(true)} />
        <Btn icon={TableIcon} title="Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
        <Btn icon={Minus} title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      </FloatingMenu>

      <EditorContent editor={editor} />

      <div className="tiptap-footer">
        <span>
          {counts.words} words · {counts.chars} chars · ~{counts.read} min read
        </span>
        <span className="tiptap-status">{statusLabel}</span>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        mode="multi"
        onSelect={(urls) => urls.forEach((u) => editor.chain().focus().setImage({ src: u }).run())}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="tiptap-toolbar__group">{children}</div>;
}

function Btn({
  icon: Glyph,
  title,
  active,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" title={title} aria-label={title} className={active ? "is-active" : ""} onClick={onClick}>
      <Glyph size={15} />
    </button>
  );
}
