# Quotly Mobile

Quotly Mobile is a Next.js app for collecting consignment submissions and reviewing pending quotes.

## What it does

- Customer intake flow for submitting item details and an image
- Specialist view for reviewing active submissions and generating quotes
- Supabase-backed image upload endpoint

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local env file from the example below and fill in the values.

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

## Environment Variables

Create a `.env.local` file with these values:

- `NEXT_PUBLIC_API_BASE`
- `NEXT_PUBLIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - create a production build
- `npm run start` - start the production server
- `npm run lint` - run ESLint

## Project Structure

- `app/` - application routes and API endpoints
- `components/` - UI components
- `lib/` - utility and Supabase helpers
