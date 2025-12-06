# Frontend Application

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp env.local.example.txt .env.local
   ```

3. Update `.env.local` with your API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable components
├── layouts/          # Layout components
├── lib/              # Utilities and API client
├── middleware/       # Route protection middleware
├── providers/        # Context providers
├── store/            # Redux store and slices
├── styles/           # Global styles and themes
└── types/            # TypeScript type definitions
```

## Features

- Next.js 14 with App Router
- TypeScript
- Material-UI (MUI)
- Redux Toolkit for state management
- Protected routes with role-based access
- Responsive design
