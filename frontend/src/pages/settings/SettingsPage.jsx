import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Palette, Check, Sun, Moon } from "lucide-react";

const themeColors = [
  { name: "Default", value: "#2cb1bc", hover: "#14919b", active: "#0e7c86" },
  { name: "Indigo", value: "#6366f1", hover: "#4f46e5", active: "#4338ca" },
  { name: "Rose", value: "#f43f5e", hover: "#e11d48", active: "#be123c" },
  { name: "Amber", value: "#f59e0b", hover: "#d97706", active: "#b45309" },
  { name: "Emerald", value: "#10b981", hover: "#059669", active: "#047857" },
  { name: "Violet", value: "#8b5cf6", hover: "#7c3aed", active: "#6d28d9" },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeColor, setActiveColor] = useState(
    localStorage.getItem("theme-color") || "#2cb1bc",
  );
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme-mode");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const handleColorChange = (color) => {
    setActiveColor(color.value);
    localStorage.setItem("theme-color", color.value);

    const root = document.documentElement;
    root.style.setProperty("--color-brand-500", color.value);
    root.style.setProperty("--color-interactive-primary", color.value);
    root.style.setProperty("--color-interactive-primary-hover", color.hover);
    root.style.setProperty("--color-interactive-primary-active", color.active);

    // Update related brand shades (simplified for now)
    root.style.setProperty("--color-brand-400", color.hover);
    root.style.setProperty("--color-brand-600", color.active);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    const themeMode = newMode ? "dark" : "light";
    localStorage.setItem("theme-mode", themeMode);

    const root = document.documentElement;
    if (newMode) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme-mode");
    const root = document.documentElement;
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
  }, []);

  useEffect(() => {
    const savedColor = localStorage.getItem("theme-color");
    if (savedColor) {
      const colorObj = themeColors.find((c) => c.value === savedColor);
      if (colorObj) {
        handleColorChange(colorObj);
      }
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Settings
        </h1>
        <button
          onClick={() => navigate("/app/profile")}
          className="btn flex items-center gap-2"
        >
          <User size={20} />
          <span>View Profile</span>
        </button>
      </div>

      <div className="grid gap-6">
        {/* Theme Section */}
        <section
          className="card shadow-sm rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--color-surface-primary)",
            border: "1px solid var(--color-border-primary)",
          }}
        >
          <div
            className="p-6 flex items-center gap-3"
            style={{ borderBottom: "1px solid var(--color-border-primary)" }}
          >
            <Palette className="text-brand-500" size={24} />
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Appearance
            </h2>
          </div>
          <div className="p-6">
            {/* Dark Mode Toggle */}
            <div className="mb-6">
              <h3
                className="text-sm font-medium mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Theme Mode
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => !isDarkMode || toggleDarkMode()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
                  style={{
                    borderColor: !isDarkMode
                      ? "var(--color-interactive-primary)"
                      : "var(--color-border-primary)",
                    backgroundColor: !isDarkMode
                      ? "var(--color-brand-100)"
                      : "transparent",
                  }}
                >
                  <Sun
                    size={18}
                    style={{
                      color: !isDarkMode
                        ? "var(--color-interactive-primary)"
                        : "var(--color-text-tertiary)",
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Light
                  </span>
                </button>
                <button
                  onClick={() => isDarkMode || toggleDarkMode()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
                  style={{
                    borderColor: isDarkMode
                      ? "var(--color-interactive-primary)"
                      : "var(--color-border-primary)",
                    backgroundColor: isDarkMode
                      ? "var(--color-brand-900)"
                      : "transparent",
                  }}
                >
                  <Moon
                    size={18}
                    style={{
                      color: isDarkMode
                        ? "var(--color-interactive-primary)"
                        : "var(--color-text-tertiary)",
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Dark
                  </span>
                </button>
              </div>
            </div>

            {/* Theme Color Selection */}
            <h3
              className="text-sm font-medium mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Accent Color
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {themeColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color)}
                  className="relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all"
                  style={{
                    borderColor:
                      activeColor === color.value
                        ? "var(--color-interactive-primary)"
                        : "var(--color-border-primary)",
                    backgroundColor:
                      activeColor === color.value
                        ? "var(--color-brand-100)"
                        : "transparent",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full shadow-inner flex items-center justify-center"
                    style={{ backgroundColor: color.value }}
                  >
                    {activeColor === color.value && (
                      <Check size={16} className="text-white" />
                    )}
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Other Settings (Placeholders) */}
        <section
          className="card shadow-sm rounded-xl p-6"
          style={{
            backgroundColor: "var(--color-surface-primary)",
            border: "1px solid var(--color-border-primary)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Notifications
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Notification settings coming soon...
          </p>
        </section>

        <section
          className="card shadow-sm rounded-xl p-6"
          style={{
            backgroundColor: "var(--color-surface-primary)",
            border: "1px solid var(--color-border-primary)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Security
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Security and privacy settings coming soon...
          </p>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
