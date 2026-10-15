import { db } from '../db.js';
import { h, taskItem, fillGroupSelect, sortTasks } from '../ui.js';
import { todayISO, toISO, parseISO, formatLong } from '../dates.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function mountCalendar(root) {
  let selected = todayISO();
  let month = parseISO(selected);
  month.setDate(1);

  // Left: month grid
  const monthTitle = h('h2', { class: 'month' });
  const grid = h('div', { class: 'grid' });
  const shift = (n) => {
    month = new Date(month.getFullYear(), month.getMonth() + n, 1);
    renderGrid();
  };
  const header = h(
    'div',
    { class: 'cal-head' },
    monthTitle,
    h('div', { class: 'cal-nav' },
      h('button', { type: 'button', class: 'icon', 'aria-label': 'Previous month', onClick: () => shift(-1) }, '‹'),
      h('button', {
        type: 'button',
        class: 'link',
        onClick: () => {
          selected = todayISO();
          month = parseISO(selected);
          month.setDate(1);
          renderGrid();
          renderDay();
        },
      }, 'Today'),
      h('button', { type: 'button', class: 'icon', 'aria-label': 'Next month', onClick: () => shift(1) }, '›'),
    ),
  );
  const calendar = h('div', { class: 'cal' }, header, grid);

  // Right: tasks due on the selected day
  const dayTitle = h('h2', { class: 'day-title' });
  const dayHint = h('p', { class: 'day-hint' });
  const titleInput = h('input', {
    placeholder: 'Add a task for this day',
    autocomplete: 'off',
    'aria-label': 'Task title',
    required: true,
  });
  const groupSelect = h('select', { 'aria-label': 'Group (optional)' });
  const form = h(
    'form',
    {
      class: 'add compact',
      onSubmit: (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        if (!title) return;
        db.addTask({ title, due: selected, groupId: groupSelect.value || null });
        titleInput.value = '';
        titleInput.focus();
      },
    },
    titleInput,
    groupSelect,
    h('button', { type: 'submit', class: 'primary' }, 'Add task'),
  );
  const listEl = h('ul', { class: 'tasks' });
  const emptyEl = h('p', { class: 'empty' }, 'Nothing due. Add something for this day.');
  const panel = h('aside', { class: 'day' }, dayTitle, dayHint, form, listEl, emptyEl);

  function renderGrid() {
    const y = month.getFullYear();
    const m = month.getMonth();
    const today = todayISO();
    const open = new Map();
    for (const t of db.getTasks()) {
      if (!t.done && t.due) open.set(t.due, (open.get(t.due) || 0) + 1);
    }

    monthTitle.textContent = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const cells = [];
    for (let i = 0; i < month.getDay(); i++) cells.push(h('span', { class: 'blank', 'aria-hidden': 'true' }));
    const days = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const iso = toISO(new Date(y, m, d));
      const n = open.get(iso) || 0;
      cells.push(
        h('button', {
          type: 'button',
          class: 'day-cell' + (iso === today ? ' today' : ''),
          'aria-pressed': String(iso === selected),
          'aria-label': formatLong(iso) + (n ? `, ${n} open` : ''),
          onClick: () => {
            selected = iso;
            renderGrid();
            renderDay();
            grid.querySelector('[aria-pressed="true"]')?.focus();
          },
        }, h('span', {}, String(d)), n ? h('i', { class: 'pip' }) : null),
      );
    }

    grid.replaceChildren(
      ...WEEKDAYS.map((w) => h('span', { class: 'wd', 'aria-hidden': 'true' }, w)),
      ...cells,
    );
  }

  function renderDay() {
    const groups = db.getGroups();
    dayTitle.textContent = formatLong(selected);
    dayHint.textContent = selected === todayISO() ? 'Today' : '';
    dayHint.hidden = !dayHint.textContent;
    const tasks = sortTasks(db.getTasks().filter((t) => t.due === selected));
    listEl.replaceChildren(...tasks.map((t) => taskItem(t, groups, { showDue: false })));
    emptyEl.hidden = tasks.length > 0;
  }

  function refresh() {
    fillGroupSelect(groupSelect, db.getGroups());
    renderGrid();
    renderDay();
  }

  root.append(h('div', { class: 'cal-layout' }, calendar, panel));
  return { refresh };
}
