import fs from 'fs-extra';
import path from 'path';
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

export class TodoManager {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.todoFile = path.join(this.dataDir, 'todos.json');
    this.init();
  }

  async init() {
    await fs.ensureDir(this.dataDir);
    if (!await fs.pathExists(this.todoFile)) {
      await this.saveTodos([]);
    }
  }

  async loadTodos() {
    try {
      const data = await fs.readJSON(this.todoFile);
      return data || [];
    } catch (error) {
      return [];
    }
  }

  async saveTodos(todos) {
    await fs.writeJSON(this.todoFile, todos, { spaces: 2 });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async addTodo(title, description = '', priority = 'medium', dueDate = null, category = 'general') {
    const todos = await this.loadTodos();
    const newTodo = {
      id: this.generateId(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      priority,
      category,
      dueDate,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    
    todos.push(newTodo);
    await this.saveTodos(todos);
    return newTodo;
  }

  async getTodos(filter = 'all') {
    const todos = await this.loadTodos();
    
    switch (filter) {
      case 'completed':
        return todos.filter(todo => todo.completed);
      case 'pending':
        return todos.filter(todo => !todo.completed);
      case 'today':
        return todos.filter(todo => {
          if (!todo.dueDate) return false;
          return isToday(parseISO(todo.dueDate));
        });
      case 'tomorrow':
        return todos.filter(todo => {
          if (!todo.dueDate) return false;
          return isTomorrow(parseISO(todo.dueDate));
        });
      case 'overdue':
        return todos.filter(todo => {
          if (!todo.dueDate || todo.completed) return false;
          return new Date(todo.dueDate) < new Date();
        });
      default:
        return todos;
    }
  }

  async getTodoById(id) {
    const todos = await this.loadTodos();
    return todos.find(todo => todo.id === id);
  }

  async toggleTodo(id) {
    const todos = await this.loadTodos();
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }

    todos[todoIndex].completed = !todos[todoIndex].completed;
    todos[todoIndex].completedAt = todos[todoIndex].completed ? new Date().toISOString() : null;
    
    await this.saveTodos(todos);
    return todos[todoIndex];
  }

  async updateTodo(id, updates) {
    const todos = await this.loadTodos();
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }

    todos[todoIndex] = { ...todos[todoIndex], ...updates };
    await this.saveTodos(todos);
    return todos[todoIndex];
  }

  async deleteTodo(id) {
    const todos = await this.loadTodos();
    const filteredTodos = todos.filter(todo => todo.id !== id);
    
    if (todos.length === filteredTodos.length) {
      throw new Error('Todo not found');
    }

    await this.saveTodos(filteredTodos);
    return true;
  }

  async getCategories() {
    const todos = await this.loadTodos();
    const categories = [...new Set(todos.map(todo => todo.category))];
    return categories.filter(cat => cat);
  }

  async getStats() {
    const todos = await this.loadTodos();
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const overdue = todos.filter(todo => {
      if (!todo.dueDate || todo.completed) return false;
      return new Date(todo.dueDate) < new Date();
    }).length;

    const today = todos.filter(todo => {
      if (!todo.dueDate) return false;
      return isToday(parseISO(todo.dueDate));
    }).length;

    return { total, completed, pending, overdue, today };
  }

  formatDate(dateString) {
    if (!dateString) return 'No due date';
    
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    
    return format(date, 'MMM dd, yyyy');
  }

  getPriorityColor(priority) {
    switch (priority) {
      case 'high': return '[HIGH]';
      case 'medium': return '[MED]';
      case 'low': return '[LOW]';
      default: return '[NONE]';
    }
  }

  getCategoryIcon(category) {
    return `[${(category || 'GENERAL').toUpperCase()}]`;
  }
}
