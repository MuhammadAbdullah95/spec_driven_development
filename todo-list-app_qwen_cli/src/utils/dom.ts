/**
 * DOM manipulation utilities
 * Provides helper functions for common DOM operations
 */

/**
 * Creates a DOM element with specified tag, optional className and text content
 */
export function createElement(
  tag: keyof HTMLElementTagNameMap,
  className?: string,
  textContent?: string
): HTMLElement {
  const element = document.createElement(tag);
  
  if (className) {
    element.className = className;
  }
  
  if (textContent) {
    element.textContent = textContent;
  }
  
  return element;
}

/**
 * Adds a class to an element
 */
export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className);
}

/**
 * Removes a class from an element
 */
export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className);
}

/**
 * Toggles a class on an element
 */
export function toggleClass(element: HTMLElement, className: string): void {
  element.classList.toggle(className);
}

/**
 * Checks if an element has a specific class
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * Finds an element by selector, with optional context (defaults to document)
 */
export function querySelector(selector: string, context: ParentNode = document): Element | null {
  return context.querySelector(selector);
}

/**
 * Finds all elements by selector, with optional context (defaults to document)
 */
export function querySelectorAll(selector: string, context: ParentNode = document): NodeListOf<Element> {
  return context.querySelectorAll(selector);
}

/**
 * Adds an event listener to an element
 */
export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  event: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
): void {
  element.addEventListener(event, handler);
}