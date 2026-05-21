'use client'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

// 1. Get projectId from https://cloud.reown.com
const projectId = '9c74a1e905125eec4f5f2b3e89dea404'

// 2. Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet],
  projectId,
  ssr: true
})

// 3. Create the AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet],
  projectId,
  metadata: {
    name: 'VIP Trading DApp',
    description: 'Premium Trading Access Platform',
    url: 'https://vip-trading.app',
    icons: ['https://vip-trading.app/icon.png']
  },
  features: {
    analytics: true,
    email: false,
    socials: false,
    emailShowWallets: true
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#10B981',
    '--w3m-border-radius-master': '12px'
  }
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}