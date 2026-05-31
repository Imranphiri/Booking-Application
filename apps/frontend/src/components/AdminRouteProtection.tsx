import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

interface AdminRouteProtectionProps {
  children: React.ReactNode;
}

const AdminRouteProtection: React.FC<AdminRouteProtectionProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated();
      const isAdmin = authService.isAdmin() || authService.isOperator() || authService.isSuperAdmin();

      if (!isAuthenticated) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      if (!isAdmin) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRouteProtection;
