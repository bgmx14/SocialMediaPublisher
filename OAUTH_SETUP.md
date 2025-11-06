# 🔐 OAuth Setup Guide

This guide will help you configure OAuth authentication for all supported social media platforms.

## Why OAuth?

Instead of manually entering access tokens, OAuth provides:
- ✅ **Secure authentication** - No manual token handling
- ✅ **User-friendly** - One-click connection
- ✅ **Token refresh** - Automatic token renewal
- ✅ **Better UX** - Direct platform authorization

## Prerequisites

Before setting up OAuth, you need developer accounts and apps for each platform:

### 1. Facebook & Instagram Setup

#### Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Business** type
4. Fill in app details and create

#### Configure OAuth Settings

1. In your app dashboard, go to **Settings** → **Basic**
2. Note your **App ID** and **App Secret**
3. Add **App Domains**: `localhost` (for development)
4. Go to **Facebook Login** → **Settings**
5. Add **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3001/api/oauth/facebook/callback
   http://localhost:3001/api/oauth/instagram/callback
   ```

#### Add Products

1. **Facebook Login**: Click **Set Up** and configure
2. **Instagram Basic Display** or **Instagram Graph API**: Click **Set Up**

#### Get Required Permissions

Make sure your app has these permissions:
- `pages_read_engagement`
- `pages_manage_posts`
- `pages_show_list`
- `instagram_basic`
- `instagram_content_publish`
- `business_management`

#### Connect Instagram Business Account

1. Go to your Facebook Page settings
2. Link your Instagram Business account to your Facebook Page
3. This allows the app to post to Instagram through Facebook

---

### 2. Twitter / X Setup

#### Create Twitter App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new **Project** and **App**
3. Note your **API Key** and **API Secret**

#### Configure OAuth 2.0

1. In your app settings, go to **User authentication settings**
2. Click **Set up**
3. Enable **OAuth 2.0**
4. Set **Type of App**: Web App
5. Add **Callback URI / Redirect URL**:
   ```
   http://localhost:3001/api/oauth/twitter/callback
   ```
6. Add **Website URL**: `http://localhost:5173`

#### Set App Permissions

Select permissions:
- ✅ **Read and write** (to post tweets)
- ✅ **Read** users (to get user info)

#### Get Your Credentials

Note these from your app:
- **API Key** (Client ID)
- **API Secret** (Client Secret)
- **Bearer Token** (for some API calls)

---

### 3. LinkedIn Setup

#### Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click **Create App**
3. Fill in required information:
   - App name
   - LinkedIn Page (you must create or have access to a LinkedIn Page)
   - App logo
   - Legal agreement

#### Request API Access

1. Go to **Products** tab
2. Request access to **Share on LinkedIn** and **Sign In with LinkedIn using OpenID Connect**
3. Wait for approval (usually instant for basic features)

#### Configure OAuth Settings

1. Go to **Auth** tab
2. Note your **Client ID** and **Client Secret**
3. Add **Redirect URLs**:
   ```
   http://localhost:3001/api/oauth/linkedin/callback
   ```

#### Required Scopes

Your app needs these scopes:
- `openid`
- `profile`
- `email`
- `w_member_social` (to post on behalf of user)

---

## Backend Configuration

### 1. Update `.env` File

Copy `.env.example` to `.env` and fill in your credentials:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_PATH=./database/socialmedia.db

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key-here

# Facebook & Instagram
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Twitter / X
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Scheduling
SCHEDULER_CHECK_INTERVAL=*/1 * * * *
```

### 2. Verify Configuration

Start the backend:
```bash
cd backend
npm run dev
```

You should see:
```
✅ Database initialized successfully
⏰ Starting post scheduler...
🚀 Social Media Publisher API
📡 Server running on port 3001
```

---

## Frontend Configuration

### Update Frontend `.env` (Optional)

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Access the app at: http://localhost:5173

---

## Testing OAuth Flow

### 1. Connect Facebook/Instagram

1. Navigate to **Accounts** page
2. Click **Connect Account** under Facebook or Instagram
3. You'll be redirected to Facebook login
4. Authorize the app
5. Select which Facebook Pages to connect
6. You'll be redirected back with connected accounts

**Expected Result:**
- Facebook Pages appear as connected accounts
- Instagram Business accounts (linked to Pages) also appear

### 2. Connect Twitter/X

1. Click **Connect Account** under Twitter
2. Authorize the app on Twitter
3. Grant permissions
4. Redirected back with account connected

**Expected Result:**
- Your Twitter account appears with username

### 3. Connect LinkedIn

1. Click **Connect Account** under LinkedIn
2. Authorize the app on LinkedIn
3. Grant permissions
4. Redirected back with account connected

**Expected Result:**
- Your LinkedIn profile appears as connected

---

## Common Issues & Solutions

### Facebook/Instagram Issues

**Problem:** "App Not Set Up: This app is still in development mode"
- **Solution:** This is normal for development. Your app works for admins, developers, and testers added in the app dashboard.
- **Production:** Submit your app for review to make it public.

**Problem:** Instagram account not showing
- **Solution:**
  - Ensure your Instagram is a Business account
  - Link it to a Facebook Page
  - The Facebook Page must be connected to your app

**Problem:** "Invalid OAuth Redirect URI"
- **Solution:** Double-check the callback URL in Facebook App settings matches exactly:
  ```
  http://localhost:3001/api/oauth/facebook/callback
  ```

### Twitter Issues

**Problem:** "Invalid OAuth 2.0 Redirect URI"
- **Solution:** Ensure callback URL is exactly:
  ```
  http://localhost:3001/api/oauth/twitter/callback
  ```

**Problem:** "Forbidden: The request is understood, but it has been refused"
- **Solution:**
  - Check your app has **Read and write** permissions
  - Verify OAuth 2.0 is enabled
  - Make sure your app is not suspended

### LinkedIn Issues

**Problem:** "invalid_redirect_uri"
- **Solution:** Verify the redirect URI in LinkedIn app settings

**Problem:** "Insufficient permissions"
- **Solution:**
  - Request access to **Share on LinkedIn** product
  - Wait for approval
  - Some features require LinkedIn Page ownership

### General OAuth Issues

**Problem:** "state parameter mismatch"
- **Solution:** This is a security error. Clear browser cookies and try again.

**Problem:** Tokens expired
- **Solution:**
  - Facebook: Tokens last 60 days, implement refresh before expiry
  - Twitter: Use refresh token endpoint
  - LinkedIn: Use refresh token endpoint

---

## Production Deployment

### Update Redirect URIs

When deploying to production, update all callback URLs in each platform's developer console:

**Format:**
```
https://yourdomain.com/api/oauth/{platform}/callback
```

**Example:**
```
https://api.socialmediapublisher.com/api/oauth/facebook/callback
https://api.socialmediapublisher.com/api/oauth/twitter/callback
https://api.socialmediapublisher.com/api/oauth/linkedin/callback
```

### Update Environment Variables

```env
FRONTEND_URL=https://app.socialmediapublisher.com
NODE_ENV=production
```

### Security Checklist

- ✅ Use HTTPS in production
- ✅ Keep API secrets secure (never commit to Git)
- ✅ Use environment variables for all sensitive data
- ✅ Implement rate limiting
- ✅ Monitor token expiration and refresh
- ✅ Review app permissions regularly
- ✅ Keep dependencies updated

---

## Token Refresh

Tokens eventually expire. The app handles this automatically:

### Automatic Refresh

When making API calls, the app checks token expiration and refreshes if needed.

### Manual Refresh

You can also manually refresh tokens via API:

```bash
POST /api/oauth/refresh/:accountId
```

This is useful for:
- Twitter tokens (expire in 2 hours)
- LinkedIn tokens (expire in 60 days)
- Facebook long-lived tokens (expire in 60 days, need re-exchange)

---

## Need Help?

### Official Documentation

- [Facebook for Developers](https://developers.facebook.com/docs/)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [Twitter API Documentation](https://developer.twitter.com/en/docs)
- [LinkedIn API Documentation](https://learn.microsoft.com/en-us/linkedin/marketing/)

### Support

- Check the main [README.md](./README.md) for general setup
- See [QUICKSTART.md](./QUICKSTART.md) for quick start guide
- Open an issue on GitHub for bugs or questions

---

## Summary

✅ **Created developer apps** on each platform
✅ **Configured OAuth redirect URIs** for all platforms
✅ **Added API credentials** to backend `.env`
✅ **Tested OAuth flows** for each platform
✅ **Verified token refresh** works correctly

You're now ready to securely connect social media accounts! 🎉
