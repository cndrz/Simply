import { db } from '../db.js';
import { h, taskItem, fillGroupSelect, sortTasks } from '../ui.js';
import { todayISO } from '../dates.js';

const FILTERS = [
  ['all', 'All'],
  ['today', 'Today'],
  ['upcoming', 'Upcoming'],
  ['overdue', 'Overdue'],
  ['done', 'Done'],
];

const EMPTY = {
  all: 'No tasks yet. Add your first one above.',
  today: 'Nothing due today.',
  upcoming: 'Nothing coming up.',
  overdue: 'Nothing overdue.',
  done: 'No completed tasks yet.',
};

export function mountOverview(root) {
  let filter = 'all';
  let groupId = null;
  let addingGroup = false;

  // Add form: only the title is required.
  const titleInput = h('input', {
    name: 'title',
    placeholder: 'Add a task',
    autocomplete: 'off',
    'aria-label': 'Task title',
    required: true,
  });
  const dueInput = h('input', { type: 'date', name: 'due', 'aria-label': 'Due date (optional)' });
  const groupSelect = h('select', { name: 'group', 'aria-label': 'Group (optional)' });
  const form = h(
    'form',
    {
      class: 'add',
      onSubmit: (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        if (!title) return;
        db.addTask({ title, due: dueInput.value || null, groupId: groupSelect.value || null });
        titleInput.value = '';
        dueInput.value = '';
        titleInput.focus();
      },
    },
    titleInput,
    dueInput,
    groupSelect,
    h('button', { type: 'submit', class: 'primary' }, 'Add task'),
  );

  const filtersEl = h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by status' });
  const groupsEl = h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by group' });
  const listEl = h('ul', { class: 'tasks' });
  const emptyEl = h('p', { class: 'empty' });

  function renderFilters() {
    filtersEl.replaceChildren(
      ...FILTERS.map(([key, label]) =>
        h('button', {
          type: 'button',
          class: 'chip',
          'aria-pressed': String(filter === key),
          onClick: () => {
            filter = key;
            refresh();
          },
        }, label),
      ),
    );
  }

  function renderGroups(groups) {
    const chips = [
      h('button', {
        type: 'button',
        class: 'chip',
        'aria-pressed': String(groupId === null),
        onClick: () => {
          groupId = null;
          refresh();
        },
      }, 'All groups'),
      ...groups.map((g) =>
        h('button', {
          type: 'button',
          class: 'chip',
          'aria-pressed': String(groupId === g.id),
          onClick: () => {
            groupId = g.id;
            refresh();
          },
        }, h('span', { class: 'dot', style: `background:${g.color}` }), g.name),
      ),
    ];

    let input = null;
    if (addingGroup) {
      let done = false;
      input = h('input', { class: 'chip-input', placeholder: 'Group name', 'aria-label': 'New group name' });
      const finish = (save) => {
        if (done) return;
        done = true;
        addingGroup = false;
        const name = input.value.trim();
        if (save && name) groupId = db.addGroup(name).id;
        refresh();
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          finish(true);
        }
        if (e.key === 'Escape') finish(false);
      });
      input.addEventListener('blur', () => finish(true));
      chips.push(input);
    } else {
      chips.push(
        h('button', {
          type: 'button',
          class: 'chip ghost',
          onClick: () => {
            addingGroup = true;
            refresh();
          },
        }, '+ New group'),
      );
    }

    if (groupId && !addingGroup) {
      chips.push(
        h('button', {
          type: 'button',
          class: 'link danger',
          onClick: () => {
            if (!confirm('Delete this group? Its tasks stay, just ungrouped.')) return;
            const id = groupId;
            groupId = null;
            db.deleteGroup(id);
          },
        }, 'Delete group'),
      );
    }

    groupsEl.replaceChildren(...chips);
    if (input) input.focus();
  }

  function renderList(groups) {
    const today = todayISO();
    let tasks = db.getTasks();
    if (groupId) tasks = tasks.filter((t) => t.groupId === groupId);
    tasks = tasks.filter((t) => {
      switch (filter) {
        case 'today': return !t.done && t.due === today;
        case 'upcoming': return !t.done && t.due && t.due > today;
        case 'overdue': return !t.done && t.due && t.due < today;
        case 'done': return t.done;
        default: return true;
      }
    });
    listEl.replaceChildren(...sortTasks(tasks).map((t) => taskItem(t, groups)));
    emptyEl.textContent = tasks.length ? '' : EMPTY[filter];
    emptyEl.hidden = tasks.length > 0;
  }

  function refresh() {
    const groups = db.getGroups();
    if (groupId && !groups.some((g) => g.id === groupId)) groupId = null;
    fillGroupSelect(groupSelect, groups);
    renderFilters();
    renderGroups(groups);
    renderList(groups);
  }

  root.append(form, filtersEl, groupsEl, listEl, emptyEl);
  return { refresh };
}
