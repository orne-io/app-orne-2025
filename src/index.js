import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WagmiConfig, createConfig } from 'wagmi';
import { arbitrumSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],
  ssr: false
});

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <QueryClientProvider client={queryClient}>
    <WagmiConfig config={wagmiConfig}>
    <App />
    </WagmiConfig>
  </QueryClientProvider>
);
