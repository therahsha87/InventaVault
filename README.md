# 🔐 InventaVault

InventaVault is a next-generation patent protection platform that leverages AI to streamline patent submissions, enhance prior art research, and provide blockchain-based transaction recording. Built for inventors, legal professionals, and enterprises, InventaVault offers real-time collaboration, comprehensive portfolio management, and intelligent automation.

---

✨ Features

Core Functionality
- **🤖 AI-Powered Patent Assistance**: Streamline patent submissions with intelligent automation
- **🔍 Advanced Prior Art Research**: Enhanced search capabilities using AI-driven analysis
- **📊 Patent Portfolio Management**: Comprehensive dashboard for tracking and managing patents
- **🌐 Real-Time Collaboration**: Built-in messaging and collaboration tools via XMTP
- **⛓️ Blockchain Transaction Recording**: Immutable records of patent-related transactions
- **💳 Multi-Tier Subscriptions**: Flexible pricing with Starter, Professional, and Enterprise plans

Premium Features
- **AI Patent Analysis**: Advanced AI integrations for patent evaluation
- **Blockchain Integration**: Secure, decentralized transaction records
- **Priority Support**: Dedicated assistance for premium users
- **Portfolio Analytics**: Advanced insights and reporting
- **Team Collaboration**: Multi-user workspace management

User Experience
- **🎨 Modern UI/UX**: Professional dark mode interface with light/dark toggle
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🔒 Secure Authentication**: Enterprise-grade security for sensitive IP data
- **⚡ Real-Time Sync**: Powered by SpacetimeDB for instant data updates

---

🛠️ Technology Stack

Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality component library
- **OnchainKit**: Blockchain integration tools

Backend & Database
- SpacetimeDB: Real-time database with built-in networking
- Next.js API Routes**: RESTful endpoints

Integrations
- Stripe: Payment processing and subscription management
- XMTP: Decentralized messaging for real-time collaboration
- Firecrawl: Web scraping for patent research
- Perplexity AI: Advanced AI-powered search
- Exa API: Enhanced search capabilities
- TalentProtocol: Identity and reputation management

Infrastructure
- Vercel: Deployment and hosting
- Farcaster: Mini-app integration for decentralized social

---

🚀 Getting Started

Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Stripe account (for payment processing)
- API keys for integrations (Firecrawl, Perplexity, Exa, etc.)

Installation

1. Clone the repository (if applicable) or access via Ohara platform

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file (or configure in Vercel) with the following:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Subscription Price IDs
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PROFESSIONAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# API Integrations
FIRECRAWL_API_KEY=your_firecrawl_key
PERPLEXITY_API_KEY=your_perplexity_key
EXA_API_KEY=your_exa_key
TALENTPROTOCOL_API_KEY=your_talent_protocol_key

# XMTP Configuration
XMTP_ENV=production

# SpacetimeDB
SPACETIMEDB_URI=your_spacetime_uri

# Optional: OnchainKit
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open your browser and navigate to `http://localhost:3000`

---

## 📦 Project Structure

```
inventavault/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API routes
│   │   │   ├── health/               # Health check endpoint
│   │   │   ├── logger/               # Logging endpoint
│   │   │   ├── proxy/                # API proxy for external calls
│   │   │   └── stripe/               # Stripe integration endpoints
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Main application page
│   │   └── globals.css               # Global styles
│   │
│   ├── components/
│   │   ├── patent/                   # Patent-specific components
│   │   │   ├── patent-submission.tsx
│   │   │   ├── patent-portfolio.tsx
│   │   │   ├── collaboration-hub.tsx
│   │   │   └── blockchain-recorder.tsx
│   │   ├── ui/                       # shadcn/ui components (50+)
│   │   ├── subscription-tiers.tsx
│   │   ├── premium-features.tsx
│   │   ├── theme-toggle.tsx
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── api/                      # API integration utilities
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── utils.ts                  # Utility functions
│   │   └── stripe.ts                 # Stripe configuration
│   │
│   ├── spacetime_module_bindings/    # Auto-generated SpacetimeDB bindings
│   └── middleware.ts                 # Next.js middleware
│
├── spacetime-server/
│   └── src/
│       └── lib.rs                    # SpacetimeDB Rust module
│
├── public/
│   ├── .well-known/
│   │   └── farcaster.json           # Farcaster mini-app config
│   └── ...                          # Static assets
│
├── LICENSE                           # MIT License
├── README.md                         # This file
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
└── tailwind.config.ts               # Tailwind CSS configuration
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Via Ohara Platform:
   - Click the "Publish" button in Ohara
   - Your app is automatically deployed to Vercel
   - Access deployment URL in Configure → Settings

2. Via Vercel CLI:
```bash
npm install -g vercel
vercel login
vercel
```

3. Via Vercel Dashboard:
   - Visit [vercel.com](https://vercel.com)
   - Import your Git repository
   - Configure environment variables
   - Deploy automatically on push

### Post-Deployment Configuration

Stripe Webhooks
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

Environment Variables
Ensure all environment variables are configured in Vercel:
- Project Settings → Environment Variables
- Add all keys from `.env.local`
- Redeploy if needed

---

💳 Stripe Subscription Tiers

Starter Plan
- Basic patent submission tools
- Limited prior art searches
- Standard support
- Price: $29/month

Professional Plan
- AI-powered patent analysis
- Unlimited prior art research
- Real-time collaboration
- Priority support
- Price: $99/month

Enterprise Plan
- All Professional features
- Blockchain transaction recording
- Advanced portfolio analytics
- Team collaboration tools
- Dedicated account manager
- Price: $299/month

Configure pricing in Stripe Dashboard and update price IDs in environment variables.

---

🔧 API Integrations

Firecrawl
Used for web scraping and patent research data extraction.
- Get API key: [firecrawl.dev](https://firecrawl.dev)

Perplexity AI
Powers advanced AI-driven patent analysis and search.
- Get API key: [perplexity.ai](https://www.perplexity.ai)

Exa API
Enhances search capabilities for prior art research.
- Get API key: [exa.ai](https://exa.ai)

TalentProtocol
Provides identity and reputation management.
- Get API key: [talentprotocol.com](https://talentprotocol.com)

XMTP
Enables decentralized, encrypted messaging for collaboration.
- No API key required (uses client-side integration)

---

🗄️ SpacetimeDB

InventaVault uses SpacetimeDB for real-time data synchronization and collaboration features.

Key Features
- Real-time patent portfolio updates
- Live collaboration sessions
- Instant notification delivery
- Automatic conflict resolution

Database Schema
Defined in `spacetime-server/src/lib.rs` with tables for:
- Patents
- Users
- Collaboration sessions
- Blockchain records
- Notifications

Client bindings are auto-generated in `src/spacetime_module_bindings/`.

---

## 🤝 Contributing

We welcome contributions to InventaVault! Here's how you can help:

1. Report Bugs: Open an issue with detailed reproduction steps
2. Suggest Features: Share ideas for new capabilities
3. Submit Pull Requests: Contribute code improvements
4. Improve Documentation: Help make our docs better

### Development Guidelines
- Follow TypeScript best practices
- Maintain type safety (no implicit `any`)
- Write clean, documented code
- Test thoroughly before submitting
- Follow existing code style and structure

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

Documentation
- View code and configuration in Ohara's Configure tab
- Access deployment settings in **Configure → Settings

Issues & Questions
- Check existing documentation
- Review code in the file editor
- Contact support for deployment or technical issues

Professional Support
Enterprise users receive dedicated support. Contact your account manager or upgrade to Enterprise tier for priority assistance.

---

## 🎯 Roadmap

Upcoming Features
- [ ] Advanced AI patent claim generation
- [ ] International patent filing support
- [ ] Patent valuation tools
- [ ] Automated office action responses
- [ ] Integration with USPTO and EPO databases
- [ ] Mobile apps (iOS & Android)
- [ ] API access for developers

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org) - The React Framework
- [SpacetimeDB](https://spacetimedb.com) - Real-time database platform
- [Stripe](https://stripe.com) - Payment processing
- [shadcn/ui](https://ui.shadcn.com) - Component library
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [XMTP](https://xmtp.org) - Decentralized messaging

---

## 📞 Contact

For enterprise inquiries, partnerships, or custom solutions, please reach out through the platform or visit our website.

---

**InventaVault** - Protecting Innovation, One Patent at a Time 🚀
