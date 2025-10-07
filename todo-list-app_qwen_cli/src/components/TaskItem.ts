import { Task } from '../models/Task';
import { Store } from '../services/Store';

interface TaskItemOptions {
  task: Task;
  store: Store;
  containerId: string;
}

/**
 * TaskItem component for displaying and interacting with individual tasks
 * Based on specification requirements:
 * - Displays task title and optional description
 * - Provides checkbox toggle for completion
 * - Provides delete button
 * - Supports inline editing
 * - Shows visual distinction for completed tasks
 */
export class TaskItem {
  private task: Task;
  private store: Store;
  private container: HTMLElement;
  private isEditing: boolean = false;
  private editInput?: HTMLInputElement;

  constructor(options: TaskItemOptions) {
    this.task = { ...options.task }; // Create a copy to avoid direct mutation
    this.store = options.store;
    
    const container = document.getElementById(options.containerId);
    if (!container) {
      throw new Error(`Container with id '${options.containerId}' not found`);
    }
    this.container = container;
    
    this.render();
    this.bindEvents();
  }

  private render(): void {
    const taskClass = this.task.completed ? 'task-item completed' : 'task-item';
    
    this.container.innerHTML = `
      <div class="${taskClass}" data-task-id="${this.task.id}">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${this.task.completed ? 'checked' : ''} 
          data-testid="task-checkbox"
        />
        <span class="task-title" data-testid="task-title">${this.escapeHtml(this.task.title)}</span>
        <div class="task-actions">
          <button class="edit-btn" aria-label="Edit task" data-testid="edit-task-btn">✎</button>
          <button class="delete-btn" aria-label="Delete task" data-testid="delete-task-btn">✕</button>
        </div>
      </div>
    `;

    // Add event listeners
    const checkbox = this.container.querySelector('.task-checkbox') as HTMLInputElement;
    const editBtn = this.container.querySelector('.edit-btn') as HTMLButtonElement;
    const deleteBtn = this.container.querySelector('.delete-btn') as HTMLButtonElement;
    const titleSpan = this.container.querySelector('.task-title') as HTMLSpanElement;

    checkbox.addEventListener('change', () => this.toggleComplete());
    editBtn.addEventListener('click', () => this.startEditing());
    deleteBtn.addEventListener('click', () => this.deleteTask());
    titleSpan.addEventListener('dblclick', () => this.startEditing());
  }

  private startEditing(): void {
    this.isEditing = true;
    
    const taskElement = this.container.querySelector('.task-item') as HTMLElement;
    taskElement.innerHTML = `
      <input 
        type="checkbox" 
        class="task-checkbox" 
        ${this.task.completed ? 'checked' : ''} 
      />
      <input 
        type="text" 
        class="task-edit-input" 
        value="${this.escapeHtml(this.task.title)}" 
        maxlength="500"
        data-testid="task-edit-input"
      />
      <div class="task-actions">
        <button class="save-btn" aria-label="Save changes" data-testid="save-task-btn">✓</button>
        <button class="cancel-btn" aria-label="Cancel editing" data-testid="cancel-task-btn">✕</button>
      </div>
    `;

    this.editInput = this.container.querySelector('.task-edit-input') as HTMLInputElement;
    this.editInput.focus();
    this.editInput.select();

    // Add event listeners for save and cancel
    const saveBtn = this.container.querySelector('.save-btn') as HTMLButtonElement;
    const cancelBtn = this.container.querySelector('.cancel-btn') as HTMLButtonElement;

    saveBtn.addEventListener('click', () => this.saveEdit());
    cancelBtn.addEventListener('click', () => this.cancelEdit());
    
    // Allow Enter to save and Esc to cancel
    this.editInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveEdit();
      } else if (e.key === 'Escape') {
        this.cancelEdit();
      }
    });
  }

  private saveEdit(): void {
    if (!this.editInput) return;

    const newTitle = this.editInput.value.trim();

    // Validate title
    if (!newTitle) {
      alert('Task title cannot be empty');
      this.editInput.focus();
      return;
    }

    if (newTitle.length > 500) {
      alert('Task title cannot exceed 500 characters');
      this.editInput.focus();
      return;
    }

    try {
      const updatedTask = this.store.editTask(this.task.id, newTitle, this.task.description);
      if (updatedTask) {
        this.task = updatedTask;
        this.isEditing = false;
        this.render();
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task changes. Please try again.');
    }
  }

  private cancelEdit(): void {
    this.isEditing = false;
    this.render();
  }

  private toggleComplete(): void {
    this.store.toggleComplete(this.task.id);
    // The UI will update via the store's state change notifications
  }

  private deleteTask(): void {
    // Check if user has more than 5 tasks for confirmation requirement
    const allTasks = this.store.getState().tasks;
    if (allTasks.length > 5) {
      const confirmed = confirm('Are you sure you want to delete this task?');
      if (!confirmed) return;
    }

    const success = this.store.deleteTask(this.task.id);
    if (success) {
      // Task was successfully deleted, the parent will handle UI removal
    } else {
      console.error('Failed to delete task');
    }
  }

  private bindEvents(): void {
    // Events are bound in the render method
  }

  /**
   * Simple HTML escaping to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}