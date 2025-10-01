# ⚡ Quick Fix - Vercel 404 on Refresh

## 🔧 What I Fixed

Updated `vercel.json` to redirect all routes to `index.html`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🚀 Deploy Now

```bash
git add vercel.json vite.config.ts
git commit -m "Fix: Vercel SPA routing"
git push origin main
```

Vercel will auto-deploy and the fix will be live in ~2 minutes.

---

## ✅ Test

1. Visit: `https://your-app.vercel.app/invoices`
2. Press **F5** to refresh
3. ✅ Page should load (no 404)

---

**Done!** All routes will now work on refresh.
