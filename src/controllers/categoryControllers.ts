// src/controllers/categoryController.ts
import { Request, Response } from 'express';
import { CategoryService } from '../services/category';

export const CategoryController = {
  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (error: any) {
      console.error('Error fetching categories:', error.message);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  },

  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(200).json(category);
    } catch (error: any) {
      console.error('Error fetching category by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  },

  async createCategory(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      const newCategory = await CategoryService.createCategory(name);
      res.status(201).json(newCategory);
    } catch (error: any) {
      console.error('Error creating category:', error.message);
      res.status(400).json({ error: error.message || 'Failed to create category' });
    }
  },

  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      const updatedCategory = await CategoryService.updateCategory(id, name);
      res.status(200).json(updatedCategory);
    } catch (error: any) {
      console.error('Error updating category:', error.message);
      res.status(400).json({ error: error.message || 'Failed to update category' });
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CategoryService.deleteCategory(id);
      res.status(204).send(); // No Content
    } catch (error: any) {
      console.error('Error deleting category:', error.message);
      res.status(400).json({ error: error.message || 'Failed to delete category' });
    }
  },
};