import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  TruckIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import Card, { CardContent, CardHeader } from '../ui/Card';

interface ExecutiveData {
  totalBookings: number;
  todayBookings: number;
  monthlyBookings: number;
  activeTrips: number;
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  occupancyRate: number;
  lastUpdated: string;
}

interface RevenueData {
  revenueByRoute: Array<{
    routeId: string;
    routeName: string;
    busPlateNumber: string;
    revenue: number;
    bookings: number;
    averagePrice: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
  paymentMethods: Array<{
    paymentMethod: string;
    _sum: { price: number };
    _count: { id: number };
  }>;
  totalRevenue: number;
  totalBookings: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [executiveData, setExecutiveData] = useState<ExecutiveData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch executive dashboard data
      const executiveResponse = await fetch('http://localhost:3000/api/analytics/executive-dashboard');
      if (!executiveResponse.ok) {
        throw new Error('Failed to fetch executive data');
      }
      const executive = await executiveResponse.json();
      setExecutiveData(executive);

      // Fetch revenue data
      const revenueResponse = await fetch(`http://localhost:3000/api/analytics/revenue?period=${selectedPeriod}`);
      if (!revenueResponse.ok) {
        throw new Error('Failed to fetch revenue data');
      }
      const revenue = await revenueResponse.json();
      setRevenueData(revenue);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Dashboard */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Executive Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {executiveData?.totalBookings.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-green-600">
                    +{executiveData?.todayBookings || 0} today
                  </p>
                </div>
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    MWK {executiveData?.totalRevenue.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-green-600">
                    +MWK {executiveData?.todayRevenue.toLocaleString() || 0} today
                  </p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Trips</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {executiveData?.activeTrips || 0}
                  </p>
                  <p className="text-sm text-gray-500">Today</p>
                </div>
                <TruckIcon className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {executiveData?.occupancyRate || 0}%
                  </p>
                  <p className="text-sm text-gray-500">Average today</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Reports */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Revenue Reports</h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Routes by Revenue */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Top Routes by Revenue</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData?.revenueByRoute.slice(0, 5).map((route) => (
                  <div key={route.routeId} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{route.routeName}</p>
                      <p className="text-sm text-gray-500">{route.busPlateNumber} • {route.bookings} bookings</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">MWK {route.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Avg: MWK {route.averagePrice.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData?.paymentMethods.map((method) => (
                  <div key={method.paymentMethod} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{method.paymentMethod}</p>
                      <p className="text-sm text-gray-500">{method._count.id} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">MWK {method._sum.price.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {((method._sum.price / (revenueData?.totalRevenue || 1)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Monthly Summary</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Monthly Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {executiveData?.monthlyBookings.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                MWK {executiveData?.monthlyRevenue.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Average per Booking</p>
              <p className="text-2xl font-bold text-gray-900">
                MWK {executiveData?.monthlyBookings 
                  ? Math.round(executiveData.monthlyRevenue / executiveData.monthlyBookings).toLocaleString()
                  : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
