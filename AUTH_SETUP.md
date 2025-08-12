# 🔐 Google Authentication & Convex Database Setup

This guide will help you set up Google authentication with Clerk and Convex database integration for your health app.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Google Cloud Console account
- Clerk account
- Convex account

## 🚀 Step 1: Google OAuth Setup

### 1.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/sign-in`
   - `http://localhost:3000/sign-up`
   - `http://localhost:3000/sso-callback`
   - Your production domain URLs
7. Copy the **Client ID** and **Client Secret**

### 1.2 Configure Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Go to "User & Authentication" → "Social Connections"
4. Enable Google OAuth
5. Enter your Google Client ID and Client Secret
6. Copy your Clerk publishable key and secret key

## 🗄️ Step 2: Convex Database Setup

### 2.1 Create Convex Project

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Create a new project
3. Copy your project URL

### 2.2 Configure Convex

1. Run the following command in your project:
   ```bash
   npx convex dev
   ```
2. Follow the prompts to configure your project
3. This will create the necessary configuration files

## ⚙️ Step 3: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Google OAuth (from Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Clerk Authentication (from Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Convex Database (from Convex Dashboard)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Other existing variables
TAVILY_API_KEY=your_tavily_api_key_here
MEDICAL_DICTIONARY_API_KEY=your_medical_dictionary_api_key_here
```

## 🔧 Step 4: Update Clerk Configuration

### 4.1 Update Clerk Environment Variables

In your Clerk Dashboard, make sure to add these environment variables:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4.2 Configure Redirect URLs

Add these redirect URLs in your Clerk application settings:

- **Sign in URL**: `http://localhost:3000/sign-in`
- **Sign up URL**: `http://localhost:3000/sign-up`
- **After sign in URL**: `http://localhost:3000/dashboard`
- **After sign up URL**: `http://localhost:3000/dashboard`

## 🏃‍♂️ Step 5: Run the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start Convex development server:
   ```bash
   npx convex dev
   ```

3. Start Next.js development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## 🎯 Features Available

### ✅ Guest Users
- Access all health AI features
- Use symptom analysis, general inquiry, report analyzer
- No authentication required

### ✅ Authenticated Users
- Personalized dashboard
- Chat history tracking
- Health record management
- Persistent data storage
- User profile management

## 🔍 Testing the Setup

1. **Guest Mode**: Visit the app without signing in
   - All features should work normally
   - No data persistence

2. **Authentication**: Click "Sign In" button
   - Should redirect to Google OAuth
   - After successful login, redirect to dashboard

3. **Dashboard**: Check if user data is synced
   - User profile should be created in Convex
   - Dashboard should show user information

4. **Data Persistence**: Use health features while logged in
   - Chat history should be saved
   - Health records should be stored

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid Client ID" Error**
   - Check your Google OAuth credentials
   - Verify redirect URIs match exactly

2. **"Clerk not configured" Error**
   - Ensure environment variables are set correctly
   - Check Clerk dashboard configuration

3. **"Convex connection failed" Error**
   - Verify Convex URL in environment variables
   - Check if Convex dev server is running

4. **Authentication not working**
   - Clear browser cookies and cache
   - Check browser console for errors
   - Verify middleware configuration

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded
3. Check network tab for failed requests
4. Ensure all services are running

## 📱 Production Deployment

1. Update environment variables with production values
2. Configure production redirect URLs in Google Console
3. Update Clerk production settings
4. Deploy Convex to production
5. Update Next.js environment variables

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Regularly rotate API keys and secrets
- Monitor authentication logs
- Implement rate limiting for production

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review error logs in browser console
3. Verify all configuration steps
4. Check service status pages
5. Contact support for the respective services

---

**Happy coding**
**Mahatir Ahmed Tusher**
