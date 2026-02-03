# KoreanExams.com

A comprehensive MERN stack web application for EPS-TOPIK (Employment Permit System - Test of Proficiency in Korean) exam practice, designed for Sri Lankan students.

## Features

- **User Authentication**: Register, login, JWT-based authentication
- **Exam System**: Full practice exams with reading and listening sections
- **Real Exam Interface**: Timer, question navigator, audio player
- **Auto-save**: Progress saved automatically every 30 seconds
- **Results Analytics**: Detailed performance breakdown and charts
- **Dashboard**: Track progress, stats, and recommendations

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Zustand
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Charts**: Chart.js with react-chartjs-2

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd eps-topik-platform
```

2. Install all dependencies:
```bash
npm run install-all
```

3. Configure environment:
```bash
# Copy example env file
cp .env.example server/.env
# Edit server/.env with your MongoDB URI and other settings
```

4. Seed the database:
```bash
npm run seed
```

5. Start development servers:
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Default Admin Credentials

After seeding:
- Email: admin@eps-topik.com
- Password: Admin123!

## Project Structure

```
eps-topik-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API services
│   │   └── hooks/          # Custom hooks
│   └── ...
├── server/                 # Express backend
│   ├── config/             # Configuration files
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Custom middleware
│   └── seeders/            # Database seeders
└── ...
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Exams
- `GET /api/exams` - List exams
- `GET /api/exams/:id` - Get exam details
- `GET /api/exams/:id/take` - Get exam for taking

### Attempts
- `POST /api/attempts/start` - Start exam
- `PUT /api/attempts/:id/answer` - Save answer
- `PUT /api/attempts/:id/submit` - Submit exam
- `GET /api/attempts/:id/review` - Get attempt review

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get statistics

## Scripts

```bash
# Run both frontend and backend
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client

# Seed database
npm run seed

# Build frontend
npm run build
```

## Environment Variables

See `.env.example` for all available options:

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `CLIENT_URL` - Frontend URL for CORS

## License

MIT
