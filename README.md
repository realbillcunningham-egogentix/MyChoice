# MyChoice.ai — Interactive Prototype

> Mentorship over surveillance. Coaching, not control.

An interactive demo of the **MyChoice.ai** family wellness platform, part of the [EgoGentix](https://egogentix.ai) ecosystem.

## 🚀 Live Demo

**[Launch Prototype →](https://mychoice-mvp.vercel.app)**

## 🏗 Architecture

```
/
├── index.html      # Single-page prototype (7 interactive screens)
├── api/
│   └── chat.js     # Vercel serverless proxy → Anthropic Claude API
├── vercel.json     # Route configuration
├── .env.example    # Environment variable template
└── README.md
```

**How it works:**
- The frontend is a single HTML file — no build step, no framework
- AI Coach chat goes through `/api/chat` (Vercel serverless function)
- The serverless function adds the API key server-side and proxies to Anthropic
- API key lives in Vercel Environment Variables — never in the repo

## 🔧 Setup

### Vercel (Production)
1. Connect this repo to Vercel
2. Add Environment Variable: `ANTHROPIC_API_KEY` = your key
3. Deploy — done!

### Local Development
```bash
npm i -g vercel
cp .env.example .env.local
# Edit .env.local with your actual API key
vercel dev
```

## 📱 Features

- **7-Screen Interactive Demo**: Welcome → Onboarding → Persona Engine → Vibe Dashboard → AI Coach → Family Agreement → Vision/CTA
- **Live AI Coach**: Powered by Claude, adapts to the user's parenting style
- **Persona Engine**: Captures parenting style and tailors the entire experience
- **Family Agreement Builder**: Collaborative rules the whole family designs together
- **Mobile-first**: Responsive design that looks great on any device

## 🔐 Security

- ✅ API key stored server-side in Vercel environment variables
- ✅ No credentials in the codebase
- ✅ No direct browser-to-Anthropic API calls
- ✅ `.gitignore` excludes all env files

## 🏢 About EgoGentix

EgoGentix is building the identity layer for families — permanent, user-owned digital identity that grows with you across every life stage.

**Products:**
- **MyChoice.ai** — Family wellness platform (this prototype)
- **EgoPals** — AI-powered plush companions for children
- **Kids Wellness** — Gamified fitness with DDP Yoga
- **RoadPals** — In-car AI companions (coming soon)

## 📬 Contact

**Bill Cunningham** — Founder & CEO
bill@egogentix.com · [egogentix.ai](https://egogentix.ai)

---

*Character first. Wisdom always.*
