import React, { useState, useRef } from 'react';
import {
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface TicketValidationResult {
  success: boolean;
  ticket?: {
    id: string;
    passengerName: string;
    seatNumber: string;
    routeOrigin: string;
    routeDestination: string;
    departureTime: string;
    status: string;
    scanCount: number;
  };
  error?: string;
}

const StaffValidation: React.FC = () => {
  const [scanResult, setScanResult] = useState<TicketValidationResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [location, setLocation] = useState('');
  const [scanType, setScanType] = useState<'ENTRY' | 'EXIT' | 'VALIDATION'>('VALIDATION');
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const mockTickets = [
    {
      id: 'TKT001',
      passengerName: 'John Doe',
      seatNumber: 'A12',
      routeOrigin: 'Lilongwe',
      routeDestination: 'Blantyre',
      departureTime: '2024-04-25T08:00:00',
      status: 'ACTIVE',
      scanCount: 0
    },
    {
      id: 'TKT002',
      passengerName: 'Jane Smith',
      seatNumber: 'B8',
      routeOrigin: 'Lilongwe',
      routeDestination: 'Mzuzu',
      departureTime: '2024-04-25T10:30:00',
      status: 'ACTIVE',
      scanCount: 1
    }
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setScanResult({
        success: false,
        error: 'Camera access denied. Please allow camera permissions.'
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const simulateQRScan = (ticketId: string) => {
    setScanning(true);
    
    setTimeout(() => {
      const ticket = mockTickets.find(t => t.id === ticketId);
      
      if (ticket) {
        const isValid = ticket.status === 'ACTIVE' && ticket.scanCount < 2;
        
        setScanResult({
          success: isValid,
          ticket: isValid ? ticket : undefined,
          error: !isValid ? 'Ticket is invalid or already used' : undefined
        });

        if (isValid) {
          // Add to recent scans
          const newScan = {
            id: Date.now().toString(),
            ticketId: ticket.id,
            passengerName: ticket.passengerName,
            scanType,
            location: location || 'Unknown',
            timestamp: new Date().toISOString(),
            status: 'SUCCESS'
          };
          setRecentScans(prev => [newScan, ...prev.slice(0, 9)]);
        }
      } else {
        setScanResult({
          success: false,
          error: 'Ticket not found'
        });
      }
      
      setScanning(false);
    }, 2000);
  };

  const handleManualScan = () => {
    const ticketId = prompt('Enter ticket ID:');
    if (ticketId) {
      simulateQRScan(ticketId);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Validation</h1>
          <p className="text-gray-600">Scan and validate passenger tickets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scanner Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scanner Controls */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Scanner Settings</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Scan Type</label>
                      <select 
                        value={scanType} 
                        onChange={(e) => setScanType(e.target.value as any)}
                        className="input"
                      >
                        <option value="ENTRY">Entry</option>
                        <option value="EXIT">Exit</option>
                        <option value="VALIDATION">Validation</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter current location"
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      onClick={cameraActive ? stopCamera : startCamera}
                      variant={cameraActive ? 'danger' : 'primary'}
                      className="flex items-center space-x-2"
                    >
                      <CameraIcon className="h-4 w-4" />
                      <span>{cameraActive ? 'Stop Camera' : 'Start Camera'}</span>
                    </Button>
                    
                    <Button
                      onClick={handleManualScan}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <QrCodeIcon className="h-4 w-4" />
                      <span>Manual Scan</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Camera/Scanner View */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  {cameraActive ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="border-4 border-white rounded-lg w-64 h-64">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <QrCodeIcon className="h-16 w-16 text-white opacity-50" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <CameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Camera is not active</p>
                        <Button onClick={startCamera}>
                          Start Camera
                        </Button>
                      </div>
                    </div>
                  )}

                  {scanning && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <LoadingSpinner size="lg" />
                        <p className="text-white mt-4">Scanning ticket...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Test Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => simulateQRScan('TKT001')}
                    variant="outline"
                    className="w-full"
                  >
                    Test Valid Ticket
                  </Button>
                  <Button
                    onClick={() => simulateQRScan('INVALID')}
                    variant="outline"
                    className="w-full"
                  >
                    Test Invalid Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scan Result */}
            {scanResult && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Scan Result</h3>
                </CardHeader>
                <CardContent>
                  {scanResult.success ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="h-8 w-8 text-success-600" />
                        <div>
                          <h4 className="text-lg font-semibold text-success-800">Valid Ticket</h4>
                          <p className="text-success-600">Ticket successfully validated</p>
                        </div>
                      </div>

                      {scanResult.ticket && (
                        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Ticket ID:</span>
                              <div className="font-medium">{scanResult.ticket.id}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Passenger:</span>
                              <div className="font-medium">{scanResult.ticket.passengerName}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Seat:</span>
                              <div className="font-medium">{scanResult.ticket.seatNumber}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Route:</span>
                              <div className="font-medium">
                                {scanResult.ticket.routeOrigin} to {scanResult.ticket.routeDestination}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <XCircleIcon className="h-8 w-8 text-error-600" />
                        <div>
                          <h4 className="text-lg font-semibold text-error-800">Invalid Ticket</h4>
                          <p className="text-error-600">{scanResult.error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Scans */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Recent Scans</h3>
              </CardHeader>
              <CardContent>
                {recentScans.length === 0 ? (
                  <div className="text-center py-8">
                    <QrCodeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No scans yet today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentScans.map((scan) => (
                      <div key={scan.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(scan.status)}`}>
                            {scan.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(scan.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">{scan.passengerName}</div>
                          <div className="text-gray-600">{scan.ticketId}</div>
                          <div className="text-gray-500">{scan.location}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Today's Statistics</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Scans</span>
                    <span className="font-semibold">{recentScans.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Successful</span>
                    <span className="font-semibold text-success-600">
                      {recentScans.filter(s => s.status === 'SUCCESS').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Failed</span>
                    <span className="font-semibold text-error-600">
                      {recentScans.filter(s => s.status === 'FAILED').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffValidation;
