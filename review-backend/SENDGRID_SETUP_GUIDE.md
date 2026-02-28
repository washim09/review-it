# SendGrid Email Verification Setup Guide

## Current Status
✅ FRONTEND_URL is now uncommented
⚠️ Need to verify SendGrid configuration

## Steps to Fix Email Verification

### Step 1: Verify SendGrid API Key

1. **Login to SendGrid Dashboard**
   - Go to: https://app.sendgrid.com/
   - Login with your SendGrid account

2. **Check API Key Status**
   - Navigate to: **Settings** → **API Keys**
   - Find your API key in the list
   - Check if it's active and not expired
   - **If expired or missing**: Create a new API key

3. **Create New API Key (if needed)**
   - Click **"Create API Key"**
   - Name: `Riviewit Email Service`
   - Permission Level: Select **"Full Access"** OR minimum **"Mail Send"**
   - Click **"Create & View"**
   - **IMPORTANT**: Copy the API key immediately (you can't view it again)
   - Update `.env` file:
     ```env
     SENDGRID_API_KEY="YOUR_NEW_API_KEY_HERE"
     ```

### Step 2: Verify Sender Email

**CRITICAL**: SendGrid requires sender email verification

1. **Check Sender Authentication**
   - Go to: **Settings** → **Sender Authentication**
   - Look for `akrmwaseem@riviewit.com`

2. **Verify Single Sender (Recommended for Development)**
   - Navigate to: **Settings** → **Sender Authentication** → **Single Sender Verification**
   - Click **"Create New Sender"**
   - Fill in:
     - **From Name**: Riviewit
     - **From Email Address**: akrmwaseem@riviewit.com
     - **Reply To**: akrmwaseem@riviewit.com
     - **Company Address**: Your company address
   - Click **"Save"**
   - **Check your email** (akrmwaseem@riviewit.com) for verification link
   - Click the verification link to verify the sender

3. **Alternative: Domain Authentication (Recommended for Production)**
   - Navigate to: **Settings** → **Sender Authentication** → **Domain Authentication**
   - Click **"Authenticate Your Domain"**
   - Select your DNS host
   - Follow the DNS record setup instructions
   - This allows sending from any `@riviewit.com` email address

### Step 3: Test Email Sending

After verification, restart your backend:

```bash
cd d:\Nextjs\review-it\review-backend
pm2 restart riviewit-backend

# Check logs for email sending
pm2 logs riviewit-backend --lines 50
```

### Step 4: Test Registration

1. Go to: https://riviewit.com/register
2. Create a new test account
3. Check backend logs for:
   ```
   📨 Preparing to send verification email...
   ✅ Verification email sent successfully
   ```
4. Check your test email inbox for verification email

### Step 5: Common Issues & Solutions

#### Issue: "SendGrid API key not configured"
**Solution**: Make sure `.env` file has:
```env
SENDGRID_API_KEY="SG.your-actual-key-here"
```

#### Issue: "403 Forbidden" or "Sender not verified"
**Solution**: 
- Verify sender email in SendGrid dashboard (Step 2)
- OR set up domain authentication

#### Issue: Emails going to spam
**Solution**:
- Set up domain authentication (DNS records)
- Add SPF and DKIM records
- Maintain good sending reputation

#### Issue: "Permission denied"
**Solution**:
- API key needs "Mail Send" permission
- Create new API key with Full Access or Mail Send permission

### Step 6: Production Checklist

Before going live:
- ✅ Domain authentication set up (not just single sender)
- ✅ SPF, DKIM, and DMARC records configured
- ✅ Sender email matches verified domain
- ✅ FRONTEND_URL set to production URL
- ✅ Test email delivery to Gmail, Outlook, Yahoo

## Quick Test Commands

```bash
# Check if SendGrid vars are set
grep SENDGRID .env

# Restart backend
pm2 restart riviewit-backend

# Monitor logs
pm2 logs riviewit-backend --lines 100 | grep -i "email\|sendgrid"
```

## Support

If you're still having issues:
1. Check SendGrid Activity Feed: https://app.sendgrid.com/email_activity
2. Review SendGrid error codes: https://docs.sendgrid.com/api-reference/mail-send/errors
3. Contact SendGrid support if API issues persist

## Current Configuration

Your current `.env` settings:
```env
SENDGRID_API_KEY="SG.YFRzrscmTOuTC35S9Yzl0g..." (Set ✅)
SENDGRID_FROM_EMAIL="akrmwaseem@riviewit.com" (Set ✅)
FRONTEND_URL="https://riviewit.com" (Set ✅)
```

**Next Step**: Verify sender email `akrmwaseem@riviewit.com` in SendGrid dashboard!
