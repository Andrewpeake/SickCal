# SickCal - Sleek Calendar App

A modern, intuitive calendar application built with React, TypeScript, and Tailwind CSS. SickCal provides a beautiful and functional calendar experience with event and task management capabilities.

## Features

### 🗓️ Calendar Views
- **Day View**: Detailed view of a single day with time slots
- **Week View**: Weekly overview with time-based layout
- **Month View**: Traditional monthly calendar grid
- **Year View**: Annual overview (coming soon)

### 📅 Event Management
- Create, edit, and delete events
- Color-coded events with custom colors
- All-day event support
- Event descriptions and locations
- Attendee management
- Start and end time selection

### ✅ Task Management
- Create, edit, and delete tasks
- Priority levels (Low, Medium, High)
- Task categories (Work, Personal, Health, etc.)
- Completion tracking
- Due date management

### 🎨 Beautiful UI
- Modern, clean design with smooth animations
- Responsive layout that works on all devices
- Intuitive navigation with previous/next controls
- Today button for quick navigation
- Hover effects and visual feedback

### 💾 Data Persistence
- Local storage for events and tasks
- Data persists between browser sessions
- No external dependencies for data storage

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SickCal
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

To create a production build:

```bash
npm run build
```

The build files will be created in the `build` folder.

## Usage

### Navigation
- Use the arrow buttons to navigate between periods
- Click "Today" to quickly return to the current date
- Switch between Day, Week, Month, and Year views using the view selector

### Adding Events
1. Click the "Add Event" button in the navigation or sidebar
2. Fill in the event details (title, date, time, description, etc.)
3. Choose a color for the event
4. Add attendees if needed
5. Click "Create Event" to save

### Adding Tasks
1. Click the "Add Task" button in the sidebar
2. Enter the task title and description
3. Set the due date and priority level
4. Choose a category
5. Click "Create Task" to save

### Managing Events and Tasks
- Click on any event or task to edit it
- Use the delete button to remove items
- Mark tasks as completed by checking the completion box

## Technology Stack

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **date-fns**: Modern date utility library
- **Lucide React**: Beautiful icon library
- **clsx**: Conditional className utility

## Project Structure

```
src/
├── components/          # React components
│   ├── Navigation.tsx   # Calendar navigation
│   ├── CalendarGrid.tsx # Main calendar display
│   ├── EventModal.tsx   # Event creation/editing modal
│   ├── TaskModal.tsx    # Task creation/editing modal
│   └── Sidebar.tsx      # Sidebar with quick actions
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── dateUtils.ts
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
└── index.css            # Global styles
```

## Customization

### Colors
The app uses a custom color palette defined in `tailwind.config.js`. You can modify the primary colors and other design tokens to match your brand.

### Styling
All styling is done with Tailwind CSS classes. The design system is defined in `src/index.css` with custom component classes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- [ ] Year view implementation
- [ ] Recurring events
- [ ] Event reminders and notifications
- [ ] Calendar sharing and collaboration
- [ ] Multiple calendar support
- [ ] Dark mode theme
- [ ] Mobile app version
- [ ] Cloud synchronization
- [ ] Calendar import/export (ICS format)
- [ ] Advanced search and filtering # Trigger deployment
