# Daily Prompt

A simple web application that displays a new AI-generated personal reflection prompt every day.

## Features

- New AI-generated prompt each day using OpenAI's API
- Personal reflection prompts that begin with "Ask your AI about..." or "Have your AI help you explore..."
- Dark/light mode toggle with system preference detection
- Mobile-responsive design
- Copy to clipboard functionality
- Fallback prompts if API call fails
- Local storage caching to minimize API usage

## Screenshot

![Daily Prompt Screenshot](https://via.placeholder.com/800x450.png?text=Daily+Prompt+App)

## Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/daily-prompt.git
   cd daily-prompt
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your OpenAI API key
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   Get an API key at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Deployment

### Deploying to Vercel (Recommended)

1. Push your code to a GitHub repository
2. Visit [Vercel](https://vercel.com) and sign up/login
3. Import your GitHub repository
4. Configure your environment variables (add `OPENAI_API_KEY`)
5. Deploy

### Other Hosting Options

You can also deploy to Netlify, DigitalOcean, or any other hosting service that supports Next.js applications.

## How It Works

- Each day, the application generates a new prompt using OpenAI's API
- The prompt is generated with specific instructions to be personal and reflective
- Prompts are cached in local storage to prevent unnecessary API calls
- If the API call fails, the application falls back to a predefined list of prompts
- The prompt changes at midnight local time

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- OpenAI API

## Credit

Created by [Sakthiish Vijayadass](https://www.linkedin.com/in/sakthiish-vijayadass/)

## License

MIT 