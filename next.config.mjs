/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://todoo.runasp.net/api/:path*", // توجيه لأي API على السيرفر الحقيقي
      },
    ];
  },
};

export default nextConfig;
