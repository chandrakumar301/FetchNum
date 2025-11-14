# 404 Error Fix for Vercel Deployment

## Common causes and solutions:

### 1. Build Output Directory Missing

The issue is usually that the `dist` folder is not being created during the build.

**Solution:**

- Ensure `npm run build` works locally first:

```powershell
npm run build
ls dist/  # Check if dist folder exists with index.html
```

### 2. Check package.json scripts

Verify your build command is correct in package.json:

```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

### 3. Vercel Configuration - Try this simpler version:

Replace your `vercel.json` with:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 4. Step-by-step deployment fix:

1. **Clear node_modules and rebuild locally:**

```powershell
rm -r node_modules
rm package-lock.json
npm install
npm run build
```

2. **Verify dist folder exists:**

```powershell
ls dist/
```

You should see:

- index.html
- assets/ folder
- Other bundled files

3. **Add or update .vercelignore:**

```
backend/
node_modules/
.git/
.vscode/
*.log
```

4. **Push to GitHub (if using Git):**

```powershell
git add .
git commit -m "Fix Vercel deployment - 404 error"
git push origin main
```

5. **In Vercel Dashboard:**

- Go to your project settings
- Ensure Build & Development Settings show:
  - Build Command: `npm run build`
  - Output Directory: `dist`
- Click "Redeploy" button

### 5. If still getting 404:

Check Vercel deployment logs:

- Visit your project on vercel.com
- Click "Deployments" tab
- Click the failing deployment
- Check "Build Logs" to see exact error
- Check "Functions" tab to ensure no serverless functions are interfering

### 6. Alternative: Use Vercel CLI locally

```powershell
npm install -g vercel
vercel login
vercel build
vercel preview  # Test locally
vercel deploy  # Deploy to production
```

## Common Error Messages:

**"dist folder not found"** → Run `npm run build` locally and verify it works

**"Cannot find module"** → Run `npm install` again

**"404 on all routes"** → Missing SPA rewrite rules - check vercel.json has rewrites/routes configured

**"Build succeeded but 404 on deploy"** → Check that index.html exists in dist/ folder

## Quick Test:

After build, your folder structure should be:

```
dist/
  ├── index.html
  ├── assets/
  │   ├── main-xxxxx.js
  │   └── main-xxxxx.css
  └── ...
```

If `dist/` doesn't exist or is empty, the build failed - check for errors in `npm run build` output.
