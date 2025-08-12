
# Niramoy (নিরাময়) - Your AI Health Assistant

<img width="1916" height="865" alt="image" src="https://github.com/user-attachments/assets/7f44c0f8-71ec-4d50-a393-cd7e116a0a51" />


<p align="center"><i>An intelligent, Bengali-first AI health assistant designed for community health workers.</i></p>

---

## Table of Contents
- [About Niramoy](#about-niramoy)
- [Core Features](#core-features)
  - [AI-Powered Symptom Analysis](#1-ai-powered-symptom-analysis)
  - [Medical Report Analyzer](#2-medical-report-analyzer)
  - [Drug Dictionary (Bangladesh)](#3-drug-dictionary-bangladesh)
  - [Find a Specialist](#4-find-a-specialist)
  - [English-Bengali Medical Dictionary](#5-english-bengali-medical-dictionary)
  - [Multilingual and Theming Support](#6-multilingual-and-theming-support)
- [How It Works: Technology Stack](#how-it-works-technology-stack)
- [API Keys & Environment Variables](#api-keys--environment-variables)
- [Getting Started: Running Locally](#getting-started-running-locally)
- [Project File Structure](#project-file-structure)
- [Disclaimer](#disclaimer)

---

## About Niramoy

Niramoy (নিরাময়, meaning "Cure" or "Healing") is an innovative, generative AI-powered web application built with a profound mission: to empower community health workers in rural Bangladesh. Born from the belief that healthcare should be accessible, simple, humane, and delivered in the local language, Niramoy addresses the critical need for primary healthcare support in underserved regions.

Every day, countless individuals in remote areas of Bangladesh seek basic healthcare from community clinics. However, health workers often face challenges in quickly understanding symptoms, making timely decisions, providing necessary advice, or knowing where to refer patients, especially when adequate doctors or resources are scarce. Niramoy steps in as a trusted companion to bridge this gap.

This intelligent, Bengali-first chatbot assists community healthcare workers by: 
- **Analyzing Symptoms:** When a patient's name, age, gender, and initial symptoms are entered, Niramoy intelligently analyzes the input.
- **Asking Follow-up Questions:** It then generates relevant, empathetic follow-up questions in Bengali to gather more specific and nuanced information.
- **Providing Probable Diagnoses & Recommendations:** Based on the collected information, Niramoy offers probable diagnoses, recommended care actions (including suggestions for common over-the-counter Bangladeshi medicines), and outlines suggested diagnostic tests—all explained in simple, clear Bengali.

Our vision is to equip every health worker with the technological assistance needed to make confident and informed decisions. We aspire for every mother, every farmer, every child to receive accurate advice at the right time. Niramoy is not just a piece of technology; it's a new way to stand by people, ensuring healthcare is inclusive, language-friendly, and heartfelt. We are continuously developing this chatbot in alignment with local health policies to ensure it remains increasingly efficient and supportive.

---

## Core Features

### 1. AI-Powered Symptom Analysis
The core of the application is a conversational chat interface where a health worker can get AI-driven assistance.

*   **How it works:**
    1.  The user enters the patient's details: name, age, gender, and initial symptoms in Bengali.
    2.  A Genkit flow powered by **Google Gemini** analyzes this input and generates relevant, empathetic follow-up questions to gather more specific information.
    3.  Based on the user's answers, another Gemini-powered flow provides a **probable diagnosis**, **recommended care actions** (including suggestions for common over-the-counter Bangladeshi medicines), and **suggested diagnostic tests**.
    4.  A strong disclaimer to consult a registered doctor is always included with any medical advice.

### 2. Medical Report Analyzer
This feature helps demystify complex medical reports for both health workers and patients.

*   **How it works:**
    1.  The user uploads a picture of a medical report. An optional **cropping tool** allows the user to focus on the most relevant sections of the image.
    2.  The image is first sent to the **Meta Llama 3.2 Vision** model via the OpenRouter API. This model performs Optical Character Recognition (OCR) and extracts the technical data from the report.
    3.  The extracted technical text is then passed to **Google Gemini**.
    4.  Gemini's role is to translate this complex information into simple, understandable Bengali. It explains each medical term and provides the correct **normal range (স্বাভাবিক মাত্রা)** for each test from its own knowledge base, ensuring accuracy even if the original report is unclear.

### 3. Drug Dictionary (Bangladesh)
Provides detailed information about medicines commonly available in Bangladesh.

*   **How it works:**
    1.  The user searches for a drug by its brand name (e.g., "Napa").
    2.  The app uses the **Tavily Search API** to find information specifically from reliable Bangladeshi medical sites like `medex.com.bd` and `medeasy.health`.
    3.  The search results are passed to **Google Gemini**, which structures the information into a clear, organized format in Bengali, including the generic name, overview, dosage, side effects, and estimated price.

### 4. Find a Specialist
Helps users find the right type of doctor based on their symptoms and location.

*   **How it works:**
    1.  The user enters their symptoms and location (city, state, country).
    2.  The app uses **Google Gemini** to determine the most appropriate medical specialty (e.g., Cardiologist, Dermatologist).
    3.  It then uses the **SerpApi** to perform a Google search for that specialist in the specified location.
    4.  The results are compiled into a helpful Markdown report listing recommended doctors or clinics.

### 5. English-Bengali Medical Dictionary
A handy tool for looking up medical terms.

*   **How it works:**
    1.  The user enters an English medical term.
    2.  The app calls the **Merriam-Webster Medical Dictionary API** to get the official definition, part of speech, and pronunciation.
    3.  The English definition is then translated into simple Bengali using **Google Gemini**, making it accessible to local users.

### 6. Multilingual and Theming Support
The entire user interface can be switched between **English** and **Bengali**. It also supports both **light** and **dark** themes to ensure comfortable use in any lighting condition.

## How It Works: Technology Stack

Niramoy is built on a modern, robust, and scalable tech stack.

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **AI Orchestration:** [Google Genkit](https://firebase.google.com/docs/genkit)
*   **Generative AI Models:**
    *   [Google Gemini](https://deepmind.google/technologies/gemini/) for language understanding, generation, and translation.
    *   [Meta Llama 3.2 Vision](https://llama.meta.com/) via [OpenRouter](https://openrouter.ai/) for image analysis.
*   **External APIs:**
    *   [Tavily API](https://tavily.com/) for specialized web searches.
    *   [SerpApi](https://serpapi.com/) for location-based Google search results.
    *   [Merriam-Webster Dictionary API](https://dictionaryapi.com/) for medical definitions.

## API Keys & Environment Variables

To run this project locally, you need to obtain API keys from the following services and add them to a `.env` file in the root of the project.

```env
# Google Gemini API Key for Genkit
GEMINI_API_KEY="your-google-ai-api-key"

# Tavily API Key for grounded drug search
TAVILY_API_KEY="your-tavily-api-key"

# OpenRouter API Key for Llama Vision model
OPENROUTER_API_KEY="your-openrouter-api-key"

# SerpApi Key for finding specialists
SERPAPI_API_KEY="your-serpapi-api-key"

# Merriam-Webster Medical Dictionary API Key
MEDICAL_DICTIONARY_API_KEY="your-dictionary-api-key"
```

# Getting Started: Running Locally

Follow these steps to set up and run the project on your local machine.

# Let's learn how we can integrate authentication and a convex database in our Niramoy

## 🔐 Google Authentication & Convex Database Setup

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

## Now Let's run it locally:

**1. Clone the repository:**
```bash
git clone https://github.com/Mahatir-Ahmed-Tusher/Niramoy.git
cd Niramoy
```

**2. Install dependencies:**
The project uses `npm` for package management.
```bash
npm install
```

**3. Set up environment variables:**
Create a `.env` file in the root directory of the project and add the API keys as described in the section above.
```bash
cp .env.example .env
# Now, open .env and add your API keys
```

**4. Run the development server:**
This command starts the Next.js application.
```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Project File Structure

The project follows a standard Next.js App Router structure, with clear separation of concerns.

```
Niramoy/
├── src/
│   ├── app/                    # Next.js App Router: Pages and layouts
│   │   ├── about/              # About page
│   │   ├── dictionary/         # Medical Dictionary page
│   │   ├── drug-dictionary/    # Drug Dictionary page
│   │   ├── find-doctor/        # Find a Specialist page
│   │   ├── health-ai/          # Health Assistant AI chat page
│   │   ├── report-analyzer/    # Report Analyzer page
│   │   ├── settings/           # Settings page
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page (main chat interface)
│   │
│   ├── ai/
│   │   ├── flows/              # Genkit AI flows for different features
│   │   │   ├── diagnosis-recommendations.ts
│   │   │   ├── drug-information.ts
│   │   │   ├── find-specialist.ts
│   │   │   ├── follow-up.ts
│   │   │   ├── report-analyzer.ts
│   │   │   ├── symptom-analysis.ts
│   │   │   └── translate-text.ts
│   │   └── genkit.ts           # Genkit configuration
│   │
│   ├── components/
│   │   ├── chat/               # Components for the main chat interface
│   │   ├── ui/                 # Reusable UI components from ShadCN
│   │   ├── app-layout.tsx      # Main sidebar and page layout wrapper
│   │   ├── health-animations.tsx # Background animations for landing page
│   │   └── providers.tsx       # Theme and Language providers
│   │
│   ├── contexts/
│   │   └── language-provider.tsx # Manages language state (en/bn)
│   │
│   ├── hooks/
│   │   ├── use-language.ts     # Hook to access language context
│   │   ├── use-mobile.ts       # Hook to detect mobile viewports
│   │   └── use-toast.ts        # Hook for showing notifications
│   │
│   ├── lib/
│   │   ├── actions.ts          # Server Actions for backend communication
│   │   ├── locales/            # JSON files for translation (en/bn)
│   │   ├── schemas.ts          # Zod schemas for data validation
│   │   └── utils.ts            # Utility functions (e.g., cn for Tailwind)
│   │
│   └── services/
│       ├── knowledge-base.ts   # Mock knowledge base for grounding
│       ├── serpapi.ts          # Service for SerpApi integration
│       └── tavily.ts           # Service for Tavily Search API integration
│
├── public/                     # Static assets
├── .env                        # Environment variables (needs to be created)
├── next.config.ts              # Next.js configuration
├── package.json
└── README.md
```

## Disclaimer
Niramoy is an AI-powered assistant and is intended for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment from a qualified doctor. Always seek the advice of a physician or other qualified health provider with any questions you may have regarding a medical condition.

**Developer:** Mahatir Ahmed Tusher
**GitHub Repository:** [https://github.com/Mahatir-Ahmed-Tusher/Niramoy](https://github.com/Mahatir-Ahmed-Tusher/Niramoy)

    
