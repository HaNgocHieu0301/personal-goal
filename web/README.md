# Personal Goal - Frontend

This is the Next.js frontend for the Personal Goal.

## 🛠️ Stack

- **Next.js 14+** (App Router)
- **TanStack Query** (Server state management & caching)
- **Zustand** (UI state management)
- **Tailwind CSS v4**
- **Shadcn UI**
- **Axios** (API client)

## 📁 Structure

- `src/app`: Pages and layouts.
- `src/components`: UI components (Shadcn and custom).
- `src/hooks`: Custom hooks for API interaction (use-goals.ts).
- `src/stores`: Zustand stores for UI state.
- `src/types`: TypeScript interfaces.

## 🚀 Development

```bash
npm install
npm run dev
```

The frontend will start on [http://localhost:3000](http://localhost:3000).

## 🌍 Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```
