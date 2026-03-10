import React, { useState, forwardRef } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const PasswordInput = forwardRef(
  (
    {
      label,
      error,
      required = false,
      className = "",
      containerClassName = "",
      labelClassName = "",
      icon,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={containerClassName}>
        {label && (
          <label
            className={`block text-sm font-medium mb-2 ${
              error
                ? "text-red-700 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300"
            } ${labelClassName}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
              icon ? "pl-10" : ""
            } ${
              error
                ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:text-red-100 dark:placeholder-red-400 dark:focus:border-red-400"
                : "border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400"
            } ${className}`}
            {...props}
          />

          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FiEyeOff
                className="text-gray-400 hover:text-gray-600"
                size={20}
              />
            ) : (
              <FiEye className="text-gray-400 hover:text-gray-600" size={20} />
            )}
          </button>
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
