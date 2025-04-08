import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

const Login = () => {
  const { t, i18n } = useTranslation();

  const handleLogin = () => {
    window.location.href = urlJoin(import.meta.env.VITE_APP_BASE_URL, 'rest/auth/authorize');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-white ">
      <div className="flex justify-center mt-4">
        <button onClick={() => changeLanguage('en')} className="mx-2">
          English
        </button>
        <button onClick={() => changeLanguage('pl')} className="mx-2">
          Polski
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-1 text-blue-800">
          {t('welcomeMessage')}
        </h1>
        <p className="text-xl mb-8 text-center max-w-2xl">
          {t('introMessage')}
        </p>
        <Button className="mb-8" onClick={handleLogin}>
          {t('signInWithUSOS')}
        </Button>
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">
            {t('howItWorksTitle')}
          </h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>{t('howItWorksStep1')}</li>
            <li>{t('howItWorksStep2')}</li>
            <li>{t('howItWorksStep3')}</li>
            <li>{t('howItWorksStep4')}</li>
            <li>{t('howItWorksStep5')}</li>
            <li>{t('howItWorksStep6')}</li>
          </ol>
        </div>
      </div>
      <h1 className="self-center text-lg font-bold mb-6 text-black-800">
        unipool
      </h1>
    </div>
  );
};

export default Login;
