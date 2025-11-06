# Quick Start Guide - Social Media Publisher

## Prerequisites
- Node.js 18+ installed
- npm or yarn

## Installation & Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env` file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your API keys:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./database/socialmedia.db

# OpenAI API (Required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Social Media APIs (Add as needed)
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### 3. Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will start on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:5173

### 4. Access the Application

Open your browser and go to: **http://localhost:5173**

## First Steps

### 1. Connect Social Media Accounts

1. Navigate to **Accounts** in the sidebar
2. Click **Add Account**
3. Select platform and enter:
   - Account Name (e.g., @mycompany)
   - Account ID (platform-specific ID)
   - Access Token (from platform's developer console)
4. Click **Add Account**

### 2. Create Your First Post

1. Click **Create Post** in the sidebar
2. Fill in:
   - **Title**: Give your post a title
   - **Content**: Write your post content
   - **Media**: Upload images or videos (optional)
   - **Platforms**: Select where to publish
   - **Schedule**: Set date/time (optional)
3. Click **Save as Draft** or **Schedule Post**

### 3. Use AI Generation

1. In the Create Post form, enter a title or context
2. Click **Generate with AI** button
3. AI will generate engaging content for your post
4. Edit as needed and save

## Getting API Credentials

### Instagram Business API

1. Create a Facebook Developer account
2. Create a new app
3. Add Instagram Graph API product
4. Get your App ID and App Secret
5. Connect your Instagram Business account

**Docs**: https://developers.facebook.com/docs/instagram-api

### Facebook Pages API

1. Use the same Facebook Developer app
2. Add Facebook Login and Pages API
3. Get Page Access Token for your Facebook Page

**Docs**: https://developers.facebook.com/docs/pages

### Twitter/X API

1. Sign up for Twitter Developer account
2. Create a new app in the Developer Portal
3. Generate API Key, API Secret, and Bearer Token

**Docs**: https://developer.twitter.com/en/docs/twitter-api

### LinkedIn API

1. Create a LinkedIn Developer app
2. Request access to Marketing Developer Platform
3. Get Client ID and Client Secret
4. Implement OAuth flow for user tokens

**Docs**: https://learn.microsoft.com/en-us/linkedin/marketing/

### OpenAI API

1. Sign up at https://platform.openai.com
2. Create an API key in your dashboard
3. Add credits to your account

**Docs**: https://platform.openai.com/docs

## Features Overview

### Dashboard
- View statistics (total posts, scheduled, published, failed)
- See connected accounts
- Quick access to recent posts

### Create Post
- Rich text editor
- Media upload (images/videos)
- AI-powered content generation
- Multi-platform selection
- Scheduling

### Calendar
- Visual calendar view of all posts
- Drag & drop scheduling (coming soon)
- Color-coded by status
- Quick post preview

### History
- Complete publication history
- Filter by platform, status, date
- Links to published posts
- Error tracking

### Accounts
- Manage all social media accounts
- Add/remove accounts
- View connection status

### Analytics
- Post statistics
- Platform distribution
- Success rate tracking
- Quick insights

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify all dependencies are installed: `npm install`
- Check `.env` file exists and is configured

### Frontend won't start
- Check if port 5173 is available
- Verify all dependencies are installed: `npm install`
- Clear node_modules and reinstall if needed

### API errors
- Verify API keys in `.env` are correct
- Check API credentials haven't expired
- Review platform-specific rate limits

### Database errors
- Delete `backend/database/socialmedia.db` to reset
- Restart backend to reinitialize database

## Production Deployment

For production deployment:

1. **Backend**: Build and deploy to a Node.js hosting service
2. **Frontend**: Build and deploy to static hosting (Vercel, Netlify)
3. **Environment**: Set all production environment variables
4. **Security**: Implement proper OAuth flows for social media authentication
5. **Database**: Consider migrating to PostgreSQL or MySQL for production

## Need Help?

- Check the main README.md for detailed documentation
- Review API documentation for each platform
- Open an issue on GitHub for bugs or feature requests

---

Happy Publishing! 🚀
