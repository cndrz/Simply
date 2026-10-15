"use client";

import { useEffect, useRef, useState } from "react";
import { Category } from "@/lib/api";

type Props = {
  categories: Category[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (category: Category) => Promise<void>;
  onClose: () => void;
};

export default function CategoryManager({ categories, onAdd, onDelete, onClose }: Props) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean || busy) return;
    if (categories.some((c) => c.name.toLowerCase() === clean.toLowerCase())) {
      setError("Category already exists");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onAdd(clean);
      setName("");
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        className="bg-surface border border-border rounded-xl p-6 w-full max-w-md outline-none max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-text">Categories</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition"
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleAdd} className="mb-5">
          <label className="block font-mono text-[10px] text-text-muted mb-1">New category</label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              placeholder="Name"
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent transition-colors outline-none"
            />
            <button
              type="submit"
              disabled={!name.trim() || busy}
              className="bg-accent text-bg font-medium rounded-lg px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
            >
              {busy ? "Adding…" : "Add"}
            </button>
          </div>
          {error && <p className="mt-1.5 font-mono text-[11px] text-overdue">{error}</p>}
        </form>

        <ul className="flex flex-col gap-1.5">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between bg-surface-raised rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-text truncate">{c.name}</span>
                {c.is_default === 1 && (
                  <span className="font-mono text-[10px] text-text-muted border border-border rounded px-1.5 py-0.5 shrink-0">
                    default
                  </span>
                )}
              </div>
              <button
                onClick={() => onDelete(c)}
                className="text-text-muted hover:text-overdue transition shrink-0 ml-2"
                aria-label={`Delete ${c.name}`}
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs text-text-muted">
          Deleting a category also removes it from any tasks that use it.
        </p>
      </div>
    </div>
  );
}
