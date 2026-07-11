import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getRealtimeManager, resetRealtimeManager } from '../../realtime/index.js';
import { useRealtimeAutoConnect } from '../../realtime/useRealtime.js';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10_000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      networkMode: 'online',
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});
export { queryClient };
function RealtimeInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    const rt = getRealtimeManager();
    rt.init(queryClient);
    return () => {
    };
  }, []);
  useRealtimeAutoConnect(true);
  return <>{children}</>;
}
export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeInitializer>
        {children}
      </RealtimeInitializer>
    </QueryClientProvider>
  );
}
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    resetRealtimeManager();
  });
}
