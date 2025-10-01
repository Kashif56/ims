# ⚡ Quick Deploy to Vercel - 5 Minutes

## 🚀 Fast Track Deployment

### 1️⃣ Push to GitHub (2 minutes)

```bash
cd "/run/media/kashifmehmood/64A19375084CBA56/Web Projects/IMS/StockFlowPro"

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/stockflowpro-ims.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy on Vercel (2 minutes)

1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Click **"Import Git Repository"**
3. Select your `stockflowpro-ims` repo
4. Configure:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Add Environment Variables:**
   ```
   VITE_SUPABASE_URL
   https://thmdhjmwlksqomebhtgz.supabase.co

   VITE_SUPABASE_ANON_KEY
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobWRoam13bGtzcW9tZWJodGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDAxNjgsImV4cCI6MjA3NDkxNjE2OH0.QQBltt2_PNK5DNxhGGLqQUBoIQ5DHFLZ-t1muv3KITY
   ```

6. Click **"Deploy"** ✨

### 3️⃣ Update Supabase (1 minute)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. **Settings** → **API** → **URL Configuration**
3. Add your Vercel URL to:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** `https://your-app.vercel.app/**`

---

## 🎉 Done!

Your app is live at: `https://your-project-name.vercel.app`

---

## 🔄 Future Updates

```bash
# Make changes, then:
git add .
git commit -m "Your update message"
git push

# Vercel auto-deploys! 🚀
```

---

## 📚 Need More Details?

See **VERCEL_DEPLOYMENT.md** for complete guide.
