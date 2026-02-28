# 🔧 Dynamic TURN Credentials Setup Guide

## ✅ Implementation Complete!

This guide explains how to configure and deploy the dynamic TURN credentials system for your WebRTC application.

---

## 📋 What Was Implemented

### 1. **Backend Components**
- ✅ `src/utils/turnCredentials.ts` - HMAC SHA1 credential generator
- ✅ `pages/api/turn-credentials.ts` - API endpoint for dynamic credentials
- ✅ `.env.example` - Updated with TURN configuration template

### 2. **Frontend Components**
- ✅ `webrtcService.ts` - Updated to fetch and cache dynamic TURN credentials
- ✅ Automatic credential refresh (6 hours TTL with 5-minute safety margin)
- ✅ Fallback to STUN-only mode if TURN fetch fails

---

## 🚀 Deployment Steps

### **Step 1: Update Coturn Configuration**

SSH into your VPS and edit the Coturn config:

```bash
sudo nano /etc/turnserver.conf
```

**Enable dynamic credentials:**

```conf
# Comment out static user credentials
# user=turnwebrtc:TurnweB@rtc3369

# Enable time-limited credentials
use-auth-secret

# Add a strong static secret (MUST match backend .env)
static-auth-secret=YOUR_STRONG_SECRET_HERE_Min32Chars!

# Ensure these are set
lt-cred-mech
realm=turn.riviewit.com
```

**Generate a strong secret:**

```bash
openssl rand -base64 32
```

Example output: `K7j9mN2pQ4rT6vY8zA1bC3dE5fG7hI9jK`

**Restart Coturn:**

```bash
sudo systemctl restart coturn
sudo systemctl status coturn
```

---

### **Step 2: Configure Backend Environment**

Navigate to backend directory:

```bash
cd /var/www/review-backend
```

Create/edit `.env` file:

```bash
sudo nano .env
```

**Add TURN configuration:**

```env
# TURN Server Configuration (Coturn)
TURN_STATIC_SECRET="K7j9mN2pQ4rT6vY8zA1bC3dE5fG7hI9jK"
TURN_REALM="turn.riviewit.com"
TURN_URL_UDP="turn:turn.riviewit.com:3478?transport=udp"
TURN_URL_TCP="turn:turn.riviewit.com:3478?transport=tcp"
TURN_URL_TLS="turns:turn.riviewit.com:5349?transport=tcp"
```

**⚠️ IMPORTANT:** Use the SAME secret you added to Coturn config!

---

### **Step 3: Deploy Backend Code**

```bash
# Pull latest code
cd /var/www/review-backend
git pull origin main

# Install dependencies (if new ones were added)
npm install

# Build the project
npm run build

# Restart PM2
pm2 restart review-backend
pm2 logs review-backend
```

**Verify API endpoint:**

```bash
curl https://api.riviewit.com/api/turn-credentials
```

Expected response:

```json
{
  "success": true,
  "username": "1730000000:turnuser",
  "credential": "base64encodedstring==",
  "ttl": 21600,
  "urls": [
    "turn:turn.riviewit.com:3478?transport=udp",
    "turn:turn.riviewit.com:3478?transport=tcp",
    "turns:turn.riviewit.com:5349?transport=tcp"
  ]
}
```

---

### **Step 4: Deploy Frontend Code**

```bash
# Pull latest code
cd /var/www/review-frontend
git pull origin main

# Install dependencies
npm install

# Build the project
npm run build

# Restart frontend server (if using PM2)
pm2 restart review-frontend
# OR if using nginx static files
sudo systemctl reload nginx
```

---

## 🧪 Testing & Verification

### **1. Check Browser Console**

When initiating a call, you should see:

```
🔑 Fetching dynamic TURN credentials...
✅ Dynamic TURN credentials fetched successfully
🔧 ICE Servers configured: 5 servers (STUN + TURN)
```

### **2. Verify ICE Candidates**

Look for **relay** type candidates (this means TURN is working):

```
📡 [CALLER] Candidate type: relay protocol: udp  ← TURN relay!
📡 [RECEIVER] Candidate type: relay protocol: tcp
```

### **3. Check Packet Flow**

After call connects:

```
📊 [CALLER] Outbound Audio: packetsSent=125  ← Non-zero = working!
📊 [RECEIVER] Outbound Audio: packetsSent=98
```

### **4. Monitor Coturn Logs**

```bash
sudo tail -f /var/log/turn*.log
```

Look for successful allocations and relay sessions.

---

## 🔒 Security Features

### **Implemented Security:**

1. ✅ **Time-Limited Credentials** - Expire after 6 hours
2. ✅ **HMAC SHA1 Signing** - Prevents credential tampering
3. ✅ **No Hardcoded Passwords** - Dynamic generation per session
4. ✅ **Automatic Refresh** - Frontend caches and renews credentials
5. ✅ **Secret in Environment** - Not exposed in frontend code

### **Secret Management:**

- ✅ Secret stored in `.env` (not committed to git)
- ✅ Same secret used by Coturn and backend
- ✅ Minimum 32 characters recommended
- ✅ Use `openssl rand -base64 32` to generate

---

## 🐛 Troubleshooting

### **Problem: "Failed to fetch TURN credentials"**

**Solution:**
```bash
# Check backend is running
pm2 status

# Check API endpoint
curl https://api.riviewit.com/api/turn-credentials

# Check backend logs
pm2 logs review-backend --lines 50
```

### **Problem: "No relay candidates generated"**

**Solution:**
```bash
# Verify Coturn is running
sudo systemctl status coturn

# Check Coturn config
sudo nano /etc/turnserver.conf
# Ensure use-auth-secret is enabled
# Ensure static-auth-secret matches .env

# Restart Coturn
sudo systemctl restart coturn
```

### **Problem: "TURN authentication failed"**

**Cause:** Secret mismatch between Coturn and backend

**Solution:**
```bash
# Check Coturn secret
sudo grep "static-auth-secret" /etc/turnserver.conf

# Check backend secret
cd /var/www/review-backend
grep "TURN_STATIC_SECRET" .env

# They MUST match exactly!
```

---

## 📊 Expected Results

### **Before (Static TURN):**
```
🔧 [CALLER] ICE Servers configured: 5 servers (STUN + TURN)
📡 [CALLER] Candidate type: host
📡 [CALLER] Candidate type: srflx
❌ No relay candidates
❌ packetsSent=0
```

### **After (Dynamic TURN):**
```
🔑 Fetching dynamic TURN credentials...
✅ Dynamic TURN credentials fetched successfully
🔧 [CALLER] ICE Servers configured: 5 servers (STUN + TURN)
📡 [CALLER] Candidate type: host
📡 [CALLER] Candidate type: srflx
📡 [CALLER] Candidate type: relay  ← TURN working!
✅ packetsSent=125  ← Audio flowing!
```

---

## 🎯 Key Benefits

1. ✅ **Security** - No exposed passwords in frontend code
2. ✅ **Scalability** - Each user gets unique time-limited credentials
3. ✅ **Performance** - Credentials cached for 6 hours
4. ✅ **Reliability** - Automatic fallback to STUN if TURN unavailable
5. ✅ **Standard Compliance** - Same approach used by Twilio, Google

---

## 📝 Quick Reference

### **Coturn Config Path:**
```
/etc/turnserver.conf
```

### **Backend .env Path:**
```
/var/www/review-backend/.env
```

### **API Endpoint:**
```
https://api.riviewit.com/api/turn-credentials
```

### **Test Command:**
```bash
curl https://api.riviewit.com/api/turn-credentials
```

### **Restart Services:**
```bash
# Coturn
sudo systemctl restart coturn

# Backend
pm2 restart review-backend

# Check logs
pm2 logs review-backend
sudo tail -f /var/log/turn*.log
```

---

## ✅ Deployment Checklist

- [ ] Updated Coturn config with `use-auth-secret`
- [ ] Added `static-auth-secret` to Coturn config
- [ ] Created backend `.env` with TURN configuration
- [ ] Verified secret matches in both Coturn and backend
- [ ] Deployed backend code (git pull, npm install, npm run build)
- [ ] Restarted backend (pm2 restart)
- [ ] Tested API endpoint with curl
- [ ] Deployed frontend code (git pull, npm install, npm run build)
- [ ] Tested voice call in browser
- [ ] Verified relay candidates in console
- [ ] Confirmed packetsSent > 0

---

## 🎉 Success Criteria

✅ Browser console shows "Dynamic TURN credentials fetched successfully"
✅ ICE candidates include type: "relay"
✅ Audio packets transmitted (packetsSent > 0)
✅ Both caller and receiver can hear each other
✅ Works on Indian ISPs (Jio/Airtel) that block UDP to free TURN servers

---

**Need Help?**
Check the troubleshooting section or review Coturn logs for specific error messages.
