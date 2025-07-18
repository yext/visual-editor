// StackBlitz-specific configuration
// This file helps StackBlitz understand the project structure

export default {
  // Ensure TypeScript knows about all file types
  typescript: {
    include: ["src/**/*", "*.js", "*.mjs", "*.ts", "*.tsx"],
    exclude: ["node_modules", "dist"],
  },

  // Development server configuration
  dev: {
    port: 3000,
    host: "localhost",
  },
};
