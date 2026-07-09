import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './components/providers/ThemeProvider.js';
import { QueryProvider } from './components/providers/QueryProvider.js';
import { ToastProvider } from './components/shared/Toast.js';
import { router } from './router.js';
import './index.css';

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
