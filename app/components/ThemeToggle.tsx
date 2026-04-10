"use client";

import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex items-center justify-center w-10 h-10 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all duration-200"
    >
      {/* Sun icon — shown in dark mode (click to go light) */}
      <span
        className="material-symbols-outlined absolute transition-all duration-300"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
        }}
      >
        light_mode
      </span>

      {/* Moon icon — shown in light mode (click to go dark) */}
      <span
        className="material-symbols-outlined absolute transition-all duration-300"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)",
        }}
      >
        dark_mode
      </span>
    </button>
  );
}
