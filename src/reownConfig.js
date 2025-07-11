import { createAppKit } from '@reown/appkit';
import { arbitrumSepolia } from 'viem/chains';

const projectId = 'c05710e12c1b77ed55cb8f9c66f52851';

createAppKit({
  chains: [arbitrumSepolia],
  projectId,
  appName: 'ORNE DApp',
  appDescription: 'Staking & CO2 offset',
  appUrl: 'https://orne.io',
  appIcon: 'https://orne.io/logo192.png'
}); 