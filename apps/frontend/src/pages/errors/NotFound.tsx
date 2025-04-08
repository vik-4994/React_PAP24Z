import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-gray-800 dark:text-gray-100 mb-4">
          404
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          {t('page_not_found')}
        </p>
        <Link
          to="/"
          className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          {t('go_back_home')}
        </Link>
      </div>
    </div>
  );
}
