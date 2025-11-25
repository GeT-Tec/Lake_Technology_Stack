"use client";

import React from "react";
import { useTheme } from "next-themes";

export default function ThemeToggleExample() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6 max-w-md mx-auto bg-card rounded-lg shadow-md animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">Theme Toggle Example</h2>
      <p className="mb-4">
        Current theme: <span className="font-semibold">{theme}</span>
      </p>
      <button
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors animate-pulse"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        Toggle Theme
      </button>
    </div>
  );
}
