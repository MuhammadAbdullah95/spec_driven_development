import { App } from './components/App';

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

// Export for potential testing purposes
export { App };