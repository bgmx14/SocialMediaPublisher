import axios from 'axios';
import { config } from '../config';

interface FacebookAuthResult {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface FacebookUserData {
  id: string;
  name: string;
  email?: string;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

interface InstagramAccount {
  id: string;
  username: string;
}

export class FacebookOAuthService {
  private static readonly API_VERSION = 'v18.0';
  private static readonly BASE_URL = `https://graph.facebook.com/${this.API_VERSION}`;
  private static readonly AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';

  /**
   * Generate Facebook OAuth URL
   */
  static getAuthUrl(redirectUri: string, state: string): string {
    const scopes = [
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_show_list',
      'instagram_basic',
      'instagram_content_publish',
      'business_management',
    ].join(',');

    const params = new URLSearchParams({
      client_id: config.facebook.appId,
      redirect_uri: redirectUri,
      state,
      scope: scopes,
      response_type: 'code',
    });

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async getAccessToken(code: string, redirectUri: string): Promise<FacebookAuthResult> {
    try {
      const response = await axios.get(`${this.BASE_URL}/oauth/access_token`, {
        params: {
          client_id: config.facebook.appId,
          client_secret: config.facebook.appSecret,
          redirect_uri: redirectUri,
          code,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Facebook token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange code for access token');
    }
  }

  /**
   * Get long-lived access token (60 days)
   */
  static async getLongLivedToken(shortLivedToken: string): Promise<FacebookAuthResult> {
    try {
      const response = await axios.get(`${this.BASE_URL}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: config.facebook.appId,
          client_secret: config.facebook.appSecret,
          fb_exchange_token: shortLivedToken,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Facebook long-lived token error:', error.response?.data || error.message);
      throw new Error('Failed to get long-lived token');
    }
  }

  /**
   * Get user data
   */
  static async getUserData(accessToken: string): Promise<FacebookUserData> {
    try {
      const response = await axios.get(`${this.BASE_URL}/me`, {
        params: {
          fields: 'id,name,email',
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Facebook user data error:', error.response?.data || error.message);
      throw new Error('Failed to get user data');
    }
  }

  /**
   * Get user's Facebook Pages
   */
  static async getUserPages(accessToken: string): Promise<FacebookPage[]> {
    try {
      const response = await axios.get(`${this.BASE_URL}/me/accounts`, {
        params: {
          access_token: accessToken,
        },
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error('Facebook pages error:', error.response?.data || error.message);
      throw new Error('Failed to get Facebook pages');
    }
  }

  /**
   * Get Instagram Business accounts connected to Facebook Page
   */
  static async getInstagramAccounts(pageId: string, pageAccessToken: string): Promise<InstagramAccount[]> {
    try {
      const response = await axios.get(`${this.BASE_URL}/${pageId}`, {
        params: {
          fields: 'instagram_business_account',
          access_token: pageAccessToken,
        },
      });

      if (!response.data.instagram_business_account) {
        return [];
      }

      const igAccountId = response.data.instagram_business_account.id;

      // Get Instagram account details
      const igResponse = await axios.get(`${this.BASE_URL}/${igAccountId}`, {
        params: {
          fields: 'id,username',
          access_token: pageAccessToken,
        },
      });

      return [igResponse.data];
    } catch (error: any) {
      console.error('Instagram accounts error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<FacebookAuthResult> {
    // Note: Facebook doesn't have refresh tokens in the traditional sense
    // Long-lived tokens (60 days) should be exchanged before expiry
    throw new Error('Facebook uses long-lived tokens. Exchange before expiry.');
  }
}
