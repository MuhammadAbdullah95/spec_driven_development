/**
 * Type definitions for the expense tracker application
 * Note: Using JSDoc comments for type checking in JavaScript
 */

/**
 * @typedef {Object} Expense
 * @property {string} id - Unique identifier for the expense
 * @property {number} amount - Amount spent
 * @property {string} category - Category of the expense
 * @property {string} description - Description of the expense
 * @property {string} date - Date of the expense (ISO format)
 * @property {string} createdAt - Creation timestamp (ISO format)
 */

/**
 * @typedef {Object} Category
 * @property {string} id - Unique identifier for the category
 * @property {string} name - Display name of the category
 * @property {string} icon - Lucide icon name
 * @property {string} color - Tailwind color classes
 * @property {boolean} isCustom - Whether this is a user-created category
 */

/**
 * @typedef {Object} Stats
 * @property {number} totalSpending - Total amount spent
 * @property {number} thisWeek - Amount spent this week
 * @property {number} thisMonth - Amount spent this month
 * @property {number} expenseCount - Total number of expenses
 * @property {string} topCategory - Category with highest spending
 */

/**
 * @typedef {Object} ChartData
 * @property {string} label - Label for the data point
 * @property {number} amount - Amount for the data point
 * @property {string} [category] - Category name (for category charts)
 * @property {number} [value] - Generic value (for trend charts)
 */

/**
 * @typedef {Object} AIMessage
 * @property {string} id - Unique identifier for the message
 * @property {'user'|'assistant'} type - Type of message
 * @property {string} content - Message content
 * @property {Date} timestamp - Message timestamp
 */

/**
 * @typedef {Object} QuickAction
 * @property {string} id - Unique identifier for the action
 * @property {string} label - Display label for the action
 * @property {import('lucide-react').LucideIcon} icon - Lucide icon component
 */

/**
 * @typedef {Object} ButtonProps
 * @property {React.ReactNode} children - Button content
 * @property {'primary'|'secondary'|'outline'|'ghost'|'danger'|'success'} [variant] - Button variant
 * @property {'sm'|'md'|'lg'|'xl'} [size] - Button size
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [disabled] - Whether button is disabled
 * @property {boolean} [loading] - Whether button is in loading state
 * @property {() => void} [onClick] - Click handler
 * @property {'button'|'submit'|'reset'} [type] - Button type
 */

/**
 * @typedef {Object} InputProps
 * @property {string} [label] - Input label
 * @property {'text'|'email'|'password'|'number'|'date'|'tel'} [type] - Input type
 * @property {string} [placeholder] - Placeholder text
 * @property {string} value - Input value
 * @property {(e: Event) => void} onChange - Change handler
 * @property {(e: Event) => void} [onBlur] - Blur handler
 * @property {(e: Event) => void} [onFocus] - Focus handler
 * @property {string} [error] - Error message
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [disabled] - Whether input is disabled
 * @property {boolean} [required] - Whether input is required
 * @property {import('lucide-react').LucideIcon} [icon] - Icon component
 * @property {React.ReactNode} [suffix] - Suffix content
 */

/**
 * @typedef {Object} CardProps
 * @property {React.ReactNode} children - Card content
 * @property {string} [className] - Additional CSS classes
 * @property {'default'|'dark'|'gradient'|'solid'} [variant] - Card variant
 * @property {boolean} [hover] - Whether card has hover effects
 * @property {boolean} [glass] - Whether card has glassmorphism effect
 */

/**
 * @typedef {Object} ModalProps
 * @property {boolean} isOpen - Whether modal is open
 * @property {() => void} onClose - Close handler
 * @property {string} [title] - Modal title
 * @property {React.ReactNode} children - Modal content
 * @property {'sm'|'md'|'lg'|'xl'|'full'} [size] - Modal size
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [showCloseButton] - Whether to show close button
 * @property {boolean} [closeOnOverlayClick] - Whether clicking overlay closes modal
 * @property {boolean} [closeOnEscape] - Whether escape key closes modal
 */

export {};
