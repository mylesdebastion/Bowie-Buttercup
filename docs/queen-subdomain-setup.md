# Setting Up queen.sparkleclassic.com for QUEEN Branch

## Overview
This guide will help you set up `queen.sparkleclassic.com` so your girlfriend can see her work on the QUEEN branch without needing Vercel access.

## What This Achieves
- **Main site**: `sparkleclassic.com` → deploys from `main` branch
- **Queen's site**: `queen.sparkleclassic.com` → deploys from `QUEEN` branch
- **Auto-updates**: Every push to QUEEN branch automatically updates queen.sparkleclassic.com
- **No Vercel access needed**: She just needs the URL

---

## Step 1: Add Domain in Vercel Dashboard

### A. Navigate to Domains Settings
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **Bowie-Buttercup** (or whatever it's named)
3. Click **Settings** tab
4. Click **Domains** in the left sidebar

### B. Add the Subdomain
1. In the "Add Domain" field, type: `queen.sparkleclassic.com`
2. Click **Add**
3. You'll see a configuration screen

### C. Assign to QUEEN Branch
1. After adding the domain, you'll see a dropdown for "Git Branch"
2. Select: **QUEEN** from the dropdown
3. Click **Save** or **Add** (button text may vary)

### D. Get DNS Configuration Values
Vercel will show you one of these options:

**Option A: CNAME Record** (most common)
```
Type: CNAME
Name: queen
Value: cname.vercel-dns.com
```

**Option B: A Record** (if CNAME not available)
```
Type: A
Name: queen
Value: 76.76.21.21
```

**Write down these values** - you'll need them in Step 2.

---

## Step 2: Configure DNS Records

This depends on where `sparkleclassic.com` is registered. Common registrars:

### For Namecheap:
1. Log into [Namecheap](https://www.namecheap.com)
2. Go to **Domain List** → select `sparkleclassic.com`
3. Click **Advanced DNS** tab
4. Click **Add New Record**
5. Enter the values from Vercel:
   - **Type**: CNAME (or A)
   - **Host**: queen
   - **Value**: cname.vercel-dns.com (or the IP from Vercel)
   - **TTL**: Automatic
6. Click **Save Changes**

### For Cloudflare:
1. Log into [Cloudflare](https://dash.cloudflare.com)
2. Select `sparkleclassic.com`
3. Go to **DNS** tab
4. Click **Add record**
5. Enter:
   - **Type**: CNAME (or A)
   - **Name**: queen
   - **Target/Content**: cname.vercel-dns.com (or IP)
   - **Proxy status**: DNS only (gray cloud)
6. Click **Save**

### For GoDaddy:
1. Log into [GoDaddy](https://www.godaddy.com)
2. Go to **My Products** → **Domains**
3. Click **DNS** next to `sparkleclassic.com`
4. Scroll to **Records** section
5. Click **Add**
6. Enter:
   - **Type**: CNAME (or A)
   - **Name**: queen
   - **Value**: cname.vercel-dns.com (or IP)
   - **TTL**: 1 Hour
7. Click **Save**

### For Other Registrars:
Look for "DNS Management" or "DNS Settings" and add a CNAME record pointing `queen` to the value Vercel provided.

---

## Step 3: Verify Configuration

### A. Wait for DNS Propagation
- DNS changes take 5-60 minutes (sometimes up to 24 hours)
- You can check status at: https://dnschecker.org/#CNAME/queen.sparkleclassic.com

### B. Check Vercel Dashboard
1. Return to Vercel → Project → Settings → Domains
2. Look for `queen.sparkleclassic.com`
3. Status should change from "Invalid Configuration" → "Valid Configuration"
4. You may see a checkmark or "Ready" indicator

### C. Test the URL
1. Visit: `https://queen.sparkleclassic.com/bowie/`
2. You should see the Bowie game from the QUEEN branch
3. Try: `https://queen.sparkleclassic.com/buttercup/` etc.

---

## Step 4: Share with Your Girlfriend

Once it's working, she can access:
- `https://queen.sparkleclassic.com/bowie/`
- `https://queen.sparkleclassic.com/buttercup/`
- `https://queen.sparkleclassic.com/bonbon/`
- `https://queen.sparkleclassic.com/<any-pet-name>/`

### Auto-Updates
Every time changes are pushed to the `QUEEN` branch:
1. Vercel automatically detects the push
2. Builds and deploys the new version
3. Updates queen.sparkleclassic.com (1-2 minutes)
4. She just refreshes the page to see changes

---

## Troubleshooting

### Domain shows "Invalid Configuration" in Vercel
- **Issue**: DNS records not set correctly
- **Fix**: Double-check DNS settings match Vercel's values exactly
- **Wait**: DNS propagation can take time

### "404 Not Found" when visiting queen.sparkleclassic.com
- **Issue**: Domain not assigned to QUEEN branch
- **Fix**: In Vercel Domains settings, make sure dropdown shows "QUEEN"

### Shows old version / changes not appearing
- **Issue**: Deployment may have failed or still building
- **Fix**: Check Vercel → Deployments tab for build status
- **Cache**: Try hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Certificate/SSL errors
- **Issue**: Vercel is provisioning SSL certificate
- **Wait**: This can take 5-10 minutes after DNS is configured
- **Check**: Vercel will show "Issuing Certificate" status

### Wrong game content showing
- **Issue**: May be deploying from wrong branch
- **Fix**: Verify in Vercel dashboard that queen.sparkleclassic.com is assigned to QUEEN branch

---

## Quick Reference

| Domain | Branch | Purpose |
|--------|--------|---------|
| `sparkleclassic.com` | `main` | Production site for customers |
| `queen.sparkleclassic.com` | `QUEEN` | Your girlfriend's preview site |

**No Vercel access needed** - she just needs the URL!

---

## What Happens Next?

### For Development Work:
1. She makes changes on QUEEN branch locally
2. Commits and pushes to GitHub: `git push origin QUEEN`
3. Vercel auto-deploys (1-2 min)
4. She refreshes queen.sparkleclassic.com to see changes

### For You:
- Your `main` branch and `sparkleclassic.com` are completely unaffected
- You can work independently on `main`
- QUEEN branch updates don't impact production

---

*Last Updated: 2025-12-18*
*Setup Guide for QUEEN Branch Preview Domain*
