import { Store } from '../state/Store';

export class ThemeToggle {
  private element: HTMLButtonElement;

  store: Store;

  constructor(store: Store) {
    this.store = store;
    this.element = document.createElement('button');
    this.element.textContent = 'Toggle Theme';
    this.element.addEventListener('click', this.handleClick.bind(this));
    this.store.addListener(() => this.render());
    this.render();
  }

  private handleClick(): void {
    const currentTheme = this.store.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.store.setTheme(newTheme);
  }

  render(): HTMLButtonElement {
    document.body.className = this.store.getTheme();
    return this.element;
  }
}