import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { createTheme, MantineProvider } from '@mantine/core';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
// Import the global CSS styles
import '@mantine/core/styles.css';
import './styles/global.css';
import { BASE_PATH } from './config/global';

// Create a new router instance
const router = createRouter({ routeTree, basepath: BASE_PATH });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const theme = createTheme({});

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <MantineProvider theme={theme}>
        <RouterProvider router={router} />
      </MantineProvider>
    </StrictMode>
  );
}
