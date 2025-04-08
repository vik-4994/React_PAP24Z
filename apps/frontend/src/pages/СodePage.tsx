import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trpc } from '@frontend/utils/trpc';
import { Loading } from '@frontend/components/Loading';

const CodePage: React.FC = () => {
  const { t } = useTranslation();
  const [code, setCode] = useState(localStorage.getItem('teacherCode') || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { data, refetch, error: queryError } = trpc.preferenceExchange.verifyCode.useQuery(
    { code },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    if (code) {
      setIsLoading(true);
      refetch();
    }
  }, [refetch]);

  useEffect(() => {
    if (data) {
      setIsLoading(false);
      if (data.valid) {
        localStorage.setItem('teacherCode', code);
        console.log(data);
        navigate('/all-exchanges', { state: { subjects: data.subjects } });
      } else {
        setError(t('invalid_code'));
        localStorage.removeItem('teacherCode');
      }
    }
  }, [data, code, navigate, t]);

  useEffect(() => {
    if (queryError) {
      setIsLoading(false);
      console.error('Error verifying code:', queryError);
      setError(t('error_verifying_code'));
      localStorage.removeItem('teacherCode');
    }
  }, [queryError, t]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!code) {
      setError(t('empty_code'));
      return;
    }
    setError('');
    setIsLoading(true);
    refetch();
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center mb-4 text-gray-800 dark:text-gray-100">
              {t('enter_code')}
            </h1>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                placeholder={t('enter_code')}
              />
              {error && (
                <p className="text-red-500 dark:text-red-400 mb-4">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
              >
                {t('submit')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CodePage;
