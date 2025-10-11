/**
 * Category model for expense classification
 */
export class Category {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || '';
    this.type = data.type || 'custom'; // 'predefined' | 'custom'
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

/**
 * Predefined categories initialized on first app load
 */
export const PREDEFINED_CATEGORIES = [
  { id: 'cat-001', name: 'Food', type: 'predefined' },
  { id: 'cat-002', name: 'Transport', type: 'predefined' },
  { id: 'cat-003', name: 'Entertainment', type: 'predefined' },
  { id: 'cat-004', name: 'Bills', type: 'predefined' },
  { id: 'cat-005', name: 'Shopping', type: 'predefined' },
  { id: 'cat-006', name: 'Health', type: 'predefined' }
];
