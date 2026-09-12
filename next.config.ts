import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Build output directory. Overridable so the e2e suite can build the
   * proposal and official stages side by side without one overwriting the
   * other. Unset everywhere else, which keeps the default `.next`.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  /* config options here */
};

export default nextConfig;
