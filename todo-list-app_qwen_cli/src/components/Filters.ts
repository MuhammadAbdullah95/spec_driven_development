import { Store } from '../services/Store';

interface FiltersOptions {
  store: Store;
  containerId: string;
}

/**
 * Filters component for providing "All / Active / Completed" view filters
 * Based on specification requirement FR-010
 */
export class Filters {
  private store: Store;
  private container: HTMLElement;

  constructor(options: FiltersOptions) {
    this.store = options.store;
    
    const container = document.getElementById(options.containerId);
    if (!container) {
      throw new Error(`Container with id '${options.containerId}' not found`);
    }
    this.container = container;
    
    // Subscribe to store changes to update active filter
    this.store.subscribe((state) => {
      this.updateActiveFilter(state.filter);
    });
    
    this.render();
    this.bindEvents();
  }

  private render(): void {
    const state = this.store.getState();
    
    this.container.innerHTML = `
      <div class="filter-buttons">
        <button 
          class="filter-btn ${state.filter === 'all' ? 'active' : ''}" 
          data-filter="all"
          data-testid="filter-all"
        >
          All
        </button>
        <button 
          class="filter-btn ${state.filter === 'active' ? 'active' : ''}" 
          data-filter="active"
          data-testid="filter-active"
        >
          Active
        </button>
        <button 
          class="filter-btn ${state.filter === 'completed' ? 'active' : ''}" 
          data-filter="completed"
          data-testid="filter-completed"
        >
          Completed
        </button>
      </div>
    `;

    this.updateActiveFilter(state.filter);
  }

  private updateActiveFilter(activeFilter: 'all' | 'active' | 'completed'): void {
    // Update the active class on buttons
    const buttons = this.container.querySelectorAll('.filter-btn');
    buttons.forEach(button => {
      const filterValue = button.getAttribute('data-filter') as 'all' | 'active' | 'completed';
      if (filterValue === activeFilter) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  private bindEvents(): void {
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('filter-btn')) {
        const filterValue = target.getAttribute('data-filter') as 'all' | 'active' | 'completed';
        if (filterValue) {
          this.store.setFilter(filterValue);
        }
      }
    });
  }
}