import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { createTheme, MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient, router } from './config/global';

import '@mantine/core/styles.css';
import './styles/global.css';

const theme = createTheme({});


// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <MantineProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  );
}
