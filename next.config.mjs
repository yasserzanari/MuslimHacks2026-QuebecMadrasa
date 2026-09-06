/** Keep the presentation server's generated files isolated when a second
 * Next.js process (such as Playwright) is running at the same time. */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
