# SocioPrice

AI-powered pricing intelligence for social media creators. SocioPrice analyzes your audience demographics and engagement metrics to provide personalized pricing recommendations that maximize your revenue.

## Features

- Social media platform integration (LinkedIn)
- AI-powered audience analysis
- Dynamic pricing recommendations
- Real-time market trend analysis
- Integration with popular creator tools

## Project Structure

```
socioprice/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── Sidebar.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── pricingEngine.ts
│   │   └── redis.ts
│   ├── models/
│   │   ├── User.ts
│   │   └── PricingData.ts
│   ├── types/
│   │   ├── global.d.ts
│   │   └── social.ts
│   └── tests/
│       └── api.test.ts
├── public/
│   ├── window.svg
│   ├── globe.svg
│   └── file.svg
└── config files...
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **State Management**: Zustand
- **Form Handling**: React Hook Form, Zod
- **API Integration**: Axios
- **Database**: MongoDB
- **Caching**: Redis

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/socioprice.git
cd socioprice
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Database
MONGODB_URI=your_mongodb_uri

# Redis
REDIS_URL=your_redis_url

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Files

- `.env.local` - Local development
- `.env.production` - Production settings
- `.env.test` - Testing configuration

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository

2. Visit [Vercel](https://vercel.com) and sign up/login

3. Click "Import Project" and select your repository

4. Configure your project:
   - Framework Preset: Next.js
   - Environment Variables: Add all variables from `.env.local`
   - Build Command: `next build`
   - Output Directory: `.next`

5. Click "Deploy"

### Manual Deployment

1. Build the project:
```bash
npm run build
# or
yarn build
```

2. Start the production server:
```bash
npm start
# or
yarn start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@socioprice.com
