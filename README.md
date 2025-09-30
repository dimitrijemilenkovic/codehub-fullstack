# �� CodeHub - Full Stack Developer Productivity App

![CodeHub Dashboard](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-20.11.0-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.0-blue)

## 📋 Pregled

CodeHub je moderna full-stack aplikacija dizajnirana za povećanje produktivnosti developera. Kombinuje task management, code snippet storage, Pomodoro timer i achievement sistem u jednu sveobuhvatnu platformu.

## ✨ Funkcionalnosti

### 🎯 Task Management
- **Kreiranje i upravljanje taskovima** sa prioritetima (nizak, srednji, visok)
- **Status tracking** (To-Do, Doing, Done)
- **Due date management** sa kalendar prikazom
- **Filtering i search** po statusu i prioritetu
- **Real-time updates** sa drag & drop funkcionalnostima

### 💻 Code Snippets
- **Syntax highlighting** za 8+ programskih jezika
- **Organizacija po kategorijama** (JavaScript, TypeScript, Python, Java, C#, HTML, CSS, SQL)
- **Quick search i filtering**
- **Copy-to-clipboard** funkcionalnost
- **Version control** za snippet-ove

### 🍅 Pomodoro Timer
- **Customizable timer** (25min work, 5min break)
- **Session tracking** sa statistikama
- **Focus time analytics** sa grafikom
- **Break reminders** sa notifikacijama
- **Productivity insights**

### 🏆 Achievement System
- **12 unique achievements** za motivaciju
- **Progress tracking** sa procentima
- **Unlock notifications** u real-time
- **Gamification elements** za engagement

### 📊 Analytics Dashboard
- **Focus time charts** (7-day view)
- **Task completion velocity**
- **Productivity metrics**
- **Personal statistics**
- **Interactive calendar**

## 🛠️ Tehnologije

### Frontend
- **React 18.2.0** - Modern UI library
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **React Syntax Highlighter** - Code display
- **CSS3** - Custom styling system

### Backend
- **Node.js 20.11.0** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL 14** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## 🚀 Brzo Pokretanje

### 1. Instalacija
```bash
npm install
```

### 2. Pokretanje
```bash
npm run dev
```

Aplikacija će biti dostupna na:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### 3. Database Setup
```bash
cd server
node scripts/setup-db.js
```

## 📱 Korišćenje

1. **Registracija** - Kreirajte novi nalog
2. **Login** - Prijavite se
3. **Dashboard** - Pregledajte produktivnost
4. **Tasks** - Upravljajte taskovima
5. **Snippets** - Sačuvajte kod
6. **Pomodoro** - Fokusirajte se

## 🎨 Screenshots

### Dashboard
- Interaktivni grafikon fokus vremena
- Statistike taskova
- Achievement sistem
- Kalendar prikaz

### Task Management
- Drag & drop interface
- Priority system
- Status tracking
- Due date management

### Code Snippets
- Syntax highlighting
- Language categorization
- Search functionality
- Edit/Delete options

## 🔧 Development

### Struktura Projekta
```
codehub-fullstack/
├── server/                 # Backend API
│   ├── controllers/        # Route handlers
│   ├── services/          # Business logic
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & validation
│   └── scripts/           # Database setup
├── codehub-react/         # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API calls
│   │   └── styles/        # CSS files
│   └── public/            # Static assets
└── package.json           # Root dependencies
```

### Scripts
```bash
npm run dev          # Pokretanje oba servera
npm run dev:server   # Samo backend
npm run dev:client   # Samo frontend
npm run build        # Production build
```

## 📊 Database Schema

### Users
- id, username, email, password_hash, created_at

### Tasks
- id, user_id, title, description, priority, status, due_date, created_at, updated_at

### Snippets
- id, user_id, title, language, code, created_at, updated_at

### Focus Sessions
- id, user_id, duration_minutes, created_at

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd codehub-react
npm run build

# Backend
cd ../server
npm start
```

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-production-secret
PORT=3001
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Autor

**Dimitrije Milenković**
- GitHub: [@dimitrijemilenkovic](https://github.com/dimitrijemilenkovic)

---

⭐ **Ako vam se sviđa projekat, ostavite zvezdu!** ⭐
