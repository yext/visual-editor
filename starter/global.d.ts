// Global type declarations for StackBlitz compatibility

declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*.mjs" {
  const content: any;
  export default content;
}

declare module "*.js" {
  const content: any;
  export default content;
}

declare module "*.json" {
  const content: any;
  export default content;
}

// Ensure TypeScript knows about configuration files
declare module "postcss.config.js" {
  const config: any;
  export default config;
}

declare module "vite.config.mjs" {
  const config: any;
  export default config;
}

declare module "tailwind.config.ts" {
  const config: any;
  export default config;
}
