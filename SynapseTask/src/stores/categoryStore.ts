import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, CreateCategoryInput } from '../types';

interface CategoryState {
  categories: Category[];
  
  // Actions
  createCategory: (input: CreateCategoryInput) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: Category[]) => void;
  getCategoryById: (id: string) => Category | undefined;
  resetToDefaults: () => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: 'purple', icon: '💼', isDefault: true, order: 0 },
  { id: 'personal', name: 'Personal', color: 'green', icon: '🏠', isDefault: true, order: 1 },
  { id: 'health', name: 'Health', color: 'rose', icon: '💪', isDefault: true, order: 2 },
  { id: 'study', name: 'Study', color: 'blue', icon: '📚', isDefault: true, order: 3 },
  { id: 'finance', name: 'Finance', color: 'emerald', icon: '💰', isDefault: true, order: 4 },
  { id: 'creative', name: 'Creative', color: 'orange', icon: '🎨', isDefault: true, order: 5 },
];

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,

      createCategory: (input) => {
        const newCategory: Category = {
          id: crypto.randomUUID(),
          name: input.name,
          color: input.color,
          icon: input.icon,
          isDefault: false,
          order: get().categories.length,
        };
        
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
        
        return newCategory;
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      reorderCategories: (categories) => {
        set({
          categories: categories.map((c, index) => ({ ...c, order: index })),
        });
      },

      getCategoryById: (id) => {
        return get().categories.find((c) => c.id === id);
      },

      resetToDefaults: () => {
        set({ categories: DEFAULT_CATEGORIES });
      },
    }),
    {
      name: 'synapse-categories',
    }
  )
);
