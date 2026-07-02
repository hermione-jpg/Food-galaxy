# Food Galaxy

Space-themed food lineage explorer. Vite + React frontend, one Vercel serverless
function that proxies to the Anthropic API so your key stays private.

## Deploy in ~10 minutes

1. **Get an Anthropic API key**
   - Go to https://console.anthropic.com → Settings → API Keys → Create Key
   - Copy it, you'll need it in step 4.

2. **Push this folder to GitHub**
   - Create a new repo on github.com (e.g. `food-galaxy`)
   - In this folder, run:
     ```
     git init
     git add .
     git commit -m "initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/food-galaxy.git
     git push -u origin main
     ```

3. **Import into Vercel**
   - Go to https://vercel.com → New Project → Import your `food-galaxy` repo
   - Framework preset: Vite (should auto-detect)

4. **Add your API key**
   - In the Vercel project settings → Environment Variables
   - Add: `ANTHROPIC_API_KEY` = (the key from step 1)
   - Redeploy if it already deployed once before you added the key

5. **Done**
   - Vercel gives you a URL like `food-galaxy-yourname.vercel.app`
   - That's your shareable link.

## Local development

```
npm install
npm run dev
```

Note: the `/api/generate` function only works when deployed to Vercel (or run via
`vercel dev`), since it needs the serverless runtime. Locally with plain `vite dev`,
the "add a dish" AI feature won't respond — everything else will work fine.

## Notes on this version

- User-submitted dishes save to **localStorage**, so they're private to each visitor's
  browser, not shared across everyone. If you want a real shared community galaxy
  (everyone sees everyone's submissions), the next step is swapping localStorage for
  a small database — Supabase's free tier is the fastest option for that.
