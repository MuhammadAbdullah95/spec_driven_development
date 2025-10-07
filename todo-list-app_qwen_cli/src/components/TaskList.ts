import { Task } from '../models/Task';
import { Store } from '../services/Store';
import { TaskItem } from './TaskItem';

interface TaskListOptions {
  store: Store;
  containerId: string;
}

/**
 * TaskList component for managing and displaying the list of tasks
 * Supports filtering and reordering functionality
 */
export class TaskList {
  private store: Store;
  private container: HTMLElement;
  private taskItemElements: Map<string, HTMLElement> = new Map();

  constructor(options: TaskListOptions) {
    this.store = options.store;
    
    const container = document.getElementById(options.containerId);
    if (!container) {
      throw new Error(`Container with id '${options.containerId}' not found`);
    }
    this.container = container;
    
    // Subscribe to store changes to update the UI
    this.store.subscribe((state) => {
      this.render();
    });
    
    this.render();
    this.bindEvents();
  }

  private render(): void {
    const state = this.store.getState();
    
    // Filter tasks based on current filter
    let filteredTasks: Task[] = [];
    switch (state.filter) {
      case 'active':
        filteredTasks = state.tasks.filter(task => !task.completed);
        break;
      case 'completed':
        filteredTasks = state.tasks.filter(task => task.completed);
        break;
      case 'all':
      default:
        filteredTasks = [...state.tasks];
        break;
    }

    // Clear the container
    this.container.innerHTML = '';

    if (filteredTasks.length === 0) {
      // Show empty state message
      this.container.innerHTML = `
        <div class="empty-state" data-testid="empty-state">
          No tasks yet—add one above!
        </div>
      `;
      return;
    }

    // Create a container for each task
    filteredTasks.forEach((task, index) => {
      const taskContainer = document.createElement('div');
      taskContainer.id = `task-${task.id}`;
      taskContainer.setAttribute('data-task-id', task.id);
      taskContainer.setAttribute('draggable', 'true');
      this.container.appendChild(taskContainer);

      // Create and render the TaskItem component
      new TaskItem({
        task: task,
        store: this.store,
        containerId: `task-${task.id}`
      });

      // Store reference to the element for drag and drop
      this.taskItemElements.set(task.id, taskContainer);
    });
    
    // Initialize drag and drop event listeners after rendering
    this.initDragAndDrop();
  }
  
  private initDragAndDrop(): void {
    // Get all task items and add drag event listeners
    const taskItems = this.container.querySelectorAll('[data-task-id]');
    
    taskItems.forEach((item: Element) => {
      const element = item as HTMLElement;
      
      element.addEventListener('dragstart', (e) => {
        element.classList.add('dragging');
        // Set the drag effect
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', element.getAttribute('data-task-id') || '');
        }
      });
      
      element.addEventListener('dragend', () => {
        element.classList.remove('dragging');
      });
    });
    
    // Add drop zone functionality to the container
    this.container.addEventListener('dragover', (e) => {
      e.preventDefault(); // Necessary to allow dropping
      const afterElement = this.getDragAfterElement(this.container, e.clientY);
      const draggable = document.querySelector('.dragging') as HTMLElement | null;
      
      if (draggable) {
        if (afterElement) {
          this.container.insertBefore(draggable, afterElement);
        } else {
          this.container.appendChild(draggable);
        }
      }
    });
    
    this.container.addEventListener('drop', (e) => {
      e.preventDefault();
      const id = e.dataTransfer?.getData('text/plain');
      if (!id) return;
      
      const taskId = id;
      const taskContainer = document.querySelector(`[data-task-id="${taskId}"]`) as HTMLElement;
      const allTaskContainers = Array.from(this.container.querySelectorAll('[data-task-id]'));
      const newIdx = allTaskContainers.indexOf(taskContainer);
      
      // Find the original index of the task
      const originalTask = this.store.getState().tasks.find(t => t.id === taskId);
      if (!originalTask) return;
      
      const originalIdx = this.store.getState().tasks.findIndex(t => t.id === taskId);
      
      // Reorder in the store
      this.store.reorderTasks(originalIdx, newIdx);
    });
  }
  
  private getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
    const draggableElements = [...container.querySelectorAll('[data-task-id]:not(.dragging)')] as HTMLElement[];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      // If offset is negative, it means the cursor is above the element
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY, element: null as HTMLElement | null }).element;
  }

  private bindEvents(): void {
    // Events are handled via store subscription
  }
}