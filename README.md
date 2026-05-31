# Transport Management System

A comprehensive bus booking and transport management platform with mobile app, web admin dashboard, and backend API.

## 🚀 Features

### Mobile App (React Native)
- User registration and authentication
- Search and book bus trips
- Real-time trip availability
- Payment integration (PayChangu)
- QR code ticket generation
- Passenger management
- Date picker with full calendar functionality

### Web Admin Dashboard (React)
- User management
- Bus and route management
- Trip scheduling
- Booking management
- Analytics dashboard
- System settings configuration
- Audit logs
- Ticket validation

### Backend API (Node.js/Express)
- RESTful API architecture
- JWT authentication
- PostgreSQL database with Prisma ORM
- Email notifications
- Payment gateway integration
- Seat management system
- Audit logging
- Security alerts

## 🛠 Tech Stack

### Mobile App
- React Native with Expo
- TypeScript
- React Navigation
- Axios for API calls
- QR Code generation
- AsyncStorage

### Web Dashboard
- React with Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication
- Nodemailer for emails

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

### Backend Setup
```bash
cd apps/backend
npm install
cp .env.example .env
# Configure your database credentials in .env
npx prisma migrate dev
npx prisma generate
npm run dev
```

### Frontend Setup
```bash
cd apps/frontend
npm install
cp .env.example .env
# Configure API URL in .env
npm run dev
```

### Mobile App Setup
```bash
cd apps/mobile
npm install
# Configure API URL in src/services/api.ts
npm start
```

## 🗄 Database Setup

1. Install PostgreSQL
2. Create a database named `bus_booking`
3. Configure database credentials in `apps/backend/.env`
4. Run migrations:
```bash
cd apps/backend
npx prisma migrate dev
```

## 🔧 Configuration

### Backend Environment Variables (.env)
```
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/bus_booking"
JWT_SECRET="your-secret-key"
NODE_ENV=development

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Frontend Environment Variables (.env)
```
VITE_API_URL=http://localhost:3000/api
```

### Mobile API Configuration
Edit `src/services/api.ts`:
```typescript
const API_URL = 'http://your-backend-url:3000/api';
```

## 📱 Usage

### Starting the Backend
```bash
cd apps/backend
npm run dev
```
Backend runs on http://localhost:3000

### Starting the Frontend
```bash
cd apps/frontend
npm run dev
```
Frontend runs on http://localhost:5173

### Starting the Mobile App
```bash
cd apps/mobile
npm start
```
Use Expo Go app on your device to scan the QR code

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Trips
- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create new trip (admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details

### Buses
- `GET /api/buses` - Get all buses
- `POST /api/buses` - Add new bus (admin)

### Routes
- `GET /api/routes` - Get all routes
- `POST /api/routes` - Create new route (admin)

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments/:id` - Get payment status

## 👥 User Roles

- **PASSENGER** - Regular users who book tickets
- **ADMIN** - Full system access
- **STAFF** - Limited admin access for validation

## 🔐 Security Features

- JWT token authentication
- Password hashing
- Role-based access control
- Audit logging
- Security alerts
- Input validation
- SQL injection prevention (Prisma ORM)

## 📊 Database Schema

The application uses PostgreSQL with the following main models:
- Users
- Buses
- Routes
- Trips
- Bookings
- Payments
- Tickets
- Audit Logs
- Security Alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Imran Phiri**

## 🙏 Acknowledgments

- React Native and Expo team
- Prisma ORM
- React community
- Open source contributors

## 📞 Support

For support, email transithub.mw@gmail.com or open an issue in the repository.

---

**Note**: This is a transport management system designed for booking bus tickets with real-time availability, payment processing, and comprehensive admin controls.
