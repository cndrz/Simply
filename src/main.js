import './style.css';
import { db } from './db.js';
import { mountOverview } from './views/overview.js';
import { mountCalendar } from './views/calendar.js';

const views = {
  tasks: { el: document.getElementById('view-tasks') },
  calendar: { el: document.getElementById('view-calendar') },
};
Object.assign(views.tasks, mountOverview(views.tasks.el));
Object.assign(views.calendar, mountCalendar(views.calendar.el));

function route() {
  const name = location.hash === '#/calendar' ? 'calendar' : 'tasks';
  for (const [key, v] of Object.entries(views)) v.el.hidden = key !== name;
  document.querySelectorAll('nav a').forEach((a) => {
    if (a.dataset.route === name) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

const refreshAll = () => Object.values(views).forEach((v) => v.refresh());

db.subscribe(refreshAll);
window.addEventListener('hashchange', route);
refreshAll();
route();
