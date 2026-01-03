# Frontend

A Next.js frontend application for OneChat built with the App Router, Tailwind CSS, and Zustand.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── app/
│   ├── layout.js      # Root layout with Tailwind setup
│   ├── page.js        # Home page
│   └── globals.css    # Global styles with Tailwind directives
├── store/
│   └── useStore.js    # Zustand store
├── tailwind.config.js # Tailwind configuration
├── postcss.config.js  # PostCSS configuration
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## Technologies

- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management

