
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pilgrimdian.com'], // Add your image domains here
  },
  headers: () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store',
        },
      ],
    },
  ]
}

module.exports = nextConfig