/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Do not inline NEXTAUTH_URL into the client bundle here — it is baked at build/start time
  // and breaks OAuth if it drifts from the URL you actually use (wrong port / stale value).
};

export default nextConfig;
