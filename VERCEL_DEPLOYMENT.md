# 🚀 Deploying StockFlowPro to Vercel

This guide will help you deploy your Inventory Management System to Vercel.

## 📋 Prerequisites

1. **GitHub Account** - Create one at [github.com](https://github.com)
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (use GitHub to sign in)
3. **Git Installed** - Check with `git --version`

---

## 🎯 Step-by-Step Deployment

### Step 1: Initialize Git Repository (if not already done)

```bash
cd "/run/media/kashifmehmood/64A19375084CBA56/Web Projects/IMS/StockFlowPro"
git init
git add .
git commit -m "Initial commit - StockFlowPro IMS"
```

### Step 2: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `stockflowpro-ims`
3. **Don't** initialize with README (we already have code)
4. Click "Create repository"

### Step 3: Push Code to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/stockflowpro-ims.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `stockflowpro-ims` repository
5. Configure the project:

   **Framework Preset:** Vite
   
   **Root Directory:** `./` (leave as is)
   
   **Build Command:** `npm run build`
   
   **Output Directory:** `dist`
   
   **Install Command:** `npm install`

6. Add **Environment Variables**:
   - Click "Environment Variables"
   - Add the following:
     ```
     VITE_SUPABASE_URL = https://thmdhjmwlksqomebhtgz.supabase.co
     VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobWRoam13bGtzcW9tZWJodGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDAxNjgsImV4cCI6MjA3NDkxNjE2OH0.QQBltt2_PNK5DNxhGGLqQUBoIQ5DHFLZ-t1muv3KITY
     ```

7. Click **"Deploy"**
8. Wait 2-3 minutes for deployment to complete
9. Your app will be live at `https://your-project-name.vercel.app`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? stockflowpro-ims
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste: https://thmdhjmwlksqomebhtgz.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobWRoam13bGtzcW9tZWJodGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDAxNjgsImV4cCI6MjA3NDkxNjE2OH0.QQBltt2_PNK5DNxhGGLqQUBoIQ5DHFLZ-t1muv3KITY

# Deploy to production
vercel --prod
```

---

## 🔧 Post-Deployment Configuration

### Update Supabase Settings

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Scroll to **URL Configuration**
5. Add your Vercel domain to **Site URL**:
   ```
   https://your-project-name.vercel.app
   ```
6. Add to **Redirect URLs**:
   ```
   https://your-project-name.vercel.app/**
   ```

---

## 🎨 Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Click **"Add Domain"**
4. Enter your domain (e.g., `stockflowpro.com`)
5. Follow DNS configuration instructions
6. Wait for DNS propagation (5-30 minutes)

---

## 🔄 Automatic Deployments

Every time you push to GitHub, Vercel will automatically:
- Build your app
- Run tests (if configured)
- Deploy to production

```bash
# Make changes to your code
git add .
git commit -m "Update invoice UI"
git push origin main

# Vercel automatically deploys!
```

---

## 📊 Monitoring & Analytics

1. **Vercel Dashboard**: View deployment logs, analytics, and performance
2. **Real-time Logs**: Click on any deployment to see build logs
3. **Analytics**: Enable Vercel Analytics in project settings

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Ensure all dependencies are in package.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: "Environment variables not found"**
- Check that you added `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel dashboard
- Redeploy after adding variables

### App Loads but Shows Errors

**Supabase Connection Error**
- Verify environment variables are correct
- Check Supabase project is active
- Verify API keys haven't expired

**CORS Errors**
- Add your Vercel domain to Supabase allowed origins
- Check Supabase RLS policies are configured

---

## 📱 Testing Your Deployment

1. Visit your Vercel URL
2. Test all features:
   - ✅ Create Invoice
   - ✅ View Invoices
   - ✅ Manage Inventory
   - ✅ Customer Management
   - ✅ Dashboard Analytics

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use environment variables** - Configured in Vercel
3. **Enable Supabase RLS** - Row Level Security policies
4. **Regular backups** - Use Supabase backup features
5. **Monitor logs** - Check Vercel and Supabase logs regularly

---

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **GitHub Issues**: Create issues in your repository

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Supabase URLs updated
- [ ] All features tested
- [ ] Custom domain configured (optional)
- [ ] Team members invited (optional)

---

**🎉 Congratulations! Your StockFlowPro IMS is now live!**

Your app is accessible at: `https://your-project-name.vercel.app`
