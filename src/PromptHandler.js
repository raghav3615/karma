import * as p from '@clack/prompts';
import color from 'picocolors';

export class PromptHandler {
  static async getMainMenuChoice() {
    const choice = await p.select({
      message: 'What would you like to do?',
      options: [
        { value: 'view', label: 'View Todos' },
        { value: 'add', label: 'Add Todo' },
        { value: 'edit', label: 'Edit Todo' },
        { value: 'toggle', label: 'Toggle Todo' },
        { value: 'delete', label: 'Delete Todo' },
        { value: 'stats', label: 'Statistics' },
        { value: 'search', label: 'Search Todos' },
        { value: 'categories', label: 'Manage Categories' },
        { value: 'exit', label: 'Exit' }
      ]
    });

    if (p.isCancel(choice)) {
      process.exit(0);
    }

    return choice;
  }

  static async getFilterChoice() {
    const filter = await p.select({
      message: 'How would you like to filter your todos?',
      options: [
        { value: 'all', label: 'All Todos' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'today', label: 'Due Today' },
        { value: 'tomorrow', label: 'Due Tomorrow' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'category', label: 'By Category' },
        { value: 'back', label: 'Back to Main Menu' }
      ]
    });

    if (p.isCancel(filter)) {
      return 'back';
    }

    return filter;
  }

  static async getNewTodoData() {
    const todoData = await p.group({
      title: () => p.text({
        message: 'What do you need to do?',
        placeholder: 'Enter todo title...',
        validate: (value) => {
          if (!value.trim()) return 'Title is required!';
        }
      }),
      description: () => p.text({
        message: 'Add a description (optional):',
        placeholder: 'Enter description...'
      }),
      priority: () => p.select({
        message: 'Set priority:',
        options: [
          { value: 'high', label: 'High Priority' },
          { value: 'medium', label: 'Medium Priority' },
          { value: 'low', label: 'Low Priority' }
        ]
      }),
      category: () => p.select({
        message: 'Choose category:',
        options: [
          { value: 'work', label: 'Work' },
          { value: 'personal', label: 'Personal' },
          { value: 'shopping', label: 'Shopping' },
          { value: 'health', label: 'Health' },
          { value: 'education', label: 'Education' },
          { value: 'finance', label: 'Finance' },
          { value: 'general', label: 'General' }
        ]
      }),
      hasDueDate: () => p.confirm({
        message: 'Set a due date?',
        initialValue: false
      }),
      dueDate: ({ results }) => {
        if (!results.hasDueDate) return null;
        
        return p.text({
          message: 'Enter due date (YYYY-MM-DD):',
          placeholder: '2024-12-31',
          validate: (value) => {
            if (!value) return 'Date is required when setting due date!';
            const date = new Date(value);
            if (isNaN(date.getTime())) return 'Invalid date format! Use YYYY-MM-DD';
            if (date < new Date().setHours(0, 0, 0, 0)) return 'Due date cannot be in the past!';
          }
        });
      }
    });

    if (p.isCancel(todoData)) {
      return null;
    }

    return {
      title: todoData.title,
      description: todoData.description || '',
      priority: todoData.priority,
      category: todoData.category,
      dueDate: todoData.dueDate ? new Date(todoData.dueDate).toISOString() : null
    };
  }

  static async getTodoSelection(todos, message = 'Select a todo:') {
    if (todos.length === 0) {
      return null;
    }

    const options = todos.map(todo => ({
      value: todo.id,
      label: this.formatTodoForSelection(todo)
    }));

    options.push({ value: 'back', label: 'Back to Main Menu' });

    const selection = await p.select({
      message,
      options
    });

    if (p.isCancel(selection) || selection === 'back') {
      return null;
    }

    return selection;
  }

  static formatTodoForSelection(todo) {
    const status = todo.completed ? '[DONE]' : '[PENDING]';
    const priority = this.getPriorityIcon(todo.priority);
    const category = `[${todo.category.toUpperCase()}]`;
    const title = todo.title.length > 35 ? todo.title.slice(0, 32) + '...' : todo.title;
    
    return `${status} ${priority} ${category} ${title}`;
  }

  static getPriorityIcon(priority) {
    switch (priority) {
      case 'high': return '[HIGH]';
      case 'medium': return '[MED]';
      case 'low': return '[LOW]';
      default: return '[NONE]';
    }
  }

  static getCategoryIcon(category) {
    return `[${(category || 'GENERAL').toUpperCase()}]`;
  }

  static async getEditTodoData(todo) {
    const updates = await p.group({
      title: () => p.text({
        message: 'Update title:',
        placeholder: todo.title,
        initialValue: todo.title,
        validate: (value) => {
          if (!value.trim()) return 'Title is required!';
        }
      }),
      description: () => p.text({
        message: 'Update description:',
        placeholder: todo.description || 'Enter description...',
        initialValue: todo.description || ''
      }),
      priority: () => p.select({
        message: 'Update priority:',
        initialValue: todo.priority,
        options: [
          { value: 'high', label: 'High Priority' },
          { value: 'medium', label: 'Medium Priority' },
          { value: 'low', label: 'Low Priority' }
        ]
      }),
      category: () => p.select({
        message: 'Update category:',
        initialValue: todo.category,
        options: [
          { value: 'work', label: 'Work' },
          { value: 'personal', label: 'Personal' },
          { value: 'shopping', label: 'Shopping' },
          { value: 'health', label: 'Health' },
          { value: 'education', label: 'Education' },
          { value: 'finance', label: 'Finance' },
          { value: 'general', label: 'General' }
        ]
      }),
      updateDueDate: () => p.confirm({
        message: 'Update due date?',
        initialValue: false
      }),
      dueDate: ({ results }) => {
        if (!results.updateDueDate) return todo.dueDate;
        
        return p.text({
          message: 'Enter new due date (YYYY-MM-DD) or leave empty to remove:',
          placeholder: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '2024-12-31',
          validate: (value) => {
            if (!value) return; // Allow empty to remove due date
            const date = new Date(value);
            if (isNaN(date.getTime())) return 'Invalid date format! Use YYYY-MM-DD';
          }
        });
      }
    });

    if (p.isCancel(updates)) {
      return null;
    }

    return {
      title: updates.title,
      description: updates.description,
      priority: updates.priority,
      category: updates.category,
      dueDate: updates.dueDate && updates.dueDate.trim() 
        ? new Date(updates.dueDate).toISOString() 
        : null
    };
  }

  static async getCategoryFilter(categories) {
    const options = categories.map(cat => ({
      value: cat,
      label: `[${cat.toUpperCase()}]`
    }));

    options.push({ value: 'back', label: 'Back to Filters' });

    const selection = await p.select({
      message: 'Select category:',
      options
    });

    if (p.isCancel(selection) || selection === 'back') {
      return null;
    }

    return selection;
  }

  static async getSearchQuery() {
    const query = await p.text({
      message: 'Search todos:',
      placeholder: 'Enter search term...',
      validate: (value) => {
        if (!value.trim()) return 'Search term is required!';
      }
    });

    if (p.isCancel(query)) {
      return null;
    }

    return query.trim();
  }

  static async confirmAction(message) {
    const confirmed = await p.confirm({
      message,
      initialValue: false
    });

    if (p.isCancel(confirmed)) {
      return false;
    }

    return confirmed;
  }

  static async pressAnyKey(message = 'Press any key to continue...') {
    await p.text({
      message,
      placeholder: '',
      validate: () => true
    });
  }

  static async showSpinner(promise, message = 'Processing...') {
    const spinner = p.spinner();
    spinner.start(message);
    
    try {
      const result = await promise;
      spinner.stop(color.green('✅ Done'));
      return result;
    } catch (error) {
      spinner.stop(color.red('❌ Error'));
      throw error;
    }
  }
}
