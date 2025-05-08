import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles/global.css';

import { createTheme, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { queryClient, router } from './config/global';

const theme = createTheme({});

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <MantineProvider theme={theme}>
        <Notifications position="top-right" autoClose={5000} limit={5} />
        <QueryClientProvider client={queryClient}>
          <ModalsProvider>
            <RouterProvider router={router} />
          </ModalsProvider>
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}
