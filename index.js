#!/usr/bin/env node
import * as p from '@clack/prompts';
import { setTimeout } from 'timers/promises';
import color from 'picocolors';
import { TodoManager } from './src/TodoManager.js';
import { Display } from './src/Display.js';
import { PromptHandler } from './src/PromptHandler.js';

class KarmaApp {
  constructor() {
    this.todoManager = new TodoManager();
    this.running = true;
  }

  async start() {
    try {
      Display.clearScreen();
      Display.showWelcome();
      
      await this.todoManager.init();
      await setTimeout(1000); // Brief pause for dramatic effect
      
      while (this.running) {
        await this.showMainMenu();
      }
    } catch (error) {
      Display.showError(`Application error: ${error.message}`);
      process.exit(1);
    }
  }

  async showMainMenu() {
    try {
      const choice = await PromptHandler.getMainMenuChoice();
      
      switch (choice) {
        case 'view':
          await this.viewTodos();
          break;
        case 'add':
          await this.addTodo();
          break;
        case 'edit':
          await this.editTodo();
          break;
        case 'toggle':
          await this.toggleTodo();
          break;
        case 'delete':
          await this.deleteTodo();
          break;
        case 'stats':
          await this.showStats();
          break;
        case 'search':
          await this.searchTodos();
          break;
        case 'categories':
          await this.manageCategories();
          break;
        case 'exit':
          await this.exit();
          break;
        default:
          Display.showError('Invalid choice!');
      }
    } catch (error) {
      Display.showError(`Menu error: ${error.message}`);
      await PromptHandler.pressAnyKey();
    }
  }

  async viewTodos() {
    try {
      const filter = await PromptHandler.getFilterChoice();
      
      if (filter === 'back') {
        return;
      }

      if (filter === 'category') {
        const categories = await this.todoManager.getCategories();
        if (categories.length === 0) {
          Display.showInfo('No categories found. Create some todos first!');
          await PromptHandler.pressAnyKey();
          return;
        }

        const selectedCategory = await PromptHandler.getCategoryFilter(categories);
        if (!selectedCategory) return;

        const todos = await this.todoManager.getTodos('all');
        const filteredTodos = todos.filter(todo => todo.category === selectedCategory);
        Display.showTodos(filteredTodos, `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Todos`);
      } else {
        const todos = await this.todoManager.getTodos(filter);
        const filterTitles = {
          all: 'All Todos',
          pending: 'Pending Todos',
          completed: 'Completed Todos',
          today: 'Due Today',
          tomorrow: 'Due Tomorrow',
          overdue: 'Overdue Todos'
        };
        Display.showTodos(todos, filterTitles[filter]);
      }

      await PromptHandler.pressAnyKey();
    } catch (error) {
      Display.showError(`Error viewing todos: ${error.message}`);
      await PromptHandler.pressAnyKey();
    }
  }

  async addTodo() {
    try {
      Display.showInfo('Create a new todo');
      const todoData = await PromptHandler.getNewTodoData();
      
      if (!todoData) {
        Display.showInfo('Todo creation cancelled.');
        await PromptHandler.pressAnyKey();
        return;
      }

      const newTodo = await PromptHandler.showSpinner(
        this.todoManager.addTodo(
          todoData.title,
          todoData.description,
          todoData.priority,
          todoData.dueDate,
          todoData.category
        ),
        'Creating todo...'
      );

      Display.showSuccess(`Todo "${newTodo.title}" created successfully!`);
      Display.showTodoDetails(newTodo);
      await PromptHandler.pressAnyKey();
    } catch (error) {
      Display.showError(`Error creating todo: ${error.message}`);
      await PromptHandler.pressAnyKey();
    }
  }

  async editTodo() {
    try {
      const todos = await this.todoManager.getTodos('all');
      if (todos.length === 0) {
        Display.showInfo('No todos to edit. Create some todos first!');
        await PromptHandler.pressAnyKey();
        return;
      }

      const todoId = await PromptHandler.getTodoSelection(todos, 'Select todo to edit:');
      if (!todoId) return;

      const todo = await this.todoManager.getTodoById(todoId);
      if (!todo) {
        Display.showError('Todo not found!');
        await PromptHandler.pressAnyKey();
        return;
      }

      Display.showTodoDetails(todo);
      const updates = await PromptHandler.getEditTodoData(todo);
      
      if (!updates) {
        Display.showInfo('Edit cancelled.');
        await PromptHandler.pressAnyKey();
        return;
      }

      const updatedTodo = await PromptHandler.showSpinner(
        this.todoManager.updateTodo(todoId, updates),
        'Updating todo...'
      );

      Display.showSuccess('Todo updated successfully!');
      Display.showTodoDetails(updatedTodo);
      await PromptHandler.pressAnyKey();
    } catch (error) {
      Display.showError(`Error editing todo: ${error.message}`);
      await PromptHandler.pressAnyKey();
    }
  }

  async toggleTodo() {
    try {
      const todos = await this.todoManager.getTodos('all');
      if (todos.length === 0) {
        Display.showInfo('No todos to toggle. Create some todos first!');
        await PromptHandler.pressAnyKey();
        return;
      }

      const todoId = await PromptHandler.getTodoSelection(todos, 'Select todo to toggle:');
      if (!todoId) return;

      const todo = await this.todoManager.getTodoById(todoId);
      if (!todo) {
        Display.showError('Todo not found!');
        await PromptHandler.pressAnyKey();
        return;
      }

      const action = todo.completed ? 'mark as pending' : 'mark as completed';
      const confirmed = await PromptHandler.confirmAction(
        `Are you sure you want to ${action}: "${todo.title}"?`
      );

      if (!confirmed) {
        Display.showInfo('Action cancelled.');
        await PromptHandler.pressAnyKey();
        return;
      }

      const updatedTodo = await PromptHandler.showSpinner(
        this.todoManager.toggleTodo(todoId),
        `${todo.completed ? 'Marking as pending' : 'Marking as completed'}...`
      );

      const statusMessage = updatedTodo.completed 
        ? `Todo "${updatedTodo.title}" marked as completed!`
        : `Todo "${updatedTodo.title}" marked as pending.`;

      Display.showSuccess(statusMessage);
      await PromptHandler.pressAnyKey();
    } catch (error) {
      Display.showError(`Error toggling todo: ${error.message}`);
      await PromptHandler.pressAnyKey();
    }
  }

  async deleteTodo() {
    try {
      const todos = await this.todoManager.getTodos('all');
      if (todos.length === 0) {
        Display.showInfo('No todos to delete. Create some todos first!');
        await PromptHandler.pressAnyKey();
        return;
      }

      const todoId = await PromptHandler.getTodoSelection(todos, 'Select todo to delete:');
      if (!todoId) return;

      const todo = await this.todoManager.getTodoById(todoId);
      if (!todo) {
        Display.showError('Todo not found!');
        await PromptHandler.pressAnyKey();
        return;
      }

      Display.showTodoDetails(todo);
      const confirmed = await PromptHandler.confirmAction(
        `Are you sure you want to delete "${todo.title}"? This action cannot be undone.`
      );

      if (!confirmed) {
        Display.showInfo('Delete cancelled.');
        await PromptHandler.pressAnyKey();
        return;
      }

      await PromptHandler.showSpinner(
        this.todoManager.deleteTodo(todoId),
        'Deleting todo...'
      );

      Display.showSuccess(`Todo "${todo.title}" deleted successfully!`);
      await PromptHandler.pressAnyKey();
    } catch (error) {
      Display.showError(`Error deleting todo: ${error.message}`);
      await PromptHandler.pressAnyKey();
    }
  }

  async showStats() {
    try {
      const stats = await this.todoManager.getStats();
      Display.showStats(stats);
      await PromptHandler.pressAnyKey();
    } catch (error) {
      Display.showError(`Error loading statistics: ${error.message}`);
      await PromptHandler.pressAnyKey();
    }
  }

  async searchTodos() {
    try {
      const query = await PromptHandler.getSearchQuery();
      if (!query) return;

      const allTodos = await this.todoManager.getTodos('all');
      const searchResults = allTodos.filter(todo => 
        todo.title.toLowerCase().includes(query.toLowerCase()) ||
        todo.description.toLowerCase().includes(query.toLowerCase()) ||
        todo.category.toLowerCase().includes(query.toLowerCase())
      );

      Display.showTodos(searchResults, `Search Results for "${query}"`);
      await PromptHandler.pressAnyKey();
    } catch (error) {
      Display.showError(`Error searching todos: ${error.message}`);
      await PromptHandler.pressAnyKey();
    }
  }

  async manageCategories() {
    try {
      const categories = await this.todoManager.getCategories();
      if (categories.length === 0) {
        Display.showInfo('No categories found. Categories are created automatically when you add todos.');
        await PromptHandler.pressAnyKey();
        return;
      }

      console.log('\n' + color.bold(color.blue('Available Categories:')));
      categories.forEach((category, index) => {
        console.log(color.gray(`${index + 1}. `) + color.cyan(`[${category.toUpperCase()}]`));
      });

      await PromptHandler.pressAnyKey();
    } catch (error) {
      Display.showError(`Error managing categories: ${error.message}`);
      await PromptHandler.pressAnyKey();
    }
  }

  async exit() {
    const confirmed = await PromptHandler.confirmAction('Are you sure you want to exit?');
    
    if (confirmed) {
      Display.clearScreen();
      console.log(color.cyan('Thank you for using Karma! Stay productive!'));
      this.running = false;
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  Display.clearScreen();
  console.log(color.cyan('\nGoodbye! Stay productive!'));
  process.exit(0);
});

// Start the application
const app = new KarmaApp();
app.start().catch(error => {
  Display.showError(`Fatal error: ${error.message}`);
  process.exit(1);
});