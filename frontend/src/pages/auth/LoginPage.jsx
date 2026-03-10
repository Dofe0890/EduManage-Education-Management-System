import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FiMail, FiLock, FiBookOpen, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth.jsx";
import { toast } from "react-toastify";
import Loading from "../../components/common/Loading";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const from = location.state?.from?.pathname || "/app/dashboard";

  // Clear submission state on unmount or when loading changes
  React.useEffect(() => {
    if (!isLoading) {
      setIsSubmitting(false);
    }
  }, [isLoading]);

  // Clear submission state on unmount
  React.useEffect(() => {
    return () => {
      setIsSubmitting(false);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    clearErrors,
  } = useForm();

  const onSubmit = async (data) => {
    // Prevent multiple submissions
    if (isSubmitting || isLoading) {
      return;
    }

    setIsSubmitting(true);
    clearErrors(); // Clear previous errors

    try {
      await login(data);
      // Navigation is handled in useAuth hook - no need to navigate here
    } catch (error) {
      // Error is already logged in useAuth - just handle UI updates
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          Object.keys(validationErrors).forEach((field) => {
            setError(field, {
              type: "manual",
              message: validationErrors[field][0],
            });
          });
        }
      } else if (error.response?.status === 401) {
        // Invalid credentials - DON'T refresh the page
        setError("email", {
          type: "manual",
          message: "Invalid email or password",
        });
        setError("password", {
          type: "manual",
          message: "Invalid email or password",
        });
        toast.error(
          "Invalid credentials. Please check your email and password.",
        );
      } else if (error.response?.status === 403) {
        // Account locked or inactive
        setError("email", {
          type: "manual",
          message: "Account is not active. Please contact administrator.",
        });
        toast.error("Account access denied. Please contact administrator.");
      } else {
        // Generic error - DON'T refresh the page
        setError("email", {
          type: "manual",
          message: "Login failed. Please try again.",
        });
        toast.error("Login failed. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission with explicit preventDefault
  const handleFormSubmit = (e) => {
    // CRITICAL: Prevent ALL default browser behavior
    e.preventDefault();
    e.stopPropagation();

    // Double-check we're not submitting if already in progress
    if (isSubmitting || isLoading) {
      return false;
    }

    // Get form data manually to avoid React Hook Form potential issues
    const formData = new FormData(e.target);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    // Call onSubmit directly with form data
    onSubmit(data);
    return false;
  };

  const handleDemoLogin = (email, password) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: "var(--color-background-primary)" }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, var(--color-interactive-primary) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--color-interactive-primary) 0%, transparent 50%)",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "var(--color-interactive-primary)" }}
            >
              <FiBookOpen
                size={32}
                style={{ color: "var(--color-text-inverse)" }}
              />
            </div>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Welcome Back
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Sign in to your EduManage account to continue
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl shadow-xl p-8 border"
          style={{
            backgroundColor: "var(--color-background-secondary)",
            borderColor: "var(--color-border-primary)",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          <form
            key="login-form"
            onSubmit={handleFormSubmit}
            className="space-y-6"
            noValidate // Prevent browser validation
          >
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail
                    size={20}
                    style={{ color: "var(--color-text-tertiary)" }}
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-4 focus:ring-opacity-20 transition-all"
                  style={{
                    backgroundColor: "var(--color-background-primary)",
                    borderColor: errors.email
                      ? "var(--color-error)"
                      : "var(--color-border-primary)",
                    color: "var(--color-text-primary)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor =
                      "var(--color-interactive-primary)";
                    e.target.style.boxShadow =
                      "0 0 0 4px rgba(44, 177, 188, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email
                      ? "var(--color-error)"
                      : "var(--color-border-primary)";
                    e.target.style.boxShadow = "none";
                  }}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Invalid email address",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p
                  className="mt-2 text-sm flex items-center"
                  style={{ color: "var(--color-error)" }}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock
                    size={20}
                    style={{ color: "var(--color-text-tertiary)" }}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-4 focus:ring-opacity-20 transition-all"
                  style={{
                    backgroundColor: "var(--color-background-primary)",
                    borderColor: errors.password
                      ? "var(--color-error)"
                      : "var(--color-border-primary)",
                    color: "var(--color-text-primary)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor =
                      "var(--color-interactive-primary)";
                    e.target.style.boxShadow =
                      "0 0 0 4px rgba(44, 177, 188, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password
                      ? "var(--color-error)"
                      : "var(--color-border-primary)";
                    e.target.style.boxShadow = "none";
                  }}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p
                  className="mt-2 text-sm flex items-center"
                  style={{ color: "var(--color-error)" }}
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 rounded focus:ring-4 focus:ring-opacity-20"
                  style={{
                    backgroundColor: "var(--color-background-primary)",
                    borderColor: "var(--color-border-primary)",
                    color: "var(--color-interactive-primary)",
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow =
                      "0 0 0 4px rgba(44, 177, 188, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                  }}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--color-interactive-primary)" }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                backgroundColor: "var(--color-interactive-primary)",
                boxShadow: "0 4px 14px rgba(44, 177, 188, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor =
                  "var(--color-interactive-primary-hover)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor =
                  "var(--color-interactive-primary)";
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = "0 0 0 4px rgba(44, 177, 188, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "0 4px 14px rgba(44, 177, 188, 0.3)";
              }}
            >
              {isLoading || isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2">Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Sign in</span>
                  <FiArrowRight className="ml-2" size={16} />
                </div>
              )}
            </button>
          </form>

          {/* Demo User Section */}
          <div
            className="mt-8 pt-6 border-t"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            <div className="text-center mb-4">
              <p
                className="text-sm font-medium mb-3"
                style={{ color: "var(--color-text-primary)" }}
              >
                Quick Access - Demo Accounts
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Click below to instantly login with demo credentials
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() =>
                  handleDemoLogin("teacher@gmail.com", "Teacher_123")
                }
                className="py-2 px-4 rounded-lg text-sm font-medium transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-opacity-20"
                style={{
                  backgroundColor: "var(--color-background-primary)",
                  borderColor: "var(--color-border-primary)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor =
                    "var(--color-background-tertiary)";
                  e.target.style.borderColor =
                    "var(--color-interactive-primary)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor =
                    "var(--color-background-primary)";
                  e.target.style.borderColor = "var(--color-border-primary)";
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow =
                    "0 0 0 4px rgba(44, 177, 188, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div
                      className="text-xs font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Teacher
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      Limited access
                    </div>
                  </div>
                  <div
                    className="px-2 py-1 text-xs rounded"
                    style={{
                      backgroundColor: "var(--color-interactive-primary)",
                      color: "var(--color-text-inverse)",
                    }}
                  >
                    DEMO
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-6">
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Need access? Contact your system administrator.
          </p>
        </div>
      </div>

      {/* Loading Overlay */}
      {(isSubmitting || isLoading) && (
        <Loading message="Signing in..." size="medium" />
      )}
    </div>
  );
};

export default LoginPage;
