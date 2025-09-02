'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for weather data
            gcTime: 30 * 60 * 1000, // 30 minutes garbage collection time
            retry: 1,
            refetchOnWindowFocus: false, // Don't refetch when window gains focus
            refetchOnReconnect: false, // Don't refetch on reconnect
            refetchOnMount: false, // Don't refetch when component mounts
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}