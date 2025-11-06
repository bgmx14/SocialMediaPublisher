import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config';

interface TikTokAuthResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  open_id: string;
}

interface TikTokUserData {
  open_id: string;
  union_id: string;
  avatar_url: string;
  avatar_url_100: string;
  avatar_large_url: string;
  display_name: string;
  bio_description: string;
  profile_deep_link: string;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
}

export class TikTokOAuthService {
  private static readonly AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
  private static readonly TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
  private static readonly API_URL = 'https://open.tiktokapis.com';

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
   * Generate TikTok OAuth URL with PKCE
   */
  static getAuthUrl(
    redirectUri: string,
    state: string,
    codeChallenge: string
  ): string {
    const scopes = [
      'user.info.basic',
      'user.info.profile',
      'user.info.stats',
      'video.upload',
      'video.publish',
      'video.list',
    ].join(',');

    const params = new URLSearchParams({
      client_key: config.tiktok.clientKey,
      scope: scopes,
      response_type: 'code',
      redirect_uri: redirectUri,
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
  ): Promise<TikTokAuthResult> {
    try {
      const response = await axios.post(
        this.TOKEN_URL,
        {
          client_key: config.tiktok.clientKey,
          client_secret: config.tiktok.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error_description || response.data.error);
      }

      return response.data.data;
    } catch (error: any) {
      console.error('TikTok token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange code for access token');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<TikTokAuthResult> {
    try {
      const response = await axios.post(
        this.TOKEN_URL,
        {
          client_key: config.tiktok.clientKey,
          client_secret: config.tiktok.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error_description || response.data.error);
      }

      return response.data.data;
    } catch (error: any) {
      console.error('TikTok token refresh error:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get authenticated user data
   */
  static async getUserData(accessToken: string): Promise<TikTokUserData> {
    try {
      const response = await axios.get(`${this.API_URL}/v2/user/info/`, {
        params: {
          fields: [
            'open_id',
            'union_id',
            'avatar_url',
            'avatar_url_100',
            'avatar_large_url',
            'display_name',
            'bio_description',
            'profile_deep_link',
            'is_verified',
            'follower_count',
            'following_count',
            'likes_count',
            'video_count',
          ].join(','),
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.error) {
        throw new Error(response.data.error.message || 'Failed to get user data');
      }

      return response.data.data.user;
    } catch (error: any) {
      console.error('TikTok user data error:', error.response?.data || error.message);
      throw new Error('Failed to get user data');
    }
  }

  /**
   * Revoke access token
   */
  static async revokeToken(accessToken: string): Promise<void> {
    try {
      await axios.post(
        `${this.API_URL}/v2/oauth/revoke/`,
        {
          client_key: config.tiktok.clientKey,
          client_secret: config.tiktok.clientSecret,
          token: accessToken,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    } catch (error: any) {
      console.error('TikTok token revoke error:', error.response?.data || error.message);
      throw new Error('Failed to revoke access token');
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
