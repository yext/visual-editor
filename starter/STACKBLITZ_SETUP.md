# StackBlitz Setup Guide

## Quick Fix for "Could not find source file" Error

If you're seeing the error:

```
Uncaught (in promise) Error: Unhandled Promise Rejection: Could not find source file: 'stackblitz:/src/ve.config.tsx'
```

### ✅ Solution Steps:

1. **Use the StackBlitz-specific dev script:**

   ```bash
   npm run dev:stackblitz
   ```

2. **If the error persists, try these steps in order:**

   a. **Trigger TypeScript refresh:**
   - Open `tsconfig.json`
   - Make a small edit (add/remove a space)
   - Save the file
   - Wait 2-3 seconds for StackBlitz to reindex

   b. **Check file casing:**
   - Ensure `ve.config.tsx` is exactly named (not `Ve.config.tsx` or `ve.config.TSX`)
   - Verify the import in `src/templates/dev.tsx` uses the correct path: `"../ve.config"`

   c. **Clear StackBlitz cache:**
   - Refresh the browser
   - Wait for the project to fully load
   - Try the dev script again

3. **If still broken:**
   - Fork the project to get a fresh environment
   - Import the forked version into StackBlitz

### 🔧 Configuration Details

The project is configured with:

- **TypeScript**: Proper module resolution for StackBlitz
- **Path mapping**: `@/*` maps to `src/*`
- **ES modules**: Compatible with StackBlitz's environment
- **Synthetic imports**: Enabled for React compatibility

### 📁 File Structure

```
starter/
├── src/
│   ├── ve.config.tsx          # ✅ Main config file
│   ├── templates/
│   │   └── dev.tsx           # ✅ Template that imports config
│   └── dev.config.ts         # ✅ Stream configuration
├── tsconfig.json             # ✅ TypeScript configuration
└── package.json              # ✅ Dependencies and scripts
```

### 🚀 Running in StackBlitz

1. Use `npm run dev:stackblitz` (not `npm run dev`)
2. Wait for the development server to start
3. The Visual Editor should load without file resolution errors

### 💡 Troubleshooting Tips

- **File extensions**: StackBlitz is strict about file extensions and casing
- **Import paths**: Use relative paths (`../ve.config`) rather than absolute paths
- **TypeScript**: The `tsconfig.json` includes proper settings for StackBlitz compatibility
- **Refresh**: Sometimes StackBlitz needs a hard refresh to pick up configuration changes

If you continue to have issues, the error is likely a temporary StackBlitz indexing problem. Try forking the project for a fresh start.
