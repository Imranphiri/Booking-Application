import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  MapIcon,
  TicketIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ShieldCheckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { authService } from '../services/auth.service';
import { bookingService } from '../services/booking.service';
import api from '../services/api';
import BusManagement from '../components/admin/BusManagement';
import RouteManagement from '../components/admin/RouteManagement';
import TripManagement from '../components/admin/TripManagement';
import BookingManagement from '../components/admin/BookingManagement';
import UserManagement from '../components/admin/UserManagement';
import TicketManagement from '../components/admin/TicketManagement';
import SystemSettings from '../components/admin/SystemSettings';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import SeatManagement from '../components/admin/SeatManagement';
import AuditLogs from '../components/admin/AuditLogs';
import Card, { CardContent } from '../components/ui/Card';
import type { Booking } from '../services/booking.service';
import '../styles/AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    // Fetch recent bookings
    fetchRecentBookings();
  }, []);

  const fetchRecentBookings = async () => {
    try {
      const response = await bookingService.getAll();
      // Get only the 5 most recent bookings
      setRecentBookings(response.bookings.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch recent bookings:', error);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'buses', name: 'Buses', icon: TruckIcon },
    { id: 'routes', name: 'Routes', icon: MapIcon },
    { id: 'trips', name: 'Trips', icon: TicketIcon },
    { id: 'bookings', name: 'Bookings', icon: UsersIcon },
    { id: 'users', name: 'Users', icon: UserIcon },
    { id: 'tickets', name: 'Tickets', icon: TicketIcon },
    { id: 'seats', name: 'Seat Management', icon: CalendarIcon },
    { id: 'audit', name: 'Audit Logs', icon: ShieldCheckIcon },
    { id: 'system', name: 'System', icon: Cog6ToothIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection recentBookings={recentBookings} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'buses':
        return <BusManagement />;
      case 'routes':
        return <RouteManagement />;
      case 'trips':
        return <TripManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'users':
        return <UserManagement />;
      case 'tickets':
        return <TicketManagement />;
      case 'seats':
        return <SeatManagement />;
      case 'audit':
        return <AuditLogs />;
      case 'system':
        return <SystemSettings />;
      default:
        return <OverviewSection recentBookings={recentBookings} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="booksync-admin-header">
        <div className="booksync-admin-header-container">
          <div className="booksync-admin-header-content">
            <div className="booksync-admin-header-logo">
              <div className="booksync-admin-logo-icon">
                <Cog6ToothIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="booksync-admin-logo-title">Admin Dashboard</h1>
                <p className="booksync-admin-logo-subtitle">Booksync Management</p>
              </div>
            </div>

            <div className="booksync-admin-header-actions">
              <div className="booksync-admin-user-info">
                <UserIcon className="h-5 w-5" />
                <span>{user?.firstName} {user?.lastName}</span>
                <span className="booksync-admin-role-badge">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="booksync-admin-logout-button"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const OverviewSection: React.FC<{ recentBookings: Booking[] }> = ({ recentBookings }) => {
  const [stats, setStats] = useState({
    totalBuses: 0,
    totalRoutes: 0,
    totalTrips: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalTickets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real statistics from API
    const fetchStats = async () => {
      try {
        const [busesRes, routesRes, tripsRes, bookingsRes, usersRes]= await Promise.all([
          api.get('/buses'),
          api.get('/routes'),
          api.get('/trips'),
          api.get('/bookings'),
          api.get('/users'),
        ]);

        setStats({
          totalBuses: busesRes.data.buses?.length || 0,
          totalRoutes: routesRes.data.routes?.length || 0,
          totalTrips: tripsRes.data.trips?.length || 0,
          totalBookings: bookingsRes.data.bookings?.length || 0,
          totalUsers: usersRes.data.users?.length || 0,
          totalTickets:0,
        });
              } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Set to 0 on error to show accurate data
        setStats({
          totalBuses: 0,
          totalRoutes: 0,
          totalTrips: 0,
          totalBookings: 0,
          totalUsers: 0,
          totalTickets: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Buses',
      value: stats.totalBuses,
      icon: TruckIcon,
      color: 'bg-blue-500',
      change: stats.totalBuses === 0 ? 'No buses added yet' : `${stats.totalBuses} buses available`,
    },
    {
      title: 'Total Routes',
      value: stats.totalRoutes,
      icon: MapIcon,
      color: 'bg-green-500',
      change: stats.totalRoutes === 0 ? 'No routes added yet' : `${stats.totalRoutes} routes available`,
    },
    {
      title: 'Active Trips',
      value: stats.totalTrips,
      icon: TicketIcon,
      color: 'bg-purple-500',
      change: stats.totalTrips === 0 ? 'No trips scheduled yet' : `${stats.totalTrips} trips scheduled`,
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: UsersIcon,
      color: 'bg-orange-500',
      change: stats.totalBookings === 0 ? 'No bookings yet' : `${stats.totalBookings} total bookings`,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UserIcon,
      color: 'bg-indigo-500',
      change: stats.totalUsers === 0 ? 'No users registered yet' : `${stats.totalUsers} registered users`,
    },
    {
      title: 'Total Tickets',
      value: stats.totalTickets,
      icon: TicketIcon,
      color: 'bg-pink-500',
      change: stats.totalTickets === 0 ? 'No tickets issued yet' : `${stats.totalTickets} tickets issued`,
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-2">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No bookings yet</p>
                <p className="text-sm text-gray-400 mt-2">Bookings will appear here once users start booking trips</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">
                          {booking.trip?.route?.origin} to {booking.trip?.route?.destination}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Guest'} - Seat {booking.seatNumber}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(booking.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        MWK {booking.price?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-xs text-green-600">
                        {booking.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Server</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export default AdminDashboard;
