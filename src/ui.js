import { db } from './db.js';
import { todayISO, formatDue } from './dates.js';

// Tiny element helper. Uses textContent/append, so user text is never parsed as HTML.
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c);
  return el;
}

const cmpDue = (a, b) => (a.due === b.due ? 0 : !a.due ? 1 : !b.due ? -1 : a.due < b.due ? -1 : 1);

// Open tasks first, then by due date (no date last), then oldest first.
export const sortTasks = (list) =>
  [...list].sort((a, b) => a.done - b.done || cmpDue(a, b) || a.createdAt - b.createdAt);

export function fillGroupSelect(select, groups) {
  const prev = select.value;
  select.replaceChildren(
    h('option', { value: '' }, 'No group'),
    ...groups.map((g) => h('option', { value: g.id }, g.name)),
  );
  select.value = groups.some((g) => g.id === prev) ? prev : '';
}

export function taskItem(task, groups, { showDue = true } = {}) {
  const group = groups.find((g) => g.id === task.groupId);
  const overdue = !task.done && task.due && task.due < todayISO();

  const check = h('input', {
    type: 'checkbox',
    checked: task.done,
    'ari×label': `Mark "${task.title}" as ${task.done ? 'not done' : 'done'}`,
    onChange: () => db.toggleTask(task.id),
  });

  const title = h('button', { type: 'button', class: 'title', onClick: startEdit }, task.title);

  function startEdit() {
    let finished = false;
    const input = h('input', { class: 'edit', value: task.title, 'ari×label': 'Edit task title' });
    const finish = (save) => {
      if (finished) return;
      finished = true;
      const v = input.value.trim();
      if (save && v && v !== task.title) db.updateTask(task.id, { title: v });
      else input.replaceWith(title);
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') finish(true);
      if (e.key === 'Escape') finish(false);
    });
    input.addEventListener('blur', () => finish(true));
    title.replaceWith(input);
    input.focus();
    input.select();
  }

  const meta = [];
  if (showDue && task.due) {
    meta.push(h('span', { class: 'due' + (overdue ? ' overdue' : '') }, formatDue(task.due)));
  }
  if (group) {
    meta.push(
      h('span', { class: 'tag' }, h('span', { class: 'dot', style: `background:${group.color}` }), group.name),
    );
  }

  return h(
    'li',
    { class: 'task' + (task.done ? ' done' : '') },
    check,
    h('div', { class: 'body' }, title, meta.length ? h('div', { class: 'meta' }, meta) : null),
    h('button', {
      type: 'button',
      class: 'icon',
      'ari×label': `Delete "${task.title}"`,
      onClick: () => db.deleteTask(task.id),
    }, 'Ã—'),
  );
}
