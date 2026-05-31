import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import busRoutes from './routes/bus.routes';
import routeRoutes from './routes/route.routes';
import tripRoutes from './routes/trip.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import ticketRoutes from './routes/ticket.routes';
import systemRoutes from './routes/system.routes';
import seatManagementRoutes from './routes/seatManagement.routes';
import analyticsRoutes from './routes/analytics.routes';
import auditRoutes from './routes/audit.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false,
}));

// Serve a simple favicon to prevent CSP errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bus booking API is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'TMC API - Malawi Transport Management System',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      users: '/api/users',
      buses: '/api/buses',
      routes: '/api/routes',
      trips: '/api/trips',
      bookings: '/api/bookings',
      payments: '/api/payments',
      tickets: '/api/tickets',
      system: '/api/system',
      seats: '/api/seats',
      analytics: '/api/analytics',
      audit: '/api/audit'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/seats', seatManagementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});

export default app;