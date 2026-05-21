/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages for server components (Next.js 14 syntax)
  experimental: {
    serverComponentsExternalPackages: ['pino-pretty'],
  },
  
  // Optimize for Vercel deployment
  output: 'standalone',
  
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }
    
    // Only push externals on server side to avoid client-side issues
    if (isServer) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding')
    }
    
    // Stub out optional/missing peer deps from @wagmi/connectors and @reown/appkit
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
      'bigint': false,
      '@base-org/account': false,
      '@metamask/connect-evm': false,
      'accounts': false,
      'porto/internal': false,
      'porto': false,
    }
    
    return config
  },
  
  // Environment variables that should be available on client side
  // env: {
  //   CUSTOM_KEY: process.env.CUSTOM_KEY,
  // },
  
  // Headers for better security and CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ]
  },
}

module.exports = nextConfig