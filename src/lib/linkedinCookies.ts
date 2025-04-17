interface Cookie {
    name: string;
    value: string;
    domain: string;
    path: string;
}

export function extractLinkedInCookies(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('Cookie extraction must be run in browser'));
            return;
        }

        // Open LinkedIn in a new window
        const linkedInWindow = window.open('https://www.linkedin.com', '_blank');
        
        if (!linkedInWindow) {
            reject(new Error('Please allow popups for cookie extraction'));
            return;
        }

        // Check login status every second
        const checkInterval = setInterval(() => {
            try {
                // Try to access the cookies from the LinkedIn window
                if (linkedInWindow.document.cookie.includes('li_at=')) {
                    clearInterval(checkInterval);
                    const cookies = parseCookies(linkedInWindow.document.cookie);
                    linkedInWindow.close();
                    resolve(formatCookiesForApify(cookies));
                }
            } catch (e) {
                // Access denied error means user hasn't logged in yet
                // Continue checking...
            }
        }, 1000);

        // Stop checking after 5 minutes
        setTimeout(() => {
            clearInterval(checkInterval);
            linkedInWindow.close();
            reject(new Error('LinkedIn login timeout - please try again'));
        }, 300000);
    });
}

function parseCookies(cookieString: string): Cookie[] {
    return cookieString.split(';').map(cookie => {
        const [name, value] = cookie.trim().split('=');
        return {
            name,
            value,
            domain: '.linkedin.com',
            path: '/'
        };
    });
}

function formatCookiesForApify(cookies: Cookie[]): string {
    return cookies
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');
}

// Store cookies in localStorage for reuse
export function storeLinkedInCookies(cookies: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('linkedInCookies', cookies);
        localStorage.setItem('linkedInCookiesTimestamp', Date.now().toString());
    }
}

// Get stored cookies if they're less than 24 hours old
export function getStoredLinkedInCookies(): string | null {
    if (typeof window === 'undefined') return null;

    const cookies = localStorage.getItem('linkedInCookies');
    const timestamp = localStorage.getItem('linkedInCookiesTimestamp');

    if (!cookies || !timestamp) return null;

    // Check if cookies are less than 24 hours old
    const age = Date.now() - parseInt(timestamp);
    if (age > 24 * 60 * 60 * 1000) return null;

    return cookies;
} 