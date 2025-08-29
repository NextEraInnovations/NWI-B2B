# Deployment Guide

This guide covers deploying the NWI B2B Platform to various hosting providers.

## 🚀 Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/nwi-b2b-platform)

## 📋 Pre-deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Payment gateways configured (PayFast, Kazang)
- [ ] Domain name ready (optional)

## 🔧 Environment Variables

Set these environment variables in your hosting provider:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🌐 Netlify Deployment

### Option 1: Git Integration (Recommended)

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Environment Variables**
   - Go to Site settings > Environment variables
   - Add your Supabase credentials

4. **Deploy**
   - Click "Deploy site"
   - Your site will be live in minutes!

### Option 2: Manual Deploy

```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## ☁️ Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   - Add via Vercel dashboard or CLI
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

## 🐳 Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔒 Security Considerations

- Always use HTTPS in production
- Set up proper CORS policies
- Configure CSP headers
- Enable rate limiting
- Regular security updates

## 📊 Performance Optimization

- Enable gzip compression
- Configure CDN
- Optimize images
- Enable caching headers
- Monitor Core Web Vitals

## 🔍 Monitoring & Analytics

- Set up error tracking (Sentry)
- Configure analytics (Google Analytics)
- Monitor uptime
- Set up alerts

## 🚨 Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Verify all dependencies
- Check environment variables

### Runtime Errors
- Check browser console
- Verify Supabase connection
- Check network requests

### Performance Issues
- Analyze bundle size
- Check for memory leaks
- Monitor API response times

## 📞 Support

If you encounter issues during deployment:
1. Check the troubleshooting section
2. Review the logs
3. Contact support at support@nwi-b2b.com