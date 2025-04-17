import NextAuth from 'next-auth';
import LinkedInProvider from 'next-auth/providers/linkedin';

/**
 * NextAuth configuration for LinkedIn authentication
 */
const handler = NextAuth({
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
      callbackUrl: process.env.LINKEDIN_CALLBACK_URL,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Log the authentication process
      console.log('NextAuth JWT callback', { 
        hasToken: !!token,
        hasAccount: !!account,
        hasProfile: !!profile,
        provider: account?.provider
      });

      // Persist the LinkedIn access token to the token
      if (account && account.provider === 'linkedin') {
        token.accessToken = account.access_token;
        token.provider = 'linkedin';

        // Log the linkedin token (partially redacted)
        if (account.access_token) {
          const tokenPreview = account.access_token.substring(0, 10) + '...';
          console.log('LinkedIn token received:', tokenPreview);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add the access token and provider to the session
      // TypeScript workaround since we're extending the session
      (session as any).accessToken = token.accessToken;
      (session as any).provider = token.provider;
      
      console.log('NextAuth session callback', { 
        hasSession: !!session,
        hasUser: !!session.user,
        provider: token.provider
      });
      
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in?error=AuthError',
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST }; 