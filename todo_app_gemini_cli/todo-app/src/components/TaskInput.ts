import { Store } from '../state/Store';

export class TaskInput {
  private element: HTMLInputElement;

  store: Store;

  constructor(store: Store) {
    this.store = store;
    this.element = document.createElement('input');
    this.element.placeholder = 'What needs to be done?';
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const title = this.element.value.trim();
      if (title) {
        this.store.addTask(title);
        this.element.value = '';
      }
    }
  }

  render(): HTMLInputElement {
    return this.element;
  }
}