import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';

const projectId = 'c05710e12c1b77ed55cb8f9c66f52851'; // Remplace par ton vrai Project ID WalletConnect

export const arbitrumSepolia = {
  chainId: 421614,
  name: 'Arbitrum Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.arbiscan.io',
  rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc'
};

export const ethersConfig = defaultConfig({
  metadata: {
    name: 'ORNE DApp',
    description: 'Staking & CO2 offset',
    url: 'https://orne.io',
    icons: ['https://orne.io/logo192.png']
  },
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: arbitrumSepolia.rpcUrl,
  defaultChainId: arbitrumSepolia.chainId,
  projectId
});

console.log('Appel de createWeb3Modal (web3modalConfig.js)');
createWeb3Modal({
  ethersConfig,
  chains: [arbitrumSepolia],
  projectId,
  enableAnalytics: false
}); 