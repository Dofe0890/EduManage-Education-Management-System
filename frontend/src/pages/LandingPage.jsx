import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

const LandingPage = () => {
  const [email, setEmail] = useState("");

  const handleLoginClick = () => {
    // Navigate to login page
    window.location.href = "/login";
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Handle email submission logic here
  };

  const handleScrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background-primary)" }}
    >
      {/* Top Navbar */}
      <nav
        className="px-6 py-4 border-b"
        style={{ borderColor: "var(--color-border-primary)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-interactive-primary)" }}
            >
              <FiBookOpen
                size={24}
                style={{ color: "var(--color-text-inverse)" }}
              />
            </div>
            <span
              className="text-2xl font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              EduManage
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => handleScrollToSection("features")}
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Features
            </button>
            <button
              onClick={() => handleScrollToSection("about")}
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--color-text-secondary)" }}
            >
              About
            </button>
            <button
              onClick={() => handleScrollToSection("contact")}
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Contact
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span style={{ color: "var(--color-text-primary)" }}>
                  Student Management
                </span>{" "}
                <span
                  className="relative"
                  style={{ color: "var(--color-interactive-primary)" }}
                >
                  System
                  <span
                    className="absolute -bottom-2 left-0 w-full h-1 rounded-full opacity-30"
                    style={{
                      backgroundColor: "var(--color-interactive-primary)",
                    }}
                  ></span>
                </span>
              </h1>

              <p
                className="text-lg md:text-xl mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Streamline your educational institution with our comprehensive
                student management platform. Track attendance, manage classes,
                monitor grades, and empower teachers with powerful tools
                designed for modern education.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <button
                  onClick={handleLoginClick}
                  className="px-8 py-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4"
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
                    e.target.style.boxShadow =
                      "0 0 0 4px rgba(44, 177, 188, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow =
                      "0 4px 14px rgba(44, 177, 188, 0.3)";
                  }}
                >
                  <div className="flex items-center justify-center">
                    <span>Sign In to Dashboard</span>
                    <FiArrowRight className="ml-2" size={20} />
                  </div>
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center justify-center lg:justify-start space-x-8">
                <div className="text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    10K+
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Students
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    500+
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Teachers
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    50+
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Institutions
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Modern Illustration Placeholder */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main illustration container */}
                <div
                  className="rounded-2xl p-8 shadow-2xl"
                  style={{
                    backgroundColor: "var(--color-background-secondary)",
                    border: `1px solid var(--color-border-primary)`,
                  }}
                >
                  {/* Dashboard mockup */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: "var(--color-error)" }}
                        ></div>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: "var(--color-warning)" }}
                        ></div>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: "var(--color-success)" }}
                        ></div>
                      </div>
                      <div
                        className="w-16 h-2 rounded"
                        style={{
                          backgroundColor: "var(--color-background-tertiary)",
                        }}
                      ></div>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: "var(--color-background-primary)",
                        }}
                      >
                        <FiUsers
                          size={24}
                          style={{ color: "var(--color-interactive-primary)" }}
                        />
                        <div
                          className="text-2xl font-bold mt-2"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          1,234
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          Active Students
                        </div>
                      </div>
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: "var(--color-background-primary)",
                        }}
                      >
                        <FiBookOpen
                          size={24}
                          style={{ color: "var(--color-interactive-primary)" }}
                        />
                        <div
                          className="text-2xl font-bold mt-2"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          42
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          Classes
                        </div>
                      </div>
                    </div>

                    {/* Chart mockup */}
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: "var(--color-background-primary)",
                      }}
                    >
                      <div className="h-32 flex items-end justify-between space-x-2">
                        {[40, 70, 55, 85, 60, 90, 75].map((height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t"
                            style={{
                              height: `${height}%`,
                              backgroundColor:
                                "var(--color-interactive-primary)",
                              opacity: 0.8 - index * 0.1,
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div
                className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20"
                style={{ backgroundColor: "var(--color-interactive-primary)" }}
              ></div>
              <div
                className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-15"
                style={{ backgroundColor: "var(--color-interactive-primary)" }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-20 px-6"
        style={{ backgroundColor: "var(--color-background-secondary)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ color: "var(--color-text-primary)" }}
              >
                About EduManage
              </h2>
              <p
                className="text-lg mb-6 leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Founded with a vision to transform educational administration,
                EduManage has become the trusted partner for over 50
                institutions worldwide. Our comprehensive platform addresses the
                unique challenges faced by modern educational institutions.
              </p>
              <p
                className="text-lg mb-8 leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                We believe that technology should empower educators, not
                complicate their workflow. That's why we've built an intuitive
                system that streamlines administrative tasks while providing
                powerful insights to help institutions make data-driven
                decisions.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div
                    className="text-3xl font-bold mb-2"
                    style={{ color: "var(--color-interactive-primary)" }}
                  >
                    5+
                  </div>
                  <div
                    className="text-sm font-medium mb-1"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Years Experience
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    In educational technology
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-3xl font-bold mb-2"
                    style={{ color: "var(--color-interactive-primary)" }}
                  >
                    99.9%
                  </div>
                  <div
                    className="text-sm font-medium mb-1"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Uptime
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Reliable service guarantee
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div
                className="rounded-2xl p-8 shadow-2xl"
                style={{
                  backgroundColor: "var(--color-background-primary)",
                  border: `1px solid var(--color-border-primary)`,
                }}
              >
                <h3
                  className="text-xl font-semibold mb-6"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Our Mission & Values
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                      style={{
                        backgroundColor: "var(--color-interactive-primary)",
                      }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color: "var(--color-text-inverse)" }}
                      >
                        1
                      </span>
                    </div>
                    <div>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Empower Educators
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Provide tools that simplify administrative tasks and
                        enhance teaching effectiveness.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                      style={{
                        backgroundColor: "var(--color-interactive-primary)",
                      }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color: "var(--color-text-inverse)" }}
                      >
                        2
                      </span>
                    </div>
                    <div>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Student Success
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Create environments where students can thrive with
                        better support and tracking.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                      style={{
                        backgroundColor: "var(--color-interactive-primary)",
                      }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color: "var(--color-text-inverse)" }}
                      >
                        3
                      </span>
                    </div>
                    <div>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Innovation First
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Continuously evolve our platform with cutting-edge
                        educational technology.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div
                className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20"
                style={{ backgroundColor: "var(--color-interactive-primary)" }}
              ></div>
              <div
                className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full opacity-15"
                style={{ backgroundColor: "var(--color-interactive-primary)" }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-6"
        style={{ backgroundColor: "var(--color-background-secondary)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Powerful Features for Modern Education
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Everything you need to manage your educational institution
              efficiently and effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FiUsers,
                title: "Student Management",
                description:
                  "Comprehensive student profiles with attendance tracking, performance monitoring, and communication tools.",
              },
              {
                icon: FiBookOpen,
                title: "Class Management",
                description:
                  "Organize classes, assign teachers, manage schedules, and track academic progress.",
              },
              {
                icon: FiAward,
                title: "Grade Tracking",
                description:
                  "Automated grade calculations, report cards, and performance analytics for informed decision-making.",
              },
              {
                icon: FiTrendingUp,
                title: "Analytics Dashboard",
                description:
                  "Real-time insights into student performance, attendance trends, and institutional metrics.",
              },
              {
                icon: FiCheckCircle,
                title: "Attendance System",
                description:
                  "Digital attendance tracking with automated reports and parent notification systems.",
              },
              {
                icon: FiBookOpen,
                title: "Resource Management",
                description:
                  "Manage educational resources, assignments, and learning materials in one centralized platform.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border transition-all hover:shadow-lg hover:scale-105"
                style={{
                  backgroundColor: "var(--color-background-primary)",
                  borderColor: "var(--color-border-primary)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: "var(--color-interactive-primary)",
                  }}
                >
                  <feature.icon
                    size={24}
                    style={{ color: "var(--color-text-inverse)" }}
                  />
                </div>
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            Ready to Transform Your Educational Institution?
          </h2>
          <p
            className="text-lg mb-8"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Join thousands of educators who are already using EduManage to
            streamline their operations.
          </p>

          <form
            onSubmit={handleEmailSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-4 rounded-lg border focus:outline-none focus:ring-4"
              style={{
                backgroundColor: "var(--color-background-secondary)",
                borderColor: "var(--color-border-primary)",
                color: "var(--color-text-primary)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--color-interactive-primary)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--color-border-primary)";
              }}
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 focus:outline-none focus:ring-4"
              style={{
                backgroundColor: "var(--color-interactive-primary)",
                boxShadow: "0 4px 14px rgba(44, 177, 188, 0.3)",
              }}
            >
              Get Started
            </button>
          </form>

          <p
            className="text-sm"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            No credit card required. Free 14-day trial.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 px-6"
        style={{ backgroundColor: "var(--color-background-primary)" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Get in Touch
            </h2>
            <p
              className="text-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div
                className="rounded-2xl p-8 shadow-lg"
                style={{
                  backgroundColor: "var(--color-background-secondary)",
                  border: `1px solid var(--color-border-primary)`,
                }}
              >
                <h3
                  className="text-xl font-semibold mb-6"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Send us a Message
                </h3>

                <form className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-4"
                      style={{
                        backgroundColor: "var(--color-background-primary)",
                        borderColor: "var(--color-border-primary)",
                        color: "var(--color-text-primary)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor =
                          "var(--color-interactive-primary)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor =
                          "var(--color-border-primary)";
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-4"
                      style={{
                        backgroundColor: "var(--color-background-primary)",
                        borderColor: "var(--color-border-primary)",
                        color: "var(--color-text-primary)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor =
                          "var(--color-interactive-primary)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor =
                          "var(--color-border-primary)";
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Message
                    </label>
                    <textarea
                      rows="4"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-4 resize-none"
                      style={{
                        backgroundColor: "var(--color-background-primary)",
                        borderColor: "var(--color-border-primary)",
                        color: "var(--color-text-primary)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor =
                          "var(--color-interactive-primary)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor =
                          "var(--color-border-primary)";
                      }}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 focus:outline-none focus:ring-4"
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
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className="rounded-2xl p-6 shadow-lg"
                style={{
                  backgroundColor: "var(--color-background-secondary)",
                  border: `1px solid var(--color-border-primary)`,
                }}
              >
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: "var(--color-interactive-primary)",
                      }}
                    >
                      <span style={{ color: "var(--color-text-inverse)" }}>
                        📧
                      </span>
                    </div>
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Email
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        support@edumanage.com
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: "var(--color-interactive-primary)",
                      }}
                    >
                      <span style={{ color: "var(--color-text-inverse)" }}>
                        📱
                      </span>
                    </div>
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Phone
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        +1 (555) 123-4567
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: "var(--color-interactive-primary)",
                      }}
                    >
                      <span style={{ color: "var(--color-text-inverse)" }}>
                        📍
                      </span>
                    </div>
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        Address
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        123 Education Street
                        <br />
                        Learning City, LC 12345
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl p-6 shadow-lg"
                style={{
                  backgroundColor: "var(--color-background-secondary)",
                  border: `1px solid var(--color-border-primary)`,
                }}
              >
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Business Hours
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      Monday - Friday
                    </span>
                    <span style={{ color: "var(--color-text-primary)" }}>
                      9:00 AM - 6:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      Saturday
                    </span>
                    <span style={{ color: "var(--color-text-primary)" }}>
                      10:00 AM - 4:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      Sunday
                    </span>
                    <span style={{ color: "var(--color-text-tertiary)" }}>
                      Closed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-12 px-6"
        style={{
          backgroundColor: "var(--color-background-secondary)",
          borderColor: "var(--color-border-primary)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--color-interactive-primary)",
                  }}
                >
                  <FiBookOpen
                    size={20}
                    style={{ color: "var(--color-text-inverse)" }}
                  />
                </div>
                <span
                  className="text-xl font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  EduManage
                </span>
              </div>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Empowering educational institutions with modern management
                solutions.
              </p>
            </div>

            <div>
              <h4
                className="font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleScrollToSection("features")}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Features
                  </button>
                </li>
                <li>
                  <Link
                    to="#pricing"
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="#demo"
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Demo
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4
                className="font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleScrollToSection("about")}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    About
                  </button>
                </li>
                <li>
                  <Link
                    to="#blog"
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="#careers"
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4
                className="font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                Support
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="#help"
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => handleScrollToSection("contact")}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <Link
                    to="#privacy"
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="border-t pt-8 text-center text-sm"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            <p style={{ color: "var(--color-text-tertiary)" }}>
              © 2026 EduManage Student Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
