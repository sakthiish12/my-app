import { ApifyClient } from 'apify-client';

// Initialize the ApifyClient with API token
const client = new ApifyClient({
    token: process.env.NEXT_PUBLIC_APIFY_API_TOKEN,
});

interface ApifyInput {
    linkedInCookies: string;
    searchUrls: string[];
    minDelay?: number;
    maxDelay?: number;
    proxy?: {
        useApifyProxy: boolean;
        apifyProxyCountry: string;
    };
    findContacts?: boolean;
}

export async function scrapeLinkedInProfile(input: ApifyInput) {
    try {
        // Run the Actor synchronously and get dataset items
        const { items } = await client.actor("PEgClm7RgRD7YO94b").call({
            ...input,
            minDelay: input.minDelay || 15,
            maxDelay: input.maxDelay || 60,
            proxy: input.proxy || {
                useApifyProxy: true,
                apifyProxyCountry: "US"
            },
            findContacts: false
        });

        return {
            success: true,
            data: items
        };
    } catch (error) {
        console.error('Apify scraping error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to scrape LinkedIn profile'
        };
    }
}

export async function scrapeLinkedInFollowers(profileUrl: string) {
    try {
        // Convert profile URL to followers URL
        const followersUrl = `${profileUrl.replace(/\/$/, '')}/detail/contact-info/`;
        
        const result = await scrapeLinkedInProfile({
            linkedInCookies: '',  // Will be added by the component
            searchUrls: [followersUrl],
            minDelay: 30,  // Longer delay for follower pages
            maxDelay: 90
        });

        return result;
    } catch (error) {
        console.error('Followers scraping error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to scrape LinkedIn followers'
        };
    }
} 