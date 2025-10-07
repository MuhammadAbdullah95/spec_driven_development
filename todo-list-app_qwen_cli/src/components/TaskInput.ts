import { Store } from '../services/Store';

interface TaskInputOptions {
  store: Store;
  containerId: string;
}

/**
 * TaskInput component for adding new tasks
 * Based on specification requirements:
 * - Allows adding tasks with title and optional description
 * - Validates input (no empty title, character limit)
 * - Supports Enter key to add tasks quickly
 */
export class TaskInput {
  private store: Store;
  private container: HTMLElement;
  private inputElement: HTMLInputElement;
  private descriptionElement?: HTMLTextAreaElement;

  constructor(options: TaskInputOptions) {
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
    this.container.innerHTML = `
      <div class="task-input-wrapper">
        <input 
          type="text" 
          id="new-task-title" 
          placeholder="Add a new task..." 
          maxlength="500"
          class="task-input"
          data-testid="new-task-input"
        />
        <button id="add-task-btn" class="add-task-btn" data-testid="add-task-btn">Add Task</button>
      </div>
    `;

    this.inputElement = document.getElementById('new-task-title') as HTMLInputElement;
    const addButton = document.getElementById('add-task-btn') as HTMLButtonElement;

    // Add Enter key support for quick task addition
    this.inputElement.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addTask();
      }
    });

    // Add button click handler
    addButton.addEventListener('click', () => this.addTask());
    
    // Add focus to input when component renders
    this.inputElement.focus();
  }

  private addTask(): void {
    const title = this.inputElement.value.trim();

    // Validate title
    if (!title) {
      alert('Task title cannot be empty');
      return;
    }

    if (title.length > 500) {
      alert('Task title cannot exceed 500 characters');
      return;
    }

    try {
      // Add the task via the store
      this.store.addTask(title);

      // Clear the input field
      this.inputElement.value = '';
      this.inputElement.focus();
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  }

  private bindEvents(): void {
    // Events are bound in the render method
  }
}