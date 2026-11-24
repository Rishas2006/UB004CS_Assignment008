/** @type {import('next').NextConfig} */

// The browser talks to the API through THIS site (same origin): the login refresh-cookie is then a first-party cookie and
// works on Safari / iPhone too. Set BACKEND_URL to the Vercel address of the API project (before building).
//   NEXT_PUBLIC_API_URL=/api/v1        BACKEND_URL=https://rh-hms-api.vercel.app
// Local development: leave BACKEND_URL empty and use NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1 (direct, CORS).
const backend = (process.env.BACKEND_URL || "").replace(/\/+$/, "");

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!backend) return [];
    return [{ source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` }];
  },
};
export default nextConfig;
