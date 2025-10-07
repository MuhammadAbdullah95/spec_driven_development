import { Store } from '../state/Store';

export class FilterButtons {
  private element: HTMLDivElement;

  store: Store;

  constructor(store: Store) {
    this.store = store;
    this.element = document.createElement('div');
    this.render();
  }

  render(): HTMLDivElement {
    this.element.innerHTML = `
      <button data-filter="all">All</button>
      <button data-filter="active">Active</button>
      <button data-filter="completed">Completed</button>
    `;

    this.element.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', (event) => {
        const filter = (event.target as HTMLButtonElement).dataset.filter as 'all' | 'active' | 'completed';
        this.store.setFilter(filter);
      });
    });

    return this.element;
  }
}