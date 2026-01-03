# Inventory Management Frontend - Deployment Guide

This guide covers deploying the Inventory Management Frontend (React Create React App) to production.

## Prerequisites

- Django backend deployed and accessible
- Vercel, Netlify, or similar hosting platform account
- Backend API URL

## Application Overview

- **Framework**: Create React App (React 19)
- **Build Tool**: react-scripts
- **API Client**: OpenAPI TypeScript client
- **Authentication**: Token-based (stored in localStorage)

## Pre-Deployment Preparation

### 1. Environment Variables

Create `.env.production` file (or set in deployment platform):

```env
REACT_APP_API_BASE_URL=https://your-api-domain.railway.app/api/inventory
```

**Important Notes:**
- Only variables prefixed with `REACT_APP_` are exposed to the browser
- The API base URL must include the `/api/inventory` path
- Use HTTPS in production

### 2. Build Test

Test the production build locally:

```bash
cd frontend_inventory_and_orders/inventory-management-frontend
npm install
npm run build
```

The build output will be in the `build/` directory.

### 3. Verify Build Output

Check that:
- `build/` directory contains all static assets
- `build/index.html` exists
- No build errors in console

## Deployment Options

### Option 1: Vercel (Recommended)

#### Setup Steps

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Import Project**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Project Settings**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend_inventory_and_orders/inventory-management-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

4. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     REACT_APP_API_BASE_URL=https://your-api-domain.railway.app/api/inventory
     ```
   - Select "Production" environment

5. **Deploy**:
   - Click "Deploy"
   - Monitor build logs
   - Verify deployment URL

#### Vercel Configuration File (Optional)

Create `vercel.json` in the root of inventory-management-frontend:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 2: Netlify

#### Setup Steps

1. **Import Project**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub repository

2. **Configure Build Settings**:
   - **Base directory**: `frontend_inventory_and_orders/inventory-management-frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

3. **Set Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add:
     ```
     REACT_APP_API_BASE_URL=https://your-api-domain.railway.app/api/inventory
     ```

4. **Deploy**:
   - Click "Deploy site"
   - Monitor build logs

#### Netlify Configuration File (Optional)

Create `netlify.toml` in the root of inventory-management-frontend:

```toml
[build]
  base = "frontend_inventory_and_orders/inventory-management-frontend"
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Traditional VPS/Server

#### Setup Steps

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Serve Static Files**:
   - Use Nginx, Apache, or any static file server
   - Point to the `build/` directory
   - Configure SPA routing (redirect all routes to `index.html`)

3. **Nginx Configuration Example**:
   ```nginx
   server {
       listen 80;
       server_name your-admin-domain.com;
       
       root /path/to/inventory-management-frontend/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## Post-Deployment Verification

### 1. Application Access
- [ ] Application loads at production URL
- [ ] No console errors
- [ ] Login page displays correctly

### 2. API Connectivity
- [ ] API calls succeed (check browser Network tab)
- [ ] Authentication works
- [ ] Data loads correctly

### 3. Functionality Tests
- [ ] Login/logout works
- [ ] Dashboard loads
- [ ] Product management works
- [ ] Order management works
- [ ] All admin features accessible

### 4. Security Checks
- [ ] HTTPS is enforced
- [ ] No sensitive data in client-side code
- [ ] API tokens stored securely (localStorage)
- [ ] CORS headers correct from backend

## Environment-Specific Configuration

### Development
- Uses `proxy` field in `package.json` (localhost:8000)
- Auto-detects API URL from hostname
- Falls back to localhost

### Production
- Uses `REACT_APP_API_BASE_URL` environment variable
- Must be set in deployment platform
- Should use HTTPS

## Troubleshooting

### Build Fails

**Error: Missing environment variable**
- Ensure `REACT_APP_API_BASE_URL` is set in deployment platform
- Check environment variable name (must start with `REACT_APP_`)

**Error: Module not found**
- Run `npm install` before building
- Check `package.json` dependencies

### API Connection Issues

**Error: CORS policy blocked**
- Verify backend `CORS_ALLOWED_ORIGINS` includes your frontend domain
- Check backend is accessible
- Verify API URL is correct

**Error: 401 Unauthorized**
- Check authentication token in localStorage
- Verify backend authentication is working
- Check token hasn't expired

### Routing Issues

**404 on page refresh**
- Configure server to redirect all routes to `index.html`
- Check SPA routing configuration
- Verify `build/index.html` exists

### Performance Issues

**Slow initial load**
- Check build output size
- Enable gzip compression on server
- Consider code splitting
- Optimize images and assets

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add custom domain
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS records
4. SSL certificate auto-provisioned

## Continuous Deployment

Both Vercel and Netlify support automatic deployments:
- **Vercel**: Auto-deploys on push to main branch
- **Netlify**: Auto-deploys on push to main branch (configurable)

Configure branch protection and deployment previews as needed.

## Monitoring and Logging

### Error Tracking

Consider integrating:
- **Sentry** for error tracking
- **Google Analytics** for usage analytics
- **LogRocket** for session replay

### Performance Monitoring

- Monitor Core Web Vitals
- Track API response times
- Monitor build sizes

## Security Best Practices

1. **Environment Variables**: Never commit `.env.production` to git
2. **API Tokens**: Store in localStorage (consider httpOnly cookies for enhanced security)
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Backend should restrict CORS to known frontend domains
5. **Content Security Policy**: Consider adding CSP headers

## Rollback Procedures

### Vercel
- Go to Deployments
- Find previous successful deployment
- Click "..." → "Promote to Production"

### Netlify
- Go to Deploys
- Find previous successful deployment
- Click "Publish deploy"

## Support

For issues:
- Check browser console for errors
- Check Network tab for API call failures
- Review deployment platform logs
- Verify environment variables are set correctly

