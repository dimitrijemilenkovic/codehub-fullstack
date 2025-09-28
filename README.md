# CodeHub - Fullstack Productivity App

A modern fullstack application for task management, code snippets, and productivity tracking with Pomodoro timer.

## 🚀 Features

- **Task Management** - Create, update, and track tasks with different statuses (todo/doing/done)
- **Code Snippets** - Save and organize code snippets with syntax highlighting
- **Pomodoro Timer** - Focus sessions with automatic breaks
- **Achievements** - Gamified productivity system
- **Dashboard** - Statistics and quick actions
- **Dark/Light Theme** - Responsive design with theme switching

## 🛠️ Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS 4.1
- React Router
- Recharts for data visualization
- React Syntax Highlighter

### Backend
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Bcrypt for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v20+)
- PostgreSQL database

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/dimitrijemilenkovic/codehub-fullstack.git
cd codehub-fullstack
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Setup database**
```bash
cd server
npm run db:setup
```

4. **Configure environment**
Create `.env` file in `server/` directory:
```env
PGHOST=localhost
PGPORT=5432
PGUSER=codehub
PGPASSWORD=codehub_pass
PGDATABASE=codehub_db
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
NODE_ENV=development
```

5. **Start the application**
```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:client  # Frontend on http://localhost:5173
npm run dev:server  # Backend on http://localhost:3001
```

## 🎯 Usage

1. **Register/Login** - Create an account or use demo credentials
2. **Dashboard** - View your productivity stats and quick actions
3. **Tasks** - Manage your todo list with different priorities
4. **Snippets** - Save and organize code snippets
5. **Pomodoro** - Use the timer for focused work sessions
6. **Achievements** - Unlock achievements by completing tasks

## 📁 Project Structure

```
├── codehub-react/          # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API and auth services
│   │   ├── charts/         # Data visualization
│   │   └── styles/         # CSS styles
└── server/                 # Node.js backend
    ├── controllers/        # API controllers
    ├── routes/            # API routes
    ├── middleware/        # Auth middleware
    ├── services/          # Business logic
    └── scripts/           # Database setup
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Snippets
- `GET /api/snippets` - Get user snippets
- `POST /api/snippets` - Create new snippet
- `PUT /api/snippets/:id` - Update snippet
- `DELETE /api/snippets/:id` - Delete snippet

### Metrics
- `GET /api/metrics/velocity` - Task completion velocity
- `GET /api/metrics/focus` - Focus session data

## 🎨 Features

- **Responsive Design** - Works on desktop and mobile
- **Dark/Light Theme** - Toggle between themes
- **Real-time Updates** - Live data synchronization
- **Achievement System** - Gamified productivity
- **Pomodoro Timer** - Focus session management
- **Code Syntax Highlighting** - Beautiful code display

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Dimitrije Milenkovic**
- GitHub: [@dimitrijemilenkovic](https://github.com/dimitrijemilenkovic)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
