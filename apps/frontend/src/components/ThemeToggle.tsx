import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkTheme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isDarkTheme ? 'bg-primary' : 'bg-input'
      }`}
    >
      <span
        className={`${
          isDarkTheme ? 'translate-x-5' : 'translate-x-1'
        } inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-background transition-transform`}
      >
        {isDarkTheme ? (
          <Moon className="h-3 w-3 text-primary" />
        ) : (
          <Sun className="h-3 w-3 text-primary" />
        )}
      </span>
    </button>
  );
};

