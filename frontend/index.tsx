import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import styles
import '@mysten/dapp-kit/dist/index.css';

// Import providers and required functions
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


// --- ADD THIS ---
// 1. Create the query client
const queryClient = new QueryClient();

// 2. Configure the networks
const { networkConfig } = {
  networkConfig: {
    // (Chúng ta sẽ dùng Testnet)
    testnet: { url: getFullnodeUrl('testnet') },
  },
};
// ---
// --- END OF ADDITION ---

const rootElement = document.getElementById('root');
if (!rootElement) {
	throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

// --- MODIFY THIS PART ---
// 3. Wrap your <App /> component with the providers
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            {/* SỬA: Dùng đúng tên biến "networkConfig" */}
            <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
                <WalletProvider autoConnect>
                    <App />
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider> 
    </React.StrictMode>,
);
// --- END OF MODIFICATION ---