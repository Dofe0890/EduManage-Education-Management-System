import React from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiHome } from 'react-icons/fi';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <FiLock className="text-red-600 dark:text-red-400" size={32} />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiHome className="mr-2" size={16} />
            Go back to dashboard
          </Link>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            If you believe this is an error, please contact your administrator.
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
