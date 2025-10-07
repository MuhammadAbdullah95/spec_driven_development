import { Store } from '../state/Store';
import { TaskItem } from './TaskItem';

export class TaskList {
  private element: HTMLUListElement;

  store: Store;

  constructor(store: Store) {
    this.store = store;
    this.element = document.createElement('ul');
    this.element.addEventListener('dragover', this.handleDragOver.bind(this));
    this.element.addEventListener('drop', this.handleDrop.bind(this));
    this.store.addListener(() => this.render());
    this.render();
  }

  private handleDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private handleDrop(event: DragEvent): void {
    event.preventDefault();
    const taskId = event.dataTransfer?.getData('text/plain');
    if (taskId) {
      const tasks = this.store.getTasks();
      const draggedTaskIndex = tasks.findIndex(task => task.id === taskId);
      const dropTarget = event.target as HTMLElement;
      const dropTargetItem = dropTarget.closest('li');
      if (dropTargetItem) {
        const dropTargetIndex = Array.from(this.element.children).indexOf(dropTargetItem);
        this.store.reorderTasks(draggedTaskIndex, dropTargetIndex);
      }
    }
  }

  render(): HTMLUListElement {
    this.element.innerHTML = '';
    const tasks = this.store.getTasks();

    if (tasks.length === 0) {
      const emptyState = document.createElement('li');
      emptyState.textContent = 'No tasks yet—add one above!';
      emptyState.className = 'empty-state';
      this.element.appendChild(emptyState);
    } else {
      tasks.forEach(task => {
        const taskItem = new TaskItem(task, this.store);
        this.element.appendChild(taskItem.render());
      });
    }
    return this.element;
  }
}