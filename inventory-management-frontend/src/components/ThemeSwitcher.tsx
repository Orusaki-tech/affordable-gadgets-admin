import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeSwitcher.css';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: 'light' | 'dark' | 'high-contrast'; label: string; icon: string }> = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'high-contrast', label: 'High Contrast', icon: '🔆' },
  ];

  return (
    <div className="theme-switcher">
      <label className="theme-switcher-label" htmlFor="theme-select">
        Theme:
      </label>
      <select
        id="theme-select"
        className="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'high-contrast')}
        aria-label="Select theme"
      >
        {themes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.icon} {t.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'high-contrast':
        return '🔆';
      default:
        return '☀️';
    }
  };

  return (
    <button
      className="theme-toggle-button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'high contrast' : 'light'} theme`}
      title={`Current: ${theme}. Click to switch theme.`}
    >
      <span className="theme-toggle-icon">{getIcon()}</span>
    </button>
  );
};

