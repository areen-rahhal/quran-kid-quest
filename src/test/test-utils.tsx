import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import '@/config/i18n';

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
  withLanguageProvider?: boolean;
}

const AllTheProviders = ({
  children,
  withRouter = true,
  withProfileProvider = true,
  withQueryClient = true,
  withLanguageProvider = true,
}: {
  children: React.ReactNode;
  withRouter?: boolean;
  withProfileProvider?: boolean;
  withQueryClient?: boolean;
  withLanguageProvider?: boolean;
}) => {
  let content = children;

  if (withLanguageProvider) {
    content = <LanguageProvider>{content}</LanguageProvider>;
  }

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
        withLanguageProvider={options?.withLanguageProvider !== false}
      >
        {children}
      </AllTheProviders>
    ),
    ...options,
  });

export * from '@testing-library/react';
export { customRender as render };
