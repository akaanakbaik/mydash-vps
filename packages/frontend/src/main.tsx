import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider.js';
import { QueryProvider } from './components/providers/QueryProvider.js';
import { ToastProvider } from './components/shared/Toast.js';
import { router } from './router.js';
import { apiClient } from './api/client.js';
import { tokenStorage } from './utils/tokenStorage.js';
import './index.css';

// ─── Auth interceptor: attach JWT token to every API request ───
apiClient.addInterceptor({
  onRequest: (init) => {
    const token = tokenStorage.getToken();
    if (token) {
      init.headers = {
        ...init.headers as Record<string, string>,
        Authorization: `Bearer ${token}`,
      };
    }
    return init;
  },
  onError: (error) => {
    // If we get a 401, clear the token and hard-redirect to login
    if (error.name === 'UnauthorizedError') {
      tokenStorage.clearToken();
      window.location.href = '/login';
    }
    return error;
  },
});

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>
);
