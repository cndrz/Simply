// The ONLY file that touches storage. To add auth/sync later, swap the
// internals here (e.g. Supabase or Turso) and keep the same exported API.
const KEY = 'simply:v1';
const COLORS = ['#2F6F5E', '#B5543C', '#3E5C9A', '#8A6D1F', '#7B4B94', '#4A7C8C'];
const listeners = new Set();

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.tasks) && Array.isArray(s.groups)) return s;
  } catch {}
  return { tasks: [], groups: [] };
}

let state = load();

function notify() {
  listeners.forEach((fn) => fn());
}

function commit(next) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  notify();
}

// Keep multiple tabs in sync.
window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    state = load();
    notify();
  }
});

const uid = () => crypto.randomUUID();

export const db = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getTasks: () => state.tasks,
  getGroups: () => state.groups,

  addTask({ title, due = null, groupId = null }) {
    const task = { id: uid(), title, done: false, due, groupId, createdAt: Date.now() };
    commit({ ...state, tasks: [...state.tasks, task] });
    return task;
  },

  updateTask(id, patch) {
    commit({ ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  },

  toggleTask(id) {
    const t = state.tasks.find((x) => x.id === id);
    if (t) db.updateTask(id, { done: !t.done });
  },

  deleteTask(id) {
    commit({ ...state, tasks: state.tasks.filter((t) => t.id !== id) });
  },

  addGroup(name) {
    const group = { id: uid(), name, color: COLORS[state.groups.length % COLORS.length] };
    commit({ ...state, groups: [...state.groups, group] });
    return group;
  },

  // Tasks in the deleted group are kept, just ungrouped.
  deleteGroup(id) {
    commit({
      tasks: state.tasks.map((t) => (t.groupId === id ? { ...t, groupId: null } : t)),
      groups: state.groups.filter((g) => g.id !== id),
    });
  },
};
