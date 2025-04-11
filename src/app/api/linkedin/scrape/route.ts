import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import axios from 'axios';

// TODO: Replace with the actual Phantom ID from your .env.local or directly
const PHANTOM_ID = process.env.PHANTOMBUSTER_PHANTOM_ID || 'YOUR_PHANTOM_ID_HERE'; 
const PHANTOMBUSTER_API_KEY = process.env.PHANTOMBUSTER_API_KEY;

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!PHANTOMBUSTER_API_KEY) {
    console.error('PhantomBuster API key is not configured.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (!PHANTOM_ID || PHANTOM_ID === 'YOUR_PHANTOM_ID_HERE') {
    console.error('PhantomBuster Phantom ID is not configured.');
    return NextResponse.json({ error: 'Server configuration error: Phantom ID missing' }, { status: 500 });
  }

  try {
    // TODO: Get necessary arguments for the Phantom (e.g., LinkedIn session cookie, profile URL)
    // These might come from the request body or be stored securely for the user
    const requestBody = await req.json().catch(() => ({})); // Handle cases with no body
    const { sessionCookie, profileUrl } = requestBody; 

    // Example: Check if required arguments are provided
    if (!sessionCookie || !profileUrl) {
       return NextResponse.json({ error: 'Missing required parameters (e.g., sessionCookie, profileUrl)' }, { status: 400 });
    }

    console.log(`Launching Phantom ${PHANTOM_ID} for user ${userId}`);

    // === PhantomBuster API Interaction ===
    // This is a simplified example. Refer to PhantomBuster documentation for specifics:
    // https://hub.phantombuster.com/reference/launch-agent
    
    // 1. Define the arguments for your specific Phantom
    const phantomArgs = {
      // Example arguments - REPLACE with actual args needed by your Phantom
      sessionCookie: sessionCookie, 
      spreadsheetUrl: profileUrl, // Or profileUrl, depending on the Phantom
      numberOfProfiles: 10, // Example limit
      // ... other arguments specific to your chosen Phantom
    };

    // 2. Launch the Phantom (Agent)
    const launchResponse = await axios.post(
      'https://api.phantombuster.com/api/v2/agents/launch',
      {
        id: PHANTOM_ID,
        argument: JSON.stringify(phantomArgs),
        // You might need webhook configurations, output settings, etc.
      },
      {
        headers: {
          'X-Phantombuster-Key-1': PHANTOMBUSTER_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    // The launch endpoint usually returns the container ID of the running agent.
    // You'll likely need to poll or use webhooks to get the results.
    const containerId = launchResponse.data.containerId;
    console.log(`Phantom launch initiated. Container ID: ${containerId}`);

    // === Important Next Steps ===
    // - Polling/Webhooks: Implement logic to wait for the Phantom to finish and fetch results.
    //   - Fetch Results Endpoint: https://hub.phantombuster.com/reference/get-agent-output
    // - Error Handling: Improve error handling for API calls.
    // - Data Storage: Store the fetched results (e.g., in MongoDB) associated with the user.
    // - Security: Securely handle session cookies.

    // For now, just return the container ID as confirmation
    return NextResponse.json({ message: 'Phantom launch initiated', containerId: containerId }, { status: 202 }); // 202 Accepted

  } catch (error) {
    console.error('Error launching PhantomBuster agent:', error);
    // Check for specific Axios errors
    if (axios.isAxiosError(error) && error.response) {
      console.error('PhantomBuster API Error Response:', error.response.data);
      return NextResponse.json(
        { error: 'Failed to launch PhantomBuster agent', details: error.response.data },
        { status: error.response.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 