# MedBook Frontend - Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+ installed
- pnpm package manager
- Backend API running on http://localhost:8080

### Setup
```bash
# 1. Install dependencies
pnpm install

# 2. Create .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# 3. Run development server
pnpm dev
```

Access at: http://localhost:3000

---

## Production Build

### Build for Production
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Build Output
- Optimized bundle in `.next/` directory
- Static assets optimized
- Server-side rendering configured
- API routes ready

---

## Deployment to Vercel

### Option 1: Connect GitHub Repository

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/medbook-frontend.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `https://your-api-domain.com` (production API URL)
   - Click "Save"

4. **Deploy**
   - Vercel automatically deploys on git push
   - View deployment at provided URL

### Option 2: Deploy from Local Machine

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Authenticate
vercel login

# 3. Deploy
vercel

# 4. Follow prompts:
# - Project setup
# - Build settings (default)
# - Environment variables

# 5. Visit provided URL
```

---

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
```

### Build and Run Docker Image
```bash
# Build image
docker build -t medbook-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://api:8080 \
  medbook-frontend
```

### Docker Compose
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://backend:8080
    depends_on:
      - backend

  backend:
    build: ../medbook-backend
    ports:
      - "8080:8080"
    environment:
      DB_URL: jdbc:mysql://db:3306/medbook
```

---

## Environment Variables

### Development (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Production (Vercel/Deployment)
```
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### Optional Variables
```
# Analytics
NEXT_PUBLIC_GA_ID=your-analytics-id

# Feature flags
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_ENABLE_VIDEO_CALLS=false
```

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console warnings
- [ ] All imports correct
- [ ] No unused variables
- [ ] Code follows patterns

### Testing
- [ ] User registration works
- [ ] Login/logout works
- [ ] Doctor search works
- [ ] Appointment booking works
- [ ] Admin features work
- [ ] Responsive design verified
- [ ] No broken links
- [ ] API integration tested

### Performance
- [ ] Build succeeds: `pnpm build`
- [ ] No large unoptimized images
- [ ] Bundle size reasonable
- [ ] Load time acceptable

### Security
- [ ] No sensitive data in code
- [ ] Environment variables used correctly
- [ ] API tokens secured
- [ ] HTTPS enabled
- [ ] CORS configured correctly

### Backend Integration
- [ ] API base URL correct
- [ ] All endpoints accessible
- [ ] Token refresh working
- [ ] Error handling working
- [ ] CORS headers present

---

## Monitoring & Logs

### Vercel Analytics
- Dashboard → Analytics
- View page load times
- See popular pages
- Monitor performance

### Application Logs
```bash
# Local development
pnpm dev  # See logs in console

# Production (Vercel)
# Dashboard → Deployments → Logs
```

### Error Tracking
Add Sentry for error tracking:
```bash
pnpm add @sentry/nextjs
```

```typescript
// next.config.js
const withSentry = require('@sentry/nextjs/withSentry');

module.exports = withSentry({
  // ... config
}, {
  org: 'your-org',
  project: 'medbook-frontend',
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
```

---

## Performance Optimization

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/images/doctor.jpg"
  alt="Doctor"
  width={200}
  height={200}
  priority={false}
/>
```

### Code Splitting
```typescript
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('./admin'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});
```

### Caching Strategy
```typescript
// Static generation (revalidate every 1 hour)
export const revalidate = 3600;

// ISR - Incremental Static Regeneration
export const revalidate = 60; // seconds
```

---

## Scaling Considerations

### Database
- Ensure backend database is optimized
- Add indexes on frequently queried fields
- Consider read replicas for heavy load
- Monitor connection pool

### Caching
- Implement Redis for session caching
- Cache API responses client-side
- Use CDN for static assets
- Implement pagination

### Load Balancing
- Use reverse proxy (Nginx, HAProxy)
- Distribute traffic across servers
- Health checks enabled
- Auto-scaling configured

---

## Rollback Procedure

### Vercel Rollback
1. Go to Vercel Dashboard
2. Select Project → Deployments
3. Find previous stable deployment
4. Click "..." → "Promote to Production"

### Manual Rollback
```bash
# If using git
git revert <commit-hash>
git push origin main

# Vercel automatically redeploys
```

---

## Update & Maintenance

### Update Dependencies
```bash
# Check for updates
pnpm outdated

# Update specific package
pnpm update package-name

# Update all packages
pnpm update
```

### Database Migrations
Coordinate with backend team to:
- Plan migration timing
- Backup data
- Test in staging
- Document changes
- Monitor for issues

---

## Troubleshooting Deployment

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
pnpm build

# Check for TypeScript errors
pnpm tsc --noEmit
```

### API Not Connecting
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Verify backend is running
- Check CORS headers
- Check network requests in DevTools

### Performance Issues
- Check bundle size: `pnpm build --analyze`
- Monitor Core Web Vitals
- Optimize images and fonts
- Implement code splitting

### Memory Issues
```bash
# Increase Node memory (if needed)
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```

---

## Production Best Practices

1. **Use Environment Variables**
   - Never commit secrets
   - Use `.env.local.example`
   - Rotate secrets regularly

2. **Monitor Errors**
   - Setup error tracking
   - Monitor API health
   - Alert on failures

3. **Performance**
   - Monitor Core Web Vitals
   - Track page load times
   - Optimize assets

4. **Security**
   - Keep dependencies updated
   - Run security audits
   - Implement rate limiting
   - Use HTTPS

5. **Backups**
   - Backup user data regularly
   - Test restore procedures
   - Document backup strategy

6. **Documentation**
   - Document architecture
   - Keep API docs updated
   - Record deployment steps
   - Maintain runbooks

---

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Production Guide](https://nextjs.org/docs/going-to-production)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [Web Performance Guide](https://web.dev/performance/)

---

## Contacts

- **Frontend Issues**: Check GitHub issues
- **Backend Issues**: Coordinate with backend team
- **Deployment Issues**: Check Vercel support
- **Performance Issues**: Monitor and optimize

---

**Ready for production deployment!** 🚀
