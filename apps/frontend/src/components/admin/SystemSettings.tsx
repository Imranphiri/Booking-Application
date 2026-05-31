import React, { useState, useEffect } from 'react';
import { systemService } from '../../services/system.service';
import type { SystemSettings } from '../../services/system.service';
import {
  Cog6ToothIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Card, { CardContent } from '../ui/Card';
import Input from '../ui/Input';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await systemService.getSettings();
      setSettings(response.settings);
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await systemService.updateSettings(settings);
      alert('System settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceToggle = async () => {
    if (!settings) return;
    
    try {
      const response = await systemService.toggleMaintenanceMode(!settings.maintenanceMode);
      setSettings(response.settings);
      alert(`Maintenance mode ${!settings.maintenanceMode ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <div className="flex space-x-3">
          <Button
            onClick={handleMaintenanceToggle}
            variant={settings?.maintenanceMode ? 'outline' : 'primary'}
          >
            {settings?.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Maintenance Status */}
      {settings?.maintenanceMode && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-800">Maintenance Mode Active</p>
                <p className="text-sm text-orange-600">{settings.maintenanceMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 mr-2" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Company Name</label>
                <Input
                  type="text"
                  value={settings?.companyName || ''}
                  onChange={(e) => setSettings(settings ? {...settings, companyName: e.target.value} : null)}
                />
              </div>
              <div>
                <label className="label">Company Email</label>
                <Input
                  type="email"
                  value={settings?.companyEmail || ''}
                  onChange={(e) => setSettings(settings ? {...settings, companyEmail: e.target.value} : null)}
                />
              </div>
              <div>
                <label className="label">Company Phone</label>
                <Input
                  type="tel"
                  value={settings?.companyPhone || ''}
                  onChange={(e) => setSettings(settings ? {...settings, companyPhone: e.target.value} : null)}
                />
              </div>
              <div>
                <label className="label">Company Address</label>
                <Input
                  type="text"
                  value={settings?.companyAddress || ''}
                  onChange={(e) => setSettings(settings ? {...settings, companyAddress: e.target.value} : null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              System Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Default Currency</label>
                <select
                  value={settings?.defaultCurrency || 'MWK'}
                  onChange={(e) => setSettings(settings ? {...settings, defaultCurrency: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="MWK">MWK - Malawian Kwacha</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
              <div>
                <label className="label">Max Bookings Per User</label>
                <Input
                  type="number"
                  value={settings?.maxBookingPerUser || 5}
                  onChange={(e) => setSettings(settings ? {...settings, maxBookingPerUser: parseInt(e.target.value)} : null)}
                />
              </div>
              <div>
                <label className="label">Cancellation Policy</label>
                <Input
                  type="text"
                  value={settings?.cancellationPolicy || ''}
                  onChange={(e) => setSettings(settings ? {...settings, cancellationPolicy: e.target.value} : null)}
                />
              </div>
              <div>
                <label className="label">Maintenance Message</label>
                <Input
                  type="text"
                  value={settings?.maintenanceMessage || ''}
                  onChange={(e) => setSettings(settings ? {...settings, maintenanceMessage: e.target.value} : null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              User Settings
            </h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings?.allowRegistrations || false}
                  onChange={(e) => setSettings(settings ? {...settings, allowRegistrations: e.target.checked} : null)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Allow new user registrations</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings?.requireEmailVerification || false}
                  onChange={(e) => setSettings(settings ? {...settings, requireEmailVerification: e.target.checked} : null)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Require email verification</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Appearance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Primary Color</label>
                <Input
                  type="color"
                  value={settings?.primaryColor || '#3B82F6'}
                  onChange={(e) => setSettings(settings ? {...settings, primaryColor: e.target.value} : null)}
                />
              </div>
              <div>
                <label className="label">Secondary Color</label>
                <Input
                  type="color"
                  value={settings?.secondaryColor || '#10B981'}
                  onChange={(e) => setSettings(settings ? {...settings, secondaryColor: e.target.value} : null)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings?.darkMode || false}
                    onChange={(e) => setSettings(settings ? {...settings, darkMode: e.target.checked} : null)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Enable Dark Mode</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettings;
