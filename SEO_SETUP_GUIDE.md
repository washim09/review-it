# Riviewit SEO Setup Guide

## SEO Issues Found & Fixed (Code Changes)

### 🔴 Critical Issues Fixed

#### 1. Missing `robots.txt` (was returning 404)
- **Created**: `app/robots.ts` — Next.js auto-generates `/robots.txt`
- Allows all crawlers on public pages
- Blocks `/api/`, `/auth/`, `/message/`, `/verify-email/`, `/reset-password/`, `/forgot-password/`
- Points to sitemap at `https://riviewit.com/sitemap.xml`

#### 2. Missing `sitemap.xml` (was returning 404)
- **Created**: `app/sitemap.ts` — Next.js auto-generates `/sitemap.xml`
- Includes all 12 static public pages with proper priorities and change frequencies
- **TODO**: Uncomment the dynamic pages section to include individual review and blog post URLs

#### 3. SSR Body Showing "Checking authentication..." Instead of Page Content
- **Fixed**: `src/context/AuthContext.tsx`
- **Root Cause**: `AuthProvider` blocked all children rendering until auth check completed. Googlebot (which has no auth token) saw only "Checking authentication..." as the entire page body.
- **Fix**: Children are now always rendered immediately. Auth state is passed via context, and protected routes handle their own loading state.
- **Impact**: This was the **#1 reason** the site wasn't being indexed. Google couldn't see any content.

#### 4. Missing Structured Data (JSON-LD)
- **Added** to `app/layout.tsx`: Organization, WebSite, and WebPage schema.org structured data
- Helps Google understand your site is a review platform with a search function

#### 5. Brand Name Inconsistency
- **Before**: Pages randomly used "ReviewIt", "Review-It", and "Riviewit"
- **After**: All pages consistently use **"Riviewit"**
- Google needs consistent branding to associate all pages with one entity

#### 6. Missing "riviewit" Brand Keyword
- **Before**: Keywords were only generic ("reviews", "product reviews")
- **After**: Added "riviewit", "riviewit.com", "review it" as primary keywords
- Essential for brand searches to work

### 🟡 Important Issues Fixed

#### 7. No OG Image for Social Sharing
- **Created**: `app/opengraph-image.tsx` — Auto-generated OG image
- Shows branded preview when shared on social media/messaging apps

#### 8. No Dynamic Metadata for Content Pages
- **Fixed**: `app/review/[id]/page.tsx` — Now fetches review data for unique title/description
- **Fixed**: `app/blog/[slug]/page.tsx` — Now fetches blog post data for unique title/description
- Each page now has unique SEO metadata instead of generic titles

#### 9. Missing Canonical URLs
- **Added** `alternates.canonical` to all sub-pages
- Prevents duplicate content issues

#### 10. Title Template System
- **Added** title template `%s | Riviewit` in root layout
- Sub-pages automatically get ` | Riviewit` appended

#### 11. Nginx Configuration Improvements
- **Added**: www → non-www 301 redirect (canonical URL consolidation)
- **Added**: Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- **Added**: Static asset caching (improves Core Web Vitals / page speed)

#### 12. Manifest Brand Consistency
- Changed "Riview-It" → "Riviewit" in `manifest.json`

---

## Manual Steps Required (After Deploying Code Changes)

### Step 1: Google Search Console Setup (CRITICAL)

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add Property"**
3. Choose **"URL prefix"** and enter: `https://riviewit.com`
4. Verify ownership using one of these methods:
   - **HTML tag** (recommended): Google will give you a meta tag like:
     ```html
     <meta name="google-site-verification" content="YOUR_CODE_HERE" />
     ```
     Then update `app/layout.tsx` → uncomment the `verification.google` field and add your code:
     ```typescript
     verification: {
       google: 'YOUR_CODE_HERE',
     },
     ```
   - **DNS record**: Add a TXT record to your domain's DNS settings

5. After verification, go to **Sitemaps** in the left menu
6. Submit: `https://riviewit.com/sitemap.xml`
7. Go to **URL Inspection** and request indexing for `https://riviewit.com`

### Step 2: Request Indexing

After deploying and verifying in Search Console:

1. In Google Search Console → **URL Inspection**
2. Enter `https://riviewit.com`
3. Click **"Request Indexing"**
4. Repeat for key pages:
   - `https://riviewit.com/blog`
   - `https://riviewit.com/about`
   - `https://riviewit.com/contact`

### Step 3: Update Nginx Configuration

Upload the updated `nginx/riviewit.com.conf` to your server and reload:

```bash
# Upload the config
sudo cp riviewit.com.conf /etc/nginx/sites-available/riviewit.com.conf

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 4: Deploy Frontend Changes

```bash
cd /path/to/review-frontend
npm run build
pm2 restart riviewit-frontend  # or however your frontend is deployed
```

### Step 5: Verify After Deployment

1. Check robots.txt: Visit `https://riviewit.com/robots.txt`
2. Check sitemap: Visit `https://riviewit.com/sitemap.xml`
3. Test structured data: [Google Rich Results Test](https://search.google.com/test/rich-results) → Enter `https://riviewit.com`
4. Test page rendering: [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) → Enter `https://riviewit.com`
5. Verify the page body no longer shows "Checking authentication..." — it should show actual page content

### Step 6: Enable Dynamic Sitemap (Optional but Recommended)

Edit `app/sitemap.ts` to uncomment the dynamic pages section and fetch reviews/blog posts from your API. This gives Google URLs for every individual review and blog post.

---

## SEO Timeline Expectations

- **Indexing**: 2-7 days after submitting to Google Search Console
- **Brand search ("riviewit")**: 1-2 weeks after indexing
- **Competitive keywords**: 1-3 months (depends on content quality and backlinks)

## Additional Recommendations (Future)

1. **Create quality blog content** regularly — helps build topical authority
2. **Build backlinks** — Get other sites to link to riviewit.com
3. **Add Google Analytics** — Track traffic and user behavior
4. **Submit to Bing Webmaster Tools** — [bing.com/webmasters](https://www.bing.com/webmasters)
5. **Create social media profiles** — Link them in the Organization schema `sameAs` array
6. **Add `hreflang` tags** if you plan to support multiple languages
7. **Monitor Core Web Vitals** in Search Console for page speed optimization
