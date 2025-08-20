# axoncore.ai

The Future of AI Starts Here - Your intelligent platform for AI-powered conversations, multiple specialized assistants, and seamless productivity.

## Features

- 🤖 **AI-Powered Conversations** - Engage with intelligent AI assistants that understand context
- 🔄 **Multi-Assistant Support** - Choose from specialized AI assistants for different tasks
- ⚡ **Real-time Processing** - Lightning-fast responses powered by advanced AI models
- 🔒 **Enterprise Security** - Bank-level security with encrypted data and privacy protection
- 💳 **Simple Pricing** - $10/month plan with 100,000 tokens for unlimited AI assistance
- 💰 **Cost-Effective Models** - DeepSeek models offer the lowest cost per token
- 👥 **Team Collaboration** - Share conversations and collaborate seamlessly

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB Atlas
- **Payment**: Razorpay
- **AI**: OpenRouter API (Multiple AI Models)
- **Deployment**: Vercel

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Razorpay (Required for Pro plan payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_LIVE_KEY=your_razorpay_live_key
RAZORPAY_PLAN_ID=your_razorpay_plan_id

# OpenRouter (Required for AI models)
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 🔑 Getting API Keys

1. **MongoDB**: Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Google OAuth**: Set up OAuth 2.0 at [Google Cloud Console](https://console.cloud.google.com/)
3. **Razorpay**: Sign up at [Razorpay](https://razorpay.com/) and create a plan
4. **OpenRouter**: Get API key from [OpenRouter](https://openrouter.ai/)

### ⚠️ Important Notes

- All variables marked with `(Required)` are necessary for the application to function
- The `RAZORPAY_PLAN_ID` must be created in your Razorpay dashboard
- Use test keys for development and live keys for production

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [MongoDB Documentation](https://docs.mongodb.com)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Razorpay Documentation](https://razorpay.com/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

## License

© 2024 axoncore.ai. All rights reserved.
