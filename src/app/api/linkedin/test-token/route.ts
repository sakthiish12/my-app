import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  // IMPORTANT: This is just for testing - normally you would get this from cookies
  // or a secure database, never hardcode tokens in your code
  const token = "AQXn4iICC51lmO866syo8eNhbG0zsbVZWXY7fRI475gNFkjVpD-4X4RcteLguy6clCQLgJD0Os6tKM1cgncOLdUBZx5zwZQHgvoHf8mS5MNrMGG0kkUqbJj4fZfm6jIeKL6KzkEk8xNM0z77PRc7MzTS4xoTmphD0gNs72NjX6ugijiLuLH5cMb7hHaEybwDLcXlXmy1KdEfMtC4erXxV5okqTTzjTw8dzaslDEhsU0mgyOod7BaH7xhNmqLcIDnKs1N0WQlJ7ZZF_ddGNvet9fFF9qzJUJU_Je2JX_BVJWpwIYnaFv_nbs089QvGGmxNIZr9j_dNbpDhE5pCWy6UiHgxiq-DQ";
  
  try {
    // Test different endpoints to see what works
    const profileData = await fetchLinkedInData(token);
    
    return NextResponse.json({
      success: true,
      message: "LinkedIn data retrieved successfully",
      profileData
    }, {
      headers: {
        // Add Clerk bypass header to avoid authentication issues
        'x-clerk-bypass-middleware': '1'
      }
    });
  } catch (error: any) {
    console.error('LinkedIn API error:', error.response?.data || error.message);
    
    return NextResponse.json({
      success: false,
      message: "Failed to retrieve LinkedIn data",
      error: error.response?.data || error.message
    }, { 
      status: 500,
      headers: {
        'x-clerk-bypass-middleware': '1'
      }
    });
  }
}

async function fetchLinkedInData(token: string) {
  const results: any = {};
  
  try {
    // Basic profile endpoint
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    results.basicProfile = profileResponse.data;
  } catch (e: any) {
    results.basicProfileError = e.response?.data || e.message;
  }
  
  try {
    // Email address
    const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    results.email = emailResponse.data;
  } catch (e: any) {
    results.emailError = e.response?.data || e.message;
  }
  
  try {
    // Profile picture
    const pictureResponse = await axios.get('https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    results.profilePicture = pictureResponse.data;
  } catch (e: any) {
    results.profilePictureError = e.response?.data || e.message;
  }
  
  return results;
} 