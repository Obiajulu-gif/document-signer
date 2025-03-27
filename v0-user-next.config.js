/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-pdf', 'pdfjs-dist'],
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['react-pdf', 'pdfjs-dist']
  },
  // Add this webpack configuration
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-pdf$': 'react-pdf/dist/esm/entry.webpack5.js'
    };
    return config;
  }
};

module.exports = nextConfig;

