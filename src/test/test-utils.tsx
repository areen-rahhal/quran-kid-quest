import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean;
  withProfileProvider?: boolean;
  withQueryClient?: boolean;
}

const AllTheProviders = ({
  children,
  withRouter = true,
  withProfileProvider = true,
  withQueryClient = true,
}: {
  children: React.ReactNode;
  withRouter?: boolean;
  withProfileProvider?: boolean;
  withQueryClient?: boolean;
}) => {
  let content = children;

  if (withProfileProvider) {
    content = <ProfileProvider>{content}</ProfileProvider>;
  }

  if (withQueryClient) {
    content = (
      <QueryClientProvider client={createTestQueryClient()}>
        {content}
      </QueryClientProvider>
    );
  }

  if (withRouter) {
    content = <BrowserRouter>{content}</BrowserRouter>;
  }

  return (
    <TooltipProvider>
      {content}
    </TooltipProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: ExtendedRenderOptions,
) =>
  render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        withRouter={options?.withRouter !== false}
        withProfileProvider={options?.withProfileProvider !== false}
        withQueryClient={options?.withQueryClient !== false}
      >
        {children}
      </AllTheProviders>
    ),
    ...options,
  });

export * from '@testing-library/react';
export { customRender as render };
