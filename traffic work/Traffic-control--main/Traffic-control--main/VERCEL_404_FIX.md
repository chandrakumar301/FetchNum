# Vercel Deployment - 404 Error Fix

## Problem

You're getting 404 errors on all routes except the homepage when deployed to Vercel.

## Root Cause

Vercel isn't routing all requests back to `index.html`, which is required for Single Page Applications (SPAs) like React Router apps.

## Solution

### Step 1: Update vercel.json

Your vercel.json has been updated. Make sure it looks like this:

```json
{
  "version": 2,
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 2: Verify Vite Config

Your `vite.config.ts` should include the base path:

```typescript
export default defineConfig(({ mode }) => ({
  base: "/", // Make sure this line exists
  server: {
    host: "::",
    port: 8080,
  },
  // ... rest of config
}));
```

### Step 3: Clear and Redeploy

**Option A: Using Vercel Dashboard**

1. Go to vercel.com → Your Project
2. Click "Settings" tab
3. Scroll to "Build & Development Settings"
4. Verify:
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click "Deployments" → Find the failed deployment
6. Click the three dots → "Redeploy"

**Option B: Using Vercel CLI**

```powershell
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd "c:\traffic work\Traffic-control--main\Traffic-control--main"

# Login to Vercel
vercel login

# Deploy with verbose output
vercel --prod --verbose
```

**Option C: Manual Git Push (if connected to GitHub)**

```powershell
git add vercel.json vite.config.ts
git commit -m "Fix Vercel 404 error - add rewrites for SPA routing"
git push origin main
```

Vercel will automatically redeploy.

### Step 4: Test the Fix

After redeployment:

1. Visit your Vercel URL: `https://<your-project>.vercel.app`
2. Test these routes:
   - Homepage: `https://<your-project>.vercel.app/` ✓ Should work
   - Any route: `https://<your-project>.vercel.app/any-page` ✓ Should also work (will serve index.html)

### Step 5: Verify in Vercel Logs

If still getting 404:

1. In Vercel Dashboard
2. Click "Deployments"
3. Click the latest deployment
4. Check "Build Logs" for errors
5. Check "Function Logs" for runtime errors

### Common Issues & Fixes

| Issue             | Fix                                                                             |
| ----------------- | ------------------------------------------------------------------------------- |
| Still getting 404 | Make sure vercel.json has `"rewrites"` (not `"routes"`)                         |
| Build failing     | Run `npm install` locally: `rm -r node_modules && npm install && npm run build` |
| dist folder empty | Check if build succeeded locally: `npm run build` and look for errors           |
| Deployment stuck  | Go to Settings → Deployments → Clear build cache → Redeploy                     |

### If None of Above Works

Create a `vercel.json` with this exact content:

```json
{
  "version": 2,
  "public": false,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@vite_api_url"
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.com/api/:path*"
    },
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```

This version:

- Keeps `/api/*` requests separate (for your backend)
- Routes everything else to index.html

### Critical: Backend Connection

Since your app uses WebSocket to connect to `localhost:3001`, you must:

1. Deploy backend to: Render, Railway, Fly, or similar
2. Update frontend to use deployed backend URL

Example in your code where you connect to WebSocket:

```typescript
// Instead of: const websocket = new WebSocket('ws://localhost:3001');
// Use environment variable or deployed backend URL:
const BACKEND_URL = process.env.VITE_API_URL || "ws://localhost:3001";
const websocket = new WebSocket(BACKEND_URL);
```

Then in Vercel Environment Variables:

- Key: `VITE_API_URL`
- Value: `https://your-deployed-backend.com` or `wss://your-deployed-backend.com`

---

**Still not working?** Share the exact error from Vercel deployment logs and I'll help debug further!
