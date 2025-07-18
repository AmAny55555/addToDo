/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["todoo.runasp.net"], // السماح بتحميل الصور من هذا الدومين
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://todoo.runasp.net/api/:path*",
      },
    ];
  },
};

export default nextConfig;
