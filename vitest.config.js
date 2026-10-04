import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Tests share one database, so run files one at a time.
    fileParallelism: false,
    setupFiles: ["./tests/setup.js"],
    env: {
      NODE_ENV: "test",
      DATABASE_NAME: process.env.TEST_DATABASE_NAME || "waridi_test",
      JWT_TOKEN: "test-jwt-secret",
      JWT_REFRESH_TOKEN: "test-jwt-refresh-secret",
      // Tests sign in many times from one address; tests/phase3.test.js
      // checks the limiter itself with a small limit.
      AUTH_RATE_LIMIT_MAX: "10000",
    },
  },
});
