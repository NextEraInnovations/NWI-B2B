# Deploying to Netlify

This guide will help you deploy the NWI B2B Platform to Netlify.

## Prerequisites

1. A Netlify account (free at [netlify.com](https://netlify.com))
2. Your code in a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Git-based Deployment (Recommended)

1. **Push your code to a Git repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPOSITORY_URL
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose your Git provider and repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Node version**: `18`

3. **Environment Variables**
   Set these in Netlify's dashboard under Site settings > Environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

### Option 2: Manual Deployment

1. **Build the project locally**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Drag and drop the `dist` folder to the deploy area
   - Or use Netlify CLI:
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod --dir=dist
     ```

## Configuration Files

The following files have been created for optimal Netlify deployment:

- `netlify.toml` - Netlify configuration
- `_redirects` - SPA routing configuration

## Features Enabled

✅ Single Page Application (SPA) routing
✅ Build optimization
✅ Security headers
✅ Service Worker caching
✅ Progressive Web App (PWA) support
✅ Environment variable support

## Post-Deployment

1. **Custom Domain** (Optional)
   - Go to Site settings > Domain management
   - Add your custom domain

2. **HTTPS**
   - Automatically enabled by Netlify

3. **Form Handling**
   - Netlify automatically handles form submissions

4. **Analytics**
   - Enable Netlify Analytics in Site settings

## Troubleshooting

### Build Fails
- Check that Node.js version is 18 or higher
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

### Environment Variables
- Make sure all required environment variables are set
- Variables must be prefixed with `VITE_` to be accessible in the frontend

### Routing Issues
- Ensure `_redirects` file is in the `dist` folder
- Check that `netlify.toml` has the correct redirect rules

### Performance
- Enable asset optimization in Netlify settings
- Use Netlify's CDN for faster global delivery

## Support

For Netlify-specific issues, check:
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Community](https://community.netlify.com/)
- [Netlify Support](https://www.netlify.com/support/)