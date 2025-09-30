# 📐 Backend Arhitektura - CodeHub

## 🏗️ Struktura Projekta

```
server/
├── index.js                 # Glavni entry point
├── config/
│   ├── database.js         # PostgreSQL konekcija
│   └── index.js            # Generalne konfiguracije
├── middleware/
│   └── auth.js             # JWT autentifikacija
├── routes/
│   ├── authRoutes.js       # Login/Register rute
│   ├── taskRoutes.js       # Task management rute
│   ├── snippetRoutes.js    # Code snippets rute
│   ├── focusRoutes.js      # Pomodoro sesije rute
│   ├── metricRoutes.js     # Metrici i grafikoni
│   └── achievementRoutes.js # Achievement sistem
├── controllers/
│   ├── authController.js   # Auth logika
│   ├── taskController.js   # Task logika
│   ├── snippetController.js
│   ├── focusController.js
│   ├── metricController.js
│   └── achievementController.js
└── services/
    ├── authService.js      # Auth business logika
    ├── taskService.js      # Task business logika
    ├── snippetService.js
    ├── focusService.js
    ├── metricService.js
    └── achievementService.js
```

## 🔄 Request Flow

```
Request → Middleware → Route → Controller → Service → Database
                                    ↓
Response ← Controller ← Service ←───┘
```

### Primer: Login Request

1. **Request**: `POST /api/login`
2. **Route** (`authRoutes.js`): Prima request i prosleđuje kontroleru
3. **Controller** (`authController.js`): Validira input
4. **Service** (`authService.js`): Izvršava business logiku (provera passworda, JWT generisanje)
5. **Database**: Query za pronalaženje usera
6. **Response**: Vraća token i user podatke

## 📁 Opis Slojeva

### 1. **Routes** (`/routes`)
- Definiše API endpoints
- Povezuje HTTP metode sa kontrolerima
- Primenjuje middleware (npr. auth)

```javascript
// authRoutes.js
router.post('/register', register)
router.post('/login', login)
```

### 2. **Controllers** (`/controllers`)
- HTTP request/response handling
- Input validacija
- Error handling
- Poziva services za business logiku

```javascript
// authController.js
export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Required fields missing' })
    }
    const result = await AuthService.login(email, password)
    res.json(result)
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' })
  }
}
```

### 3. **Services** (`/services`)
- Business logika
- Database queries
- Data transformation
- Nezavisni od HTTP protokola (mogu se koristiti bilo gde)

```javascript
// authService.js
export class AuthService {
  static async login(email, password) {
    const user = await pool.query('SELECT * FROM users WHERE email=$1', [email])
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) throw new Error('Invalid credentials')
    const token = jwt.sign({ id: user.id }, JWT_SECRET)
    return { token, user }
  }
}
```

### 4. **Middleware** (`/middleware`)
- Request preprocessing
- Autentifikacija
- Logging
- Error handling

```javascript
// auth.js
export const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  const decoded = jwt.verify(token, JWT_SECRET)
  req.user = decoded
  next()
}
```

### 5. **Config** (`/config`)
- Database konekcija
- Environment varijable
- Globalne konfiguracije

```javascript
// database.js
export const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
})
```

## 🔐 Autentifikacija

### JWT Token Flow
1. User se loguje → dobija JWT token
2. Token se čuva u localStorage (frontend)
3. Svaki zaštićen request šalje token u Authorization header
4. Auth middleware verifikuje token
5. Ako je validan, request nastavlja ka kontroleru

```javascript
// Zaštićena ruta
router.get('/', auth, getTasks)  // auth middleware pre kontrolera
```

## 🗄️ Database Layer

### PostgreSQL Connection Pool
- Connection pooling za bolje performanse
- Automatic reconnection
- Query parametrizacija za SQL injection zaštitu

```javascript
// Siguran query sa parametrima
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]  // Parametar se automatski escape-uje
)
```

## 📊 API Endpoints

### Auth
- `POST /api/register` - Registracija
- `POST /api/login` - Login

### Tasks (Protected)
- `GET /api/tasks` - Lista taskova
- `POST /api/tasks` - Kreiranje taska
- `PUT /api/tasks/:id` - Ažuriranje taska
- `DELETE /api/tasks/:id` - Brisanje taska

### Snippets (Protected)
- `GET /api/snippets` - Lista snippeta
- `POST /api/snippets` - Kreiranje snippeta
- `PUT /api/snippets/:id` - Ažuriranje
- `DELETE /api/snippets/:id` - Brisanje

### Metrics (Protected)
- `GET /api/metrics/velocity` - Velocity grafikon (završeni taskovi)
- `GET /api/metrics/focus` - Focus grafikon (Pomodoro sesije)

### Focus Sessions (Protected)
- `GET /api/focus-sessions` - Lista sesija
- `POST /api/focus-sessions` - Kreiranje sesije

### Achievements (Protected)
- `GET /api/achievements` - Lista achievementa

## ✅ Prednosti Ove Arhitekture

### 1. **Separation of Concerns**
- Svaki sloj ima svoju odgovornost
- Lako se testira pojedinačno
- Business logika odvojena od HTTP logike

### 2. **Maintainability**
- Lako se dodaju novi endpointi
- Lako se menja logika bez promena celokupnog sistema
- Jasna struktura foldera

### 3. **Reusability**
- Services se mogu koristiti iz više kontrolera
- Business logika centralizovana
- Nema duplikacije koda

### 4. **Scalability**
- Lako se dodaju novi slojevi (npr. caching)
- Microservices ready (svaki service može postati samostalan servis)
- Load balancing friendly

### 5. **Security**
- Input validacija u kontrolerima
- SQL injection zaštita (parametrizovani query-ji)
- JWT autentifikacija
- CORS zaštita

## 🔧 Environment Varijable

```env
# Database
PGHOST=localhost
PGPORT=5432
PGUSER=codehub
PGPASSWORD=codehub_pass
PGDATABASE=codehub_db

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=3001
NODE_ENV=development
```

## 🚀 Pokretanje

```bash
# Development (sa auto-reload)
npm run dev

# Production
npm start

# Setup database
npm run db:setup
```

## 📝 Dodavanje Novog Feature-a

1. **Kreiraj Service** (`/services/newService.js`)
   ```javascript
   export class NewService {
     static async doSomething() { ... }
   }
   ```

2. **Kreiraj Controller** (`/controllers/newController.js`)
   ```javascript
   export async function doSomething(req, res) {
     const result = await NewService.doSomething()
     res.json(result)
   }
   ```

3. **Kreiraj Routes** (`/routes/newRoutes.js`)
   ```javascript
   router.get('/something', auth, doSomething)
   ```

4. **Registruj u index.js**
   ```javascript
   import newRoutes from './routes/newRoutes.js'
   app.use('/api/new', newRoutes)
   ```

## 🎯 Best Practices

- ✅ Uvek koristi async/await
- ✅ Parametrizuj SQL query-je
- ✅ Error handling u try/catch blokovima
- ✅ Input validacija u kontrolerima
- ✅ Business logika u services
- ✅ Koristi environment varijable
- ✅ Loguj greške u production
- ✅ Koristi HTTP status kodove pravilno
