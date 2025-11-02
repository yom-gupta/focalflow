# FocalFlow

A modern Next.js application for managing your freelance video editing business. Track projects, manage clients, monitor finances, and achieve your goals—all in one beautiful dashboard.

## Features

- 🎬 **Project Management**: Track video and thumbnail projects with custom workflows
- 👥 **Client Directory**: Manage client relationships with contact info and social links
- 💰 **Financial Tracking**: Monitor income, expenses, and profit with beautiful charts
- 🎯 **Goal Setting**: Set earning goals and track progress with what-if scenarios
- 📊 **Smart Analytics**: Get insights on monthly trends and business growth metrics
- 🔒 **Secure**: Built with Supabase for authentication and database

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with glassmorphism design
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account (free tier works fine)

### Installation

1. **Clone and install dependencies:**

```bash
cd focalflow
npm install
```

2. **Set up Supabase:**

   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API
   - Copy your Project URL and anon/public key
   - Run the SQL schema in your Supabase SQL Editor (see `supabase-schema.sql`)

3. **Configure environment variables:**

   Create a `.env.local` file in the `focalflow` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the development server:**

```bash
npm run dev
```

5. **Open your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Supabase Setup

1. **Create Tables:**

   Copy and paste the contents of `supabase-schema.sql` into your Supabase SQL Editor and run it. This will create:
   - `projects` table
   - `clients` table
   - `expenses` table
   - `goals` table

2. **Configure Authentication:**

   In Supabase Dashboard:
   - Go to Authentication > Settings
   - Enable Email provider (already enabled by default)
   - Configure any additional providers if needed

3. **Set up Row Level Security:**

   The SQL schema includes RLS policies that ensure users can only access their own data. Make sure these policies are created correctly.

## Project Structure

```
focalflow/
├── app/                    # Next.js app router pages
│   ├── dashboard/          # Dashboard page
│   ├── projects/           # Projects page
│   ├── clients/            # Clients page
│   ├── finances/          # Finances page
│   ├── goals/             # Goals page
│   ├── auth/               # Authentication pages
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   ├── dashboard/          # Dashboard-specific components
│   └── layout.tsx           # Main layout with sidebar
├── lib/                    # Utilities and configurations
│   ├── supabase/           # Supabase client and queries
│   └── auth.ts              # Authentication helpers
└── supabase-schema.sql     # Database schema

```

## Features Overview

### Dashboard
- Overview of income, expenses, and profit
- Project completion progress
- Earnings trend chart
- Recent projects list

### Projects
- Create, edit, and delete projects
- Track project status and progress
- Video editing workflow tracker
- Thumbnail design workflow tracker
- Filter by status, type, and time period

### Clients
- Manage client contact information
- Track social media links (YouTube, Instagram)
- View project history per client
- Calculate total revenue per client

### Finances
- Track income from completed projects
- Record and categorize expenses
- View expense breakdown by category
- Calculate net profit
- Filter by time period

### Goals
- Set financial goals with target amounts
- Track progress toward goals
- View current savings
- What-if scenario calculator

## Authentication

The app uses Supabase Authentication. Users can:
- Sign up with email/password
- Sign in to access their dashboard
- All data is isolated per user using Row Level Security

## Styling

The app uses a dark theme with glassmorphism effects:
- Dark background (#0B0B10)
- Glass-like cards with backdrop blur
- Gradient accents (indigo to purple)
- Smooth animations and transitions

## Building for Production

```bash
npm run build
npm start
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

