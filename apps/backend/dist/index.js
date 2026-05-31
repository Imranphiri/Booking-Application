"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const bus_routes_1 = __importDefault(require("./routes/bus.routes"));
const route_routes_1 = __importDefault(require("./routes/route.routes"));
const trip_routes_1 = __importDefault(require("./routes/trip.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const system_routes_1 = __importDefault(require("./routes/system.routes"));
const seatManagement_routes_1 = __importDefault(require("./routes/seatManagement.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
}));
// Serve a simple favicon to prevent CSP errors
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
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
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/buses', bus_routes_1.default);
app.use('/api/routes', route_routes_1.default);
app.use('/api/trips', trip_routes_1.default);
app.use('/api/bookings', booking_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/tickets', ticket_routes_1.default);
app.use('/api/system', system_routes_1.default);
app.use('/api/seats', seatManagement_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/audit', audit_routes_1.default);
app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});
exports.default = app;
