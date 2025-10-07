import './style.css';
import { Store } from './state/Store';
import { StorageService } from './storage/StorageService';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { FilterButtons } from './components/FilterButtons';
import { ThemeToggle } from './components/ThemeToggle';

const storage = new StorageService();
const store = new Store(storage);

const app = document.querySelector<HTMLDivElement>('#app')!;

const taskInput = new TaskInput(store);
const taskList = new TaskList(store);
const filterButtons = new FilterButtons(store);
const themeToggle = new ThemeToggle(store);

app.innerHTML = `
  <h1>To-Do List</h1>
`;
app.appendChild(taskInput.render());
app.appendChild(filterButtons.render());
app.appendChild(taskList.render());
app.appendChild(themeToggle.render());

document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'ArrowUp' && (event.ctrlKey || event.metaKey) && event.shiftKey) {
    event.preventDefault();
    store.reorderSelectedTask('up');
  } else if (event.key === 'ArrowDown' && (event.ctrlKey || event.metaKey) && event.shiftKey) {
    event.preventDefault();
    store.reorderSelectedTask('down');
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    store.moveSelection('up');
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    store.moveSelection('down');
  }
});