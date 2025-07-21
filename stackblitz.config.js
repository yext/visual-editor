// StackBlitz-specific configuration
// This file helps StackBlitz understand the project structure

export default {
  // Ensure TypeScript knows about all file types
  typescript: {
    include: [
      "starter/src/**/*",
      "starter/*.js",
      "starter/*.mjs",
      "starter/*.ts",
      "starter/*.tsx",
    ],
    exclude: ["starter/node_modules", "starter/dist"],
  },
  // Development server configuration
  dev: {
    port: 3000,
    host: "localhost",
  },
};
