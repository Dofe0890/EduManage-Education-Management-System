import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { FiAlertTriangle, FiHome, FiArrowLeft } from 'react-icons/fi';

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const isRouteError = isRouteErrorResponse(error);

  const getErrorMessage = () => {
    if (isRouteError) {
      switch (error.status) {
        case 404:
          return {
            title: 'Page Not Found',
            message: 'The page you are looking for does not exist.',
            description: 'Please check the URL or return to the dashboard.'
          };
        case 401:
          return {
            title: 'Unauthorized',
            message: 'You need to be logged in to access this page.',
            description: 'Please log in to continue.'
          };
        case 403:
          return {
            title: 'Access Denied',
            message: 'You do not have permission to access this page.',
            description: 'Contact your administrator if you think this is an error.'
          };
        case 500:
          return {
            title: 'Server Error',
            message: 'Something went wrong on our end.',
            description: 'Please try again later or contact support.'
          };
        default:
          return {
            title: 'Error',
            message: error.statusText || 'An unexpected error occurred.',
            description: 'Please try refreshing the page.'
          };
      }
    }

    // Handle other types of errors (like loader errors)
    if (error instanceof Error) {
      return {
        title: 'Application Error',
        message: error.message,
        description: 'An unexpected error occurred while loading this page.'
      };
    }

    return {
      title: 'Unknown Error',
      message: 'Something went wrong.',
      description: 'Please try refreshing the page.'
    };
  };

  const { title, message, description } = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="text-red-600" size={32} />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-2">
          {message}
        </p>

        {/* Error Description */}
        <p className="text-sm text-gray-500 mb-6">
          {description}
        </p>

        {/* Error Details (for development) */}
        {import.meta.env.MODE === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Error Details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Go Back Button */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <FiArrowLeft size={16} />
            Go Back
          </button>

          {/* Home Button */}
          <Link
            to="/app/dashboard"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiHome size={16} />
            Dashboard
          </Link>
        </div>

        {/* Additional Info for 401/403 */}
        {(isRouteError && (error.status === 401 || error.status === 403)) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Need to log in? Click here
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
