import { Store } from '../services/Store';

interface ThemeToggleOptions {
  store: Store;
  containerId: string;
}

/**
 * ThemeToggle component for detecting system theme and allowing manual override
 * Based on specification requirements FR-013 and FR-014
 */
export class ThemeToggle {
  private store: Store;
  private container: HTMLElement;

  constructor(options: ThemeToggleOptions) {
    this.store = options.store;
    
    const container = document.getElementById(options.containerId);
    if (!container) {
      throw new Error(`Container with id '${options.containerId}' not found`);
    }
    this.container = container;
    
    // Subscribe to store changes to update theme UI
    this.store.subscribe((state) => {
      this.updateThemeUI(state.theme);
    });
    
    this.render();
    this.bindEvents();
    
    // Initialize theme based on store state
    const initialState = this.store.getState();
    this.applyTheme(initialState.theme);
  }

  private render(): void {
    const state = this.store.getState();
    
    this.container.innerHTML = `
      <div class="theme-toggle-wrapper">
        <div style="display: flex; align-items: center; gap: var(--spacing-xs); margin-bottom: var(--spacing-xs);">
          <span style="color: var(--text-secondary); font-size: var(--font-size-small);">Theme:</span>
          <span id="theme-indicator" style="font-weight: var(--font-weight-bold); color: var(--accent-color);">${state.theme === 'light' ? '☀️ Light' : '🌙 Dark'}</span>
        </div>
        <div style="display: flex; gap: var(--spacing-xs);">
          <button id="theme-light-btn" class="filter-btn ${state.theme === 'light' ? 'active' : ''}" data-theme="light" data-testid="theme-light-btn">
            ☀️ Light
          </button>
          <button id="theme-dark-btn" class="filter-btn ${state.theme === 'dark' ? 'active' : ''}" data-theme="dark" data-testid="theme-dark-btn">
            🌙 Dark
          </button>
          <button id="theme-auto-btn" class="filter-btn" data-testid="theme-auto-btn" title="Match system preference">
            🌗 Auto
          </button>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    const lightBtn = document.getElementById('theme-light-btn') as HTMLButtonElement;
    const darkBtn = document.getElementById('theme-dark-btn') as HTMLButtonElement;
    const autoBtn = document.getElementById('theme-auto-btn') as HTMLButtonElement;
    const themeIndicator = document.getElementById('theme-indicator') as HTMLElement;

    lightBtn?.addEventListener('click', () => {
      this.store.setTheme('light');
      themeIndicator.textContent = '☀️ Light';
      this.updateActiveButton('light');
    });

    darkBtn?.addEventListener('click', () => {
      this.store.setTheme('dark');
      themeIndicator.textContent = '🌙 Dark';
      this.updateActiveButton('dark');
    });

    autoBtn?.addEventListener('click', () => {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      this.store.setTheme(systemTheme);
      themeIndicator.textContent = systemTheme === 'light' ? '☀️ Light' : '🌙 Dark';
      this.updateActiveButton(systemTheme);
    });
  }

  private updateActiveButton(activeTheme: 'light' | 'dark' | 'auto'): void {
    const lightBtn = document.getElementById('theme-light-btn') as HTMLButtonElement;
    const darkBtn = document.getElementById('theme-dark-btn') as HTMLButtonElement;
    const autoBtn = document.getElementById('theme-auto-btn') as HTMLButtonElement;

    // Remove active class from all buttons
    [lightBtn, darkBtn, autoBtn].forEach(btn => {
      btn?.classList.remove('active');
    });

    // Add active class to the appropriate button
    if (activeTheme === 'light' && lightBtn) {
      lightBtn.classList.add('active');
    } else if (activeTheme === 'dark' && darkBtn) {
      darkBtn.classList.add('active');
    } else if (activeTheme === 'auto' && autoBtn) {
      autoBtn.classList.add('active');
    }
  }



  private updateThemeUI(theme: 'light' | 'dark'): void {
    // Update the indicator text
    const themeIndicator = document.getElementById('theme-indicator') as HTMLElement;
    if (themeIndicator) {
      themeIndicator.textContent = theme === 'light' ? '☀️ Light' : '🌙 Dark';
    }
    
    // Update active button
    this.updateActiveButton(theme);
    
    // Apply the theme to the document
    this.applyTheme(theme);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    // Apply theme to the document element
    document.documentElement.setAttribute('data-theme', theme);
    
    // Also store in localStorage for persistence across sessions (though store handles this)
    localStorage.setItem('preferred-theme', theme);
  }
}