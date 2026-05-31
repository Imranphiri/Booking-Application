import React from 'react';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="page-container">
      <div className="content-container">
        <div className="text-center py-20">
          <div className="flex justify-center mb-8">
            <div className="bg-error-100 rounded-full p-6">
              <ExclamationTriangleIcon className="h-16 w-16 text-error-600" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="flex items-center space-x-2">
                <HomeIcon className="h-4 w-4" />
                <span>Go Home</span>
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
