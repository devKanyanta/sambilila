// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Removed: 'target: "serverless"'
  // 2. Added: The 'output' property is now the correct way to specify the build type in modern Next.js
  output: 'standalone', 
  
  // Enable CORS for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Consider specifying your actual domain instead of '*'
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  
  // 3. Removed: The entire 'api: { ... }' object.
  //    Configure bodyParser inside specific API routes instead (see explanation above).
};

module.exports = nextConfig;