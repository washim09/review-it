# Review-it Deployment Guide

## Server Details

| Service | Directory | Port | PM2 Name |
|---------|-----------|------|----------|
| **Backend** | `/home/riviewit-api/htdocs/api.riviewit.com` | 3000 | `riviewit-backend` |
| **Frontend** | `/home/riviewit/htdocs/riviewit.com` | 3002 | `review-frontend` |
| **Admin** | `/home/riviewit-admin/htdocs/admin.riviewit.com` | 5174 | `review-admin` |
| **Socket Server** | `/home/riviewit-api/htdocs/api.riviewit.com` | 3001 | `socket-server` |

## Nginx Config

- File: `/etc/nginx/sites-enabled/riviewit.com.conf`
- `location /` → `http://127.0.0.1:3002` (Frontend)
- `location /api` → `http://127.0.0.1:3000` (Backend)
- `location /socket.io/` → `http://127.0.0.1:3001` (Socket)

---

## 1. Deploy Frontend Changes

```bash
# Step 1: Push changes to GitHub from local machine
cd d:\Nextjs\review-it
git add .
git commit -m "your commit message"
git push origin main

# Step 2: SSH into server and pull latest code
cd /home/riviewit/htdocs/riviewit.com
git pull origin main

# Step 3: Copy frontend files (if repo has subfolder structure)
cp -r review-frontend/* .
cp -r review-frontend/.* . 2>/dev/null

# Step 4: Install dependencies (only if package.json changed)
npm install

# Step 5: Build the application
npm run build

# Step 6: Restart PM2
pm2 restart review-frontend

# Step 7: Verify
pm2 list
curl -I http://localhost:3002
```

### If PM2 process is errored/deleted, start fresh:
```bash
PORT=3002 pm2 start node_modules/.bin/next --name "review-frontend" --cwd /home/riviewit/htdocs/riviewit.com -- start
pm2 save
```

---

## 2. Deploy Backend Changes

```bash
# Step 1: Push changes to GitHub from local machine
cd d:\Nextjs\review-it
git add .
git commit -m "your commit message"
git push origin main

# Step 2: SSH into server and pull latest code
cd /home/riviewit-api/htdocs/api.riviewit.com
git pull origin main

# Step 3: Copy backend files (if repo has subfolder structure)
cp -r review-backend/* .
cp -r review-backend/.* . 2>/dev/null

# Step 4: Install dependencies (only if package.json changed)
npm install

# Step 5: Run Prisma migrations (only if schema.prisma changed)
npx prisma migrate deploy
# OR if there are conflicts:
npx prisma db push

# Step 6: Build the application
npm run build

# Step 7: Restart PM2
pm2 restart riviewit-backend

# Step 8: Verify
pm2 list
curl -I http://localhost:3000/api/reviews
```

---

## 3. Deploy Admin Panel Changes

```bash
# Step 1: Push changes to GitHub from local machine
cd d:\Nextjs\review-it
git add .
git commit -m "your commit message"
git push origin main

# Step 2: SSH into server and pull latest code
cd /home/riviewit-admin/htdocs/admin.riviewit.com
git pull origin main

# Step 3: Copy admin files (if repo has subfolder structure)
cp -r review-admin/* .
cp -r review-admin/.* . 2>/dev/null

# Step 4: Install dependencies (only if package.json changed)
npm install

# Step 5: Build the application
npm run build

# Step 6: Restart PM2
pm2 restart review-admin

# Step 7: Verify
pm2 list
curl -I http://localhost:5174
```

---

## Quick Reference Commands

### Check all services status
```bash
pm2 list
```

### View logs for a specific service
```bash
pm2 logs review-frontend --lines 20
pm2 logs riviewit-backend --lines 20
pm2 logs review-admin --lines 20
```

### Restart all services
```bash
pm2 restart all
```

### Save PM2 config (always run after changes)
```bash
pm2 save
```

### Check which ports are in use
```bash
netstat -tlnp | grep -E ":(3000|3001|3002|5174)"
```

### Test Nginx configuration
```bash
nginx -t
systemctl reload nginx
```

---

## Troubleshooting

### 502 Bad Gateway
1. Check if the correct PM2 process is running: `pm2 list`
2. Verify the port is listening: `netstat -tlnp | grep :3002`
3. Test direct access: `curl -I http://localhost:3002`
4. Check PM2 logs: `pm2 logs review-frontend --lines 30`

### PM2 Process Errored
```bash
pm2 delete review-frontend
PORT=3002 pm2 start node_modules/.bin/next --name "review-frontend" --cwd /home/riviewit/htdocs/riviewit.com -- start
pm2 save
```

### IMPORTANT Notes
- **Do NOT use `-p` flag** with `next start` — it interprets it as a directory path, not a port
- **Use `PORT=3002` env variable** to set the port
- **Always run `pm2 save`** after making PM2 changes to persist across reboots
- **Backend uses port 3000**, Frontend uses port **3002**, Admin uses port **5174**
