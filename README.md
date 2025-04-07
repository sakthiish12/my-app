# PeakPrice - Social Media Audience Analytics for Optimal Pricing

PeakPrice helps social media influencers understand their followers' demographics to price their digital products optimally for maximum conversion rates.

## Key Features

- **Social Media Integration**: Connect personal profiles from LinkedIn, Instagram, Facebook, TikTok, Pinterest, and Threads
- **Demographics Analysis**: Get detailed insights into your audience's age, location, interests, and more
- **Platform Comparison**: Compare audience demographics across different social platforms
- **Pricing Recommendations**: Receive AI-powered pricing suggestions for your digital products based on audience data
- **Segment-Based Pricing**: Create targeted pricing strategies for different audience segments

## Technical Architecture

### Frontend

- Next.js 14 with App Router
- React components with TypeScript
- Tailwind CSS for styling
- Clerk for authentication

### Backend

- Next.js API routes
- MongoDB with Mongoose for data storage
- OAuth 2.0 integration with social platforms

### Data Processing

- Custom engagement analysis algorithms
- Demographic inference from engagement patterns
- AI-powered pricing recommendation engine

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- MongoDB database
- Social platform developer accounts (for API access)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/peakprice.git
   cd peakprice
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string
   
   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Social API Credentials (for testing)
   NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your_instagram_client_id
   INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
   
   NEXT_PUBLIC_FACEBOOK_CLIENT_ID=your_facebook_client_id
   FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
   
   NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   
   NEXT_PUBLIC_TIKTOK_CLIENT_ID=your_tiktok_client_id
   TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
   
   NEXT_PUBLIC_PINTEREST_CLIENT_ID=your_pinterest_client_id
   PINTEREST_CLIENT_SECRET=your_pinterest_client_secret
   
   # Base URL for callbacks
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Social Media Integration

### Supported Platforms

- **Instagram**: Personal profile analytics through the Instagram Basic Display API
- **Facebook**: Personal profile engagement analysis through the Graph API
- **LinkedIn**: Personal profile connection analysis
- **TikTok**: Personal profile engagement metrics through the TikTok API
- **Pinterest**: Personal account board and pin analytics
- **Threads**: Integration via Instagram connection

### Demographic Data Collection

For personal profiles, direct demographic data is limited by platform restrictions. PeakPrice uses sophisticated algorithms to infer demographic information:

- **Time-based Analysis**: Analyzes engagement timing to infer geographic distribution
- **Content Analysis**: Examines captions, hashtags, and post content to infer interests
- **Engagement Pattern Analysis**: Identifies demographic signals from engagement behaviors
- **Third-Party Data Enrichment**: Optional integration with services like Phyllo

## Pricing Algorithm

Our pricing recommendation engine uses a combination of:

1. **Demographic Analysis**: Understanding who your audience is
2. **Product Type Benchmarks**: Industry standards for different product types
3. **Segment Identification**: Creating optimal pricing tiers for different audience segments
4. **Conversion Modeling**: Predicting conversion rates at different price points

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the social media platforms for providing APIs that enable this integration
- Special thanks to all the open source libraries that make this project possible
