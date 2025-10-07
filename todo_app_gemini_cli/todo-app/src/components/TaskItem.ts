import type { Task } from '../state/types';
import { Store } from '../state/Store';

export class TaskItem {
  private element: HTMLLIElement;
  private isEditing = false;

  task: Task;
  store: Store;

  constructor(task: Task, store: Store) {
    this.task = task;
    this.store = store;
    this.element = document.createElement('li');
    this.element.draggable = true;
    this.element.addEventListener('dragstart', this.handleDragStart.bind(this));
    this.element.addEventListener('click', this.handleClick.bind(this));
    this.element.addEventListener('click', () => this.store.setSelectedTaskId(this.task.id));
    this.render();
  }

  private handleDragStart(event: DragEvent): void {
    event.dataTransfer?.setData('text/plain', this.task.id);
  }

  private handleClick(event: MouseEvent): void {
    if (!this.isEditing && event.target !== this.element.querySelector('input[type="checkbox"]')) {
      this.isEditing = true;
      this.render();
    }
  }

  render(): HTMLLIElement {
    this.element.innerHTML = ''; // Clear existing content

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = this.task.completed;
    checkbox.addEventListener('change', (event) => {
      event.stopPropagation(); // Prevent triggering inline edit
      this.store.toggleComplete(this.task.id);
    });
    this.element.appendChild(checkbox);

    if (this.isEditing) {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = this.task.title;
      input.addEventListener('blur', () => {
        this.isEditing = false;
        this.render(); // Re-render to show title
      });
      input.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          this.store.editTask(this.task.id, input.value);
          this.isEditing = false;
          this.render(); // Re-render to show title
        }
      });
      this.element.appendChild(input);
      input.focus();
    } else {
      const title = document.createElement('span');
      title.textContent = this.task.title;
      if (this.task.completed) {
        title.style.textDecoration = 'line-through';
      }
      this.element.appendChild(title);
    }

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.className = 'destroy';
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent triggering inline edit
      this.store.deleteTask(this.task.id);
    });
    this.element.appendChild(deleteButton);

    if (this.store.getSelectedTaskId() === this.task.id) {
      this.element.classList.add('selected');
    } else {
      this.element.classList.remove('selected');
    }
    return this.element;
  }
}