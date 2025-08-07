# Karma - CLI Todo Manager

A beautiful, professional todo list application for the command line with a clean and elegant interface.

Shoutout to <a href="https://www.github.com/adarsh-sng" target="_blank">Adarsh Singh</a> for the idea

## Features

### Elegant CLI Interface
- Clean, professional design without emojis
- Beautiful ASCII art branding
- Progress bars and visual indicators
- Responsive tables with proper borders
- Color-coded elements for better readability

### Complete Todo Management
- Add, edit, delete todos
- Categories: Work, Personal, Shopping, Health, Education, Finance, General
- Due dates with smart formatting (TODAY, TOMORROW, OVERDUE)
- Priority levels: [HIGH], [MEDIUM], [LOW]
- Rich descriptions and notes
- Toggle completion status

### Advanced Features
- Statistics dashboard with completion rates
- Powerful search functionality
- Multiple view filters:
  - All todos
  - Pending only
  - Completed only
  - Due today
  - Due tomorrow
  - Overdue items
  - Filter by category

### Data Persistence
- Local JSON storage
- Automatic data backup
- No external dependencies for data

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Link globally to use the `karma` command:
   ```bash
   npm link
   ```

## Usage

Run the application using the global command:
```bash
karma
```

Or locally:
```bash
npm start
```

Or directly with node:
```bash
node index.js
```

## Project Structure

```
karma/
├── src/
│   ├── TodoManager.js    # Core todo operations and data management
│   ├── Display.js        # UI components and visual formatting
│   └── PromptHandler.js  # User input handling and prompts
├── data/
│   └── todos.json        # Your todo data (created automatically)
├── package.json
├── index.js             # Main application entry point
└── README.md
```

## Features Walkthrough

### Welcome Screen
Beautiful ASCII art welcome screen with elegant branding.

### Main Menu
Clean, professional menu layout:
```
┌─ Main Menu ─────────────────────────────────────┐
│  1. View Todos                                   │
│  2. Add Todo                                     │
│  3. Edit Todo                                    │
│  4. Toggle Todo                                  │
│  5. Delete Todo                                  │
│  6. Statistics                                   │
│  7. Search Todos                                 │
│  8. Manage Categories                            │
│  9. Exit                                         │
└─────────────────────────────────────────────────┘
```

### Adding Todos
Professional guided prompts for creating new todos:
- Title (required)
- Description (optional)
- Priority level: High Priority, Medium Priority, Low Priority
- Category selection with clean labels
- Optional due date in YYYY-MM-DD format

### Statistics Dashboard
Clean visual representation of your productivity:
- Total todos
- Completed count
- Pending count
- Due today
- Overdue items
- Completion rate with ASCII progress bar

### Professional Table View
Elegant table layout with proper borders:
```
┌────────┬──────────┬──────────┬──────────────┬──────────────────────┬─────────────┬────────────┐
│ ID     │ Status   │ Priority │ Category     │ Title                │ Due Date    │ Created    │
├────────┼──────────┼──────────┼──────────────┼──────────────────────┼─────────────┼────────────┤
│ abc123 │ [DONE]   │ [HIGH]   │ [WORK]       │ Complete project     │ TODAY       │ Aug 07     │
└────────┴──────────┴──────────┴──────────────┴──────────────────────┴─────────────┴────────────┘
```

### Visual Elements
- Clean status indicators: [DONE], [PENDING]
- Priority levels: [HIGH], [MEDIUM], [LOW]
- Category labels: [WORK], [PERSONAL], [SHOPPING], etc.
- Smart date formatting: TODAY, TOMORROW, OVERDUE, specific dates
- Professional boxed messages for SUCCESS, ERROR, INFO
- Progress bars using ASCII characters

## Elegant Design Principles

- **No Emojis**: Clean, professional appearance suitable for all environments
- **Consistent Formatting**: All labels use bracket notation [LIKE THIS]
- **Color Coding**: Meaningful colors for status, priority, and dates
- **Proper Spacing**: Well-structured tables and menus
- **ASCII Art**: Professional typography for branding

## Data Storage

Your todos are stored locally in `data/todos.json`. Each todo contains:

```json
{
  "id": "unique-id",
  "title": "Todo title",
  "description": "Optional description",
  "completed": false,
  "priority": "medium",
  "category": "work",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "createdAt": "2024-08-07T12:00:00.000Z",
  "completedAt": null
}
```

## Global Command Setup

After running `npm link`, you can use `karma` from anywhere in your terminal:

```bash
# From any directory
karma

# This will launch the elegant todo manager
```

## Dependencies

- `@clack/prompts` - Beautiful CLI prompts
- `picocolors` - Terminal colors
- `cli-table3` - Professional tables
- `boxen` - Elegant terminal boxes
- `figlet` - ASCII art text
- `date-fns` - Date formatting
- `fs-extra` - Enhanced file system operations

## Tips

1. **Navigation**: Use arrow keys to navigate menus
2. **Canceling**: Press Ctrl+C or Esc to cancel operations
3. **Due Dates**: Enter dates in YYYY-MM-DD format
4. **Search**: Search works across titles, descriptions, and categories
5. **Global Access**: Use `karma` command from any directory after linking

## Professional Features

- Clean interface
- Professional ASCII art branding
- Consistent bracket notation for all labels
- Well-structured tables with proper borders
- Color-coded elements without visual clutter
- Elegant boxed messages and prompts

---

Built for professionals who appreciate clean, elegant command-line interfaces.
