import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      className = "",
      containerClassName = "",
      labelClassName = "",
      icon,
      children,
      ...props
    },
    ref,
  ) => {
    const baseInputClasses =
      "block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed";

    const inputVariants = {
      default:
        "border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400",
      error:
        "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:text-red-100 dark:placeholder-red-400 dark:focus:border-red-400",
      success:
        "border-green-300 text-green-900 placeholder-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-600 dark:text-green-100 dark:placeholder-green-400 dark:focus:border-green-400",
    };

    const inputState = error ? "error" : props.success ? "success" : "default";
    const inputClasses = twMerge(
      baseInputClasses,
      inputVariants[inputState],
      className,
    );

    return (
      <div className={containerClassName}>
        {label && (
          <label
            className={twMerge(
              "block text-sm font-medium mb-2",
              error
                ? "text-red-700 dark:text-red-400"
                : "text-gray-700 dark:text-gray-300",
              labelClassName,
            )}
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
            className={twMerge(inputClasses, icon && "pl-10")}
            {...props}
          />

          {children}
        </div>

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
