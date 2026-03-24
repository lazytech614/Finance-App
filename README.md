# 💰 AI Finance Management App

A full-stack AI-powered personal finance management application built with **Next.js 16**, featuring smart budget tracking, transaction management, and AI-driven financial insights.

🔗 **Live Demo:** [finance-app-teal-beta.vercel.app](https://finance-app-teal-beta.vercel.app)

---

## 🚀 Features

- 🔐 **Authentication** — Secure sign-in/sign-up with [Clerk](https://clerk.com/)
- 📊 **Dashboard** — Visual overview of income, expenses, and budgets using interactive charts
- 💳 **Transaction Management** — Add, edit, and categorize financial transactions
- 🤖 **AI Insights** — Gemini AI-powered financial analysis and recommendations
- 📧 **Email Notifications** — Automated budget alerts and reports via [Resend](https://resend.com/) + React Email
- 🔁 **Background Jobs** — Scheduled tasks powered by [Inngest](https://www.inngest.com/)
- 🛡️ **Rate Limiting & Security** — Bot protection via [Arcjet](https://arcjet.com/)
- 🌙 **Dark Mode** — Theme switching with `next-themes`
- 📱 **Responsive Design** — Mobile-first UI with Tailwind CSS v4 & shadcn/ui

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Auth | Clerk |
| Database | PostgreSQL + Prisma ORM |
| AI | Google Gemini AI (`@google/genai`) |
| Background Jobs | Inngest |
| Email | Resend + React Email |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Security | Arcjet |
| Deployment | Vercel |

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Accounts for: Clerk, Resend, Inngest, Arcjet, Google AI Studio

### 1. Clone the Repository
```bash
git clone https://github.com/lazytech614/Finance-App.git
cd Finance-App
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add the following:
```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key

# Inngest (Background Jobs)
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Arcjet (Security)
ARCJET_KEY=your_arcjet_key
```

### 4. Set Up the Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure
```
Finance-App/
├── app/              # Next.js App Router pages & API routes
├── actions/          # Server actions
├── components/       # Reusable UI components
├── data/             # Static data & seed files
├── emails/           # React Email templates
├── hooks/            # Custom React hooks
├── lib/              # Utility functions & configs
├── prisma/           # Prisma schema & migrations
└── public/           # Static assets
```

---

## 📧 Email Development

To preview email templates locally:
```bash
npm run email:dev
```

---

## 🚀 Deployment

This app is optimized for deployment on **Vercel**.

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Deploy!

> ⚠️ Make sure to set `INNGEST_SIGNING_KEY` in your Vercel environment variables and **redeploy** after adding it to avoid SDK signing errors.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👤 Author

**lazytech614**
- GitHub: [@lazytech614](https://github.com/lazytech614)