import Table from 'cli-table3';
import color from 'picocolors';
import boxen from 'boxen';
import figlet from 'figlet';

export class Display {
  static showWelcome() {
    const title = figlet.textSync('KARMA', {
      font: 'ANSI Shadow',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    });

    const welcomeBox = boxen(
      color.cyan(title) + '\n\n' +
      color.white('Your Notion-like CLI Todo Manager') + '\n' +
      color.gray('Stay organized, stay productive!'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan',
        backgroundColor: 'black'
      }
    );

    console.log(welcomeBox);
  }

  static showMainMenu() {
    const menuItems = [
      'View Todos',
      'Add Todo', 
      'Edit Todo',
      'Toggle Todo',
      'Delete Todo',
      'Statistics',
      'Search Todos',
      'Manage Categories',
      'Exit'
    ];

    console.log('\n' + color.bold(color.blue('┌─ Main Menu ─────────────────────────────────────┐')));
    menuItems.forEach((item, index) => {
      const number = `${index + 1}`.padStart(2, ' ');
      console.log(color.blue('│ ') + color.gray(`${number}. `) + color.white(item.padEnd(44, ' ')) + color.blue(' │'));
    });
    console.log(color.blue('└─────────────────────────────────────────────────┘\n'));
  }

  static showTodos(todos, title = 'Your Todos') {
    if (todos.length === 0) {
      const emptyBox = boxen(
        color.yellow('No todos found!') + '\n' +
        color.gray('Add your first todo to get started.'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'yellow'
        }
      );
      console.log(emptyBox);
      return;
    }

    console.log('\n' + color.bold(color.blue(title)));
    
    const table = new Table({
      head: [
        color.cyan('ID'),
        color.cyan('Status'),
        color.cyan('Priority'),
        color.cyan('Category'),
        color.cyan('Title'),
        color.cyan('Due Date'),
        color.cyan('Created')
      ],
      style: {
        head: [],
        border: ['gray']
      },
      colWidths: [8, 10, 10, 12, 40, 15, 12]
    });

    todos.forEach(todo => {
      const status = todo.completed 
        ? color.green('[DONE]') 
        : color.yellow('[PENDING]');
      
      const priority = this.getPriorityDisplay(todo.priority);
      const category = this.getCategoryDisplay(todo.category);
      const title = todo.completed 
        ? color.strikethrough(color.gray(todo.title))
        : color.white(todo.title);
      
      const dueDate = this.formatDueDate(todo.dueDate);
      const created = this.formatCreatedDate(todo.createdAt);

      table.push([
        color.gray(todo.id.slice(-6)),
        status,
        priority,
        category,
        title,
        dueDate,
        created
      ]);
    });

    console.log(table.toString());
  }

  static showTodoDetails(todo) {
    const statusIcon = todo.completed ? '[COMPLETED]' : '[PENDING]';
    const statusText = todo.completed ? 'Completed' : 'Pending';
    const statusColor = todo.completed ? color.green : color.yellow;

    const details = [
      `Status: ${statusColor(statusIcon)}`,
      '',
      `${color.bold('Title:')} ${color.white(todo.title)}`,
      `${color.bold('Description:')} ${color.gray(todo.description || 'No description')}`,
      `${color.bold('Priority:')} ${this.getPriorityDisplay(todo.priority)}`,
      `${color.bold('Category:')} ${this.getCategoryDisplay(todo.category)}`,
      `${color.bold('Due Date:')} ${this.formatDueDate(todo.dueDate)}`,
      `${color.bold('Created:')} ${this.formatCreatedDate(todo.createdAt)}`,
    ];

    if (todo.completed && todo.completedAt) {
      details.push(`${color.bold('Completed:')} ${this.formatCreatedDate(todo.completedAt)}`);
    }

    const detailsBox = boxen(
      details.join('\n'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: todo.completed ? 'green' : 'yellow',
        title: `Todo Details - ${todo.id.slice(-6)}`
      }
    );

    console.log(detailsBox);
  }

  static showStats(stats) {
    const statsDisplay = [
      `${color.bold('Total Todos:')} ${color.white(stats.total)}`,
      `${color.bold('Completed:')} ${color.green(stats.completed)}`,
      `${color.bold('Pending:')} ${color.yellow(stats.pending)}`,
      `${color.bold('Due Today:')} ${color.blue(stats.today)}`,
      `${color.bold('Overdue:')} ${color.red(stats.overdue)}`
    ];

    const completionRate = stats.total > 0 
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;

    statsDisplay.push('');
    statsDisplay.push(`${color.bold('Completion Rate:')} ${this.getCompletionRateDisplay(completionRate)}`);

    const statsBox = boxen(
      statsDisplay.join('\n'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'blue',
        title: 'Statistics'
      }
    );

    console.log(statsBox);
  }

  static getCompletionRateDisplay(rate) {
    const barLength = 20;
    const filled = Math.round((rate / 100) * barLength);
    const empty = barLength - filled;
    
    const bar = color.green('█'.repeat(filled)) + color.gray('░'.repeat(empty));
    const rateColor = rate >= 75 ? color.green : rate >= 50 ? color.yellow : color.red;
    
    return `${bar} ${rateColor(rate + '%')}`;
  }

  static getPriorityDisplay(priority) {
    switch (priority) {
      case 'high':
        return color.red('[HIGH]');
      case 'medium':
        return color.yellow('[MEDIUM]');
      case 'low':
        return color.green('[LOW]');
      default:
        return color.gray('[NONE]');
    }
  }

  static getCategoryDisplay(category) {
    return color.cyan(`[${(category || 'GENERAL').toUpperCase()}]`);
  }

  static formatDueDate(dateString) {
    if (!dateString) {
      return color.gray('No due date');
    }

    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dueDate < today) {
      return color.red('OVERDUE');
    } else if (dueDate.getTime() === today.getTime()) {
      return color.blue('TODAY');
    } else if (dueDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000) {
      return color.yellow('TOMORROW');
    } else {
      const options = { month: 'short', day: 'numeric' };
      return color.white(date.toLocaleDateString('en-US', options));
    }
  }

  static formatCreatedDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return color.gray(date.toLocaleDateString('en-US', options));
  }

  static showError(message) {
    const errorBox = boxen(
      color.red('ERROR') + '\n' + color.white(message),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'red'
      }
    );
    console.log(errorBox);
  }

  static showSuccess(message) {
    const successBox = boxen(
      color.green('SUCCESS') + '\n' + color.white(message),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    );
    console.log(successBox);
  }

  static showInfo(message) {
    const infoBox = boxen(
      color.blue('INFO') + '\n' + color.white(message),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'blue'
      }
    );
    console.log(infoBox);
  }

  static showFilterMenu() {
    const filters = [
      'All Todos',
      'Pending',
      'Completed', 
      'Due Today',
      'Due Tomorrow',
      'Overdue',
      'By Category',
      'Back to Main Menu'
    ];

    console.log('\n' + color.bold(color.blue('┌─ Filter Options ───────────────────────────────┐')));
    filters.forEach((item, index) => {
      const number = `${index + 1}`.padStart(2, ' ');
      console.log(color.blue('│ ') + color.gray(`${number}. `) + color.white(item.padEnd(42, ' ')) + color.blue(' │'));
    });
    console.log(color.blue('└─────────────────────────────────────────────────┘\n'));
  }

  static clearScreen() {
    console.clear();
  }

  static showLoading(message = 'Processing...') {
    console.log(color.gray('▸ ' + message));
  }
}
