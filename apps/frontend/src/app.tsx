import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '@frontend/utils/trpc';
import { httpBatchLink } from '@trpc/client';
import { AuthProvider } from '@frontend/hooks/useAuth';
import AppRoutes from './routes/AppRoutes';
import './i18n';
import '@frontend/assets/styles/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import urlJoin from 'url-join';

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: urlJoin(import.meta.env.VITE_APP_BASE_URL, 'trpc')
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
