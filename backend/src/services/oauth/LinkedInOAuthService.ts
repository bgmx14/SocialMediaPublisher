import axios from 'axios';
import { config } from '../config';

interface LinkedInAuthResult {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

interface LinkedInUserData {
  sub: string; // User ID
  name: string;
  email?: string;
  picture?: string;
}

export class LinkedInOAuthService {
  private static readonly AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
  private static readonly TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
  private static readonly API_URL = 'https://api.linkedin.com/v2';
  private static readonly USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';

  /**
   * Generate LinkedIn OAuth URL
   */
  static getAuthUrl(redirectUri: string, state: string): string {
    const scopes = [
      'openid',
      'profile',
      'email',
      'w_member_social', // Post on behalf of member
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.linkedin.clientId,
      redirect_uri: redirectUri,
      state,
      scope: scopes,
    });

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async getAccessToken(
    code: string,
    redirectUri: string
  ): Promise<LinkedInAuthResult> {
    try {
      const response = await axios.post(
        this.TOKEN_URL,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: config.linkedin.clientId,
          client_secret: config.linkedin.clientSecret,
          redirect_uri: redirectUri,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('LinkedIn token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange code for access token');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<LinkedInAuthResult> {
    try {
      const response = await axios.post(
        this.TOKEN_URL,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: config.linkedin.clientId,
          client_secret: config.linkedin.clientSecret,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('LinkedIn token refresh error:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get user profile data
   */
  static async getUserData(accessToken: string): Promise<LinkedInUserData> {
    try {
      const response = await axios.get(this.USERINFO_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('LinkedIn user data error:', error.response?.data || error.message);
      throw new Error('Failed to get user data');
    }
  }

  /**
   * Get user URN (required for posting)
   */
  static async getUserUrn(accessToken: string): Promise<string> {
    try {
      const response = await axios.get(`${this.API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return `urn:li:person:${response.data.id}`;
    } catch (error: any) {
      console.error('LinkedIn URN error:', error.response?.data || error.message);
      throw new Error('Failed to get user URN');
    }
  }

  /**
   * Get user profile details (alternative method)
   */
  static async getUserProfile(accessToken: string) {
    try {
      const response = await axios.get(`${this.API_URL}/me`, {
        params: {
          projection: '(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('LinkedIn profile error:', error.response?.data || error.message);
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Validate access token
   */
  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserData(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }
}
