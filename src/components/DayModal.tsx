"use client";

import { useEffect, useRef, useState } from "react";
import { Todo } from "@/lib/api";
import TodoItem from "@/components/TodoItem";

type Props = {
  date: string;
  todos: Todo[];
  onClose: () => void;
};

export default function DayModal({ date, todos, onClose }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const sorted = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.created_at < b.created_at ? -1 : 1;
  });

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
          <h2 className="font-display text-xl text-text">
            {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h2>
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

        {sorted.length === 0 ? (
          <p className="text-sm text-text-muted py-4">No tasks for this day</p>
        ) : (
          <div className="flex flex-col">
            {sorted.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isExpanded={expanded === todo.id}
                onExpand={(id) => setExpanded(expanded === id ? null : id)}
                onToggle={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
                readonly
                disableToggle
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
