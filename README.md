# Nians Help Desk - Frontend

A modern, responsive ticket management and customer support portal built with Next.js, HeroUI, and Tailwind CSS.

## Features

- **Customer Portal**: Create support tickets with file attachments, track ticket history, and communicate with support agents.
- **AI Auto-Triage**: Optional AI-assisted categorization and priority assignment toggle during ticket submission.
- **Admin Dashboard**: Filter tickets by status, priority, and category; manage ticket lifecycles and customer inquiries.
- **Analytics Visualizations**: Interactive ticket inflow charts and category distribution breakdown.
- **Modern UI**: Polished interface with HeroUI components and responsive layouts.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- HeroUI
- Lucide React

## Getting Started

### 1. Prerequisites

- Node.js 18+
- Running backend API server

### 2. Installation

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file from the example:

```bash
cp .env.example .env.local
```

Set the backend API endpoint:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 5. Production Build

```bash
npm run build
npm run start
```
