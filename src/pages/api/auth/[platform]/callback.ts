import { NextApiRequest, NextApiResponse } from 'next';
import AuthService from '../../../../services/AuthService';
import FollowerDataService from '../../../../services/FollowerDataService';
import EngagementAnalyzer from '../../../../utils/EngagementAnalyzer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { platform } = req.query;
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/dashboard?error=${error}`);
  }

  if (!code || !state || !platform || Array.isArray(platform)) {
    return res.redirect('/dashboard?error=invalid_request');
  }

  try {
    // Retrieve stored credentials from session
    const credentials = req.cookies[`${platform}_credentials`];
    if (!credentials) {
      return res.redirect('/dashboard?error=missing_credentials');
    }

    const { clientId, clientSecret } = JSON.parse(credentials);

    // Validate state parameter to prevent CSRF
    if (!AuthService.validateState(state as string, platform)) {
      return res.redirect('/dashboard?error=invalid_state');
    }

    // Exchange code for access token
    const tokenData = await AuthService.getAccessToken(
      platform,
      code as string,
      {
        clientId,
        clientSecret,
        redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/${platform}/callback`
      }
    );

    const accessToken = tokenData.access_token;

    // Get follower demographic data using our workarounds
    let demographicData = {};
    
    switch (platform) {
      case 'instagram':
        const instagramData = await FollowerDataService.getInstagramData(accessToken);
        
        // Use engagement analyzer to infer demographics from engagement patterns
        if (instagramData.rawData?.media?.data) {
          const inferredData = EngagementAnalyzer.analyzeInstagramEngagement(
            instagramData.rawData.media.data
          );
          demographicData = { ...instagramData, ...inferredData };
        } else {
          demographicData = instagramData;
        }
        break;
        
      case 'facebook':
        const facebookData = await FollowerDataService.getFacebookData(accessToken);
        
        // Use engagement analyzer to infer demographics from post engagement
        if (facebookData.rawData?.posts?.data) {
          const inferredData = EngagementAnalyzer.analyzeFacebookEngagement(
            facebookData.rawData.posts.data
          );
          demographicData = { ...facebookData, ...inferredData };
        } else {
          demographicData = facebookData;
        }
        break;
        
      case 'linkedin':
        const linkedinData = await FollowerDataService.getLinkedInData(accessToken);
        
        // Use engagement analyzer to infer demographics from profile and posts
        const inferredData = EngagementAnalyzer.analyzeLinkedInEngagement(
          linkedinData.rawData?.posts?.data || [],
          linkedinData.rawData?.profile
        );
        demographicData = { ...linkedinData, ...inferredData };
        break;
        
      case 'tiktok':
        const tiktokData = await FollowerDataService.getTikTokData(accessToken);
        
        // Use engagement analyzer to infer demographics from video engagement
        if (tiktokData.rawData?.videos?.data) {
          const inferredData = EngagementAnalyzer.analyzeTikTokEngagement(
            tiktokData.rawData.videos.data
          );
          demographicData = { ...tiktokData, ...inferredData };
        } else {
          demographicData = tiktokData;
        }
        break;
        
      case 'pinterest':
        demographicData = await FollowerDataService.getPinterestData(accessToken);
        break;
        
      case 'threads':
        demographicData = await FollowerDataService.getThreadsData(accessToken);
        break;
        
      default:
        return res.redirect(`/dashboard?error=unsupported_platform`);
    }

    // Store the demographic data in the user's session or database
    // (Implementation depends on your session/database solution)
    
    // For this example, we'll store the data in a cookie
    res.setHeader('Set-Cookie', `${platform}_data=${JSON.stringify(demographicData)}; Path=/; HttpOnly; SameSite=Strict`);
    
    // Redirect to dashboard with success parameter
    return res.redirect(`/dashboard?${platform}=connected`);
  } catch (error) {
    console.error(`Error in ${platform} callback:`, error);
    return res.redirect(`/dashboard?error=${error}`);
  }
} 