"use client";

import { useEffect, useRef } from "react";

type Props = {
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm outline-none"
      >
        <h2 className="font-display text-lg text-text mb-4">{title}</h2>
        {message && <p className="text-sm text-text-muted mb-4">{message}</p>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-accent text-bg font-medium rounded-lg px-4 py-2 text-sm hover:brightness-110 transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
