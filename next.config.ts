import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // There's no /works index yet, so send people who trim a case study URL to the home section.
    // Temporary, so browsers don't cache it if a real /works page is added later.
    return [{ source: "/works", destination: "/#works", permanent: false }];
  },
};

export default nextConfig;
