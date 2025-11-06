import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config';

interface TwitterAuthResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitterUserData {
  id: string;
  name: string;
  username: string;
}

export class TwitterOAuthService {
  private static readonly AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
  private static readonly TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
  private static readonly API_URL = 'https://api.twitter.com/2';

  /**
   * Generate code verifier and challenge for PKCE
   */
  static generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    return { codeVerifier, codeChallenge };
  }

  /**
   * Generate Twitter OAuth URL with PKCE
   */
  static getAuthUrl(
    redirectUri: string,
    state: string,
    codeChallenge: string
  ): string {
    const scopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.twitter.apiKey,
      redirect_uri: redirectUri,
      scope: scopes,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async getAccessToken(
    code: string,
    redirectUri: string,
    codeVerifier: string
  ): Promise<TwitterAuthResult> {
    try {
      const credentials = Buffer.from(
        `${config.twitter.apiKey}:${config.twitter.apiSecret}`
      ).toString('base64');

      const response = await axios.post(
        this.TOKEN_URL,
        new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: config.twitter.apiKey,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Twitter token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange code for access token');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<TwitterAuthResult> {
    try {
      const credentials = Buffer.from(
        `${config.twitter.apiKey}:${config.twitter.apiSecret}`
      ).toString('base64');

      const response = await axios.post(
        this.TOKEN_URL,
        new URLSearchParams({
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
          client_id: config.twitter.apiKey,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Twitter token refresh error:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get authenticated user data
   */
  static async getUserData(accessToken: string): Promise<TwitterUserData> {
    try {
      const response = await axios.get(`${this.API_URL}/users/me`, {
        params: {
          'user.fields': 'id,name,username',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Twitter user data error:', error.response?.data || error.message);
      throw new Error('Failed to get user data');
    }
  }

  /**
   * Revoke access token
   */
  static async revokeToken(accessToken: string): Promise<void> {
    try {
      const credentials = Buffer.from(
        `${config.twitter.apiKey}:${config.twitter.apiSecret}`
      ).toString('base64');

      await axios.post(
        `${this.TOKEN_URL}/revoke`,
        new URLSearchParams({
          token: accessToken,
          token_type_hint: 'access_token',
          client_id: config.twitter.apiKey,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        }
      );
    } catch (error: any) {
      console.error('Twitter token revoke error:', error.response?.data || error.message);
      throw new Error('Failed to revoke access token');
    }
  }
}
