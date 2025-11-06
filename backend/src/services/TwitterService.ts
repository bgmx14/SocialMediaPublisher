import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export class TwitterService {
  private static readonly BASE_URL = 'https://api.twitter.com/2';
  private static readonly UPLOAD_URL = 'https://upload.twitter.com/1.1';

  static async publishPost(
    accessToken: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<{ id: string; url: string }> {
    try {
      const tweetData: any = {
        text: content,
      };

      // Note: Twitter API v2 requires OAuth 2.0 and media upload is complex
      // For simplicity, this is a basic implementation
      // In production, you'd need to implement proper OAuth 2.0 flow and media upload

      const response = await axios.post(`${this.BASE_URL}/tweets`, tweetData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const tweetId = response.data.data.id;
      // Note: To get username, you'd need another API call
      return {
        id: tweetId,
        url: `https://twitter.com/i/web/status/${tweetId}`,
      };
    } catch (error: any) {
      console.error('Twitter publish error:', error.response?.data || error.message);
      throw new Error(
        `Failed to publish to Twitter: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  static async getUserInfo(accessToken: string) {
    try {
      const response = await axios.get(`${this.BASE_URL}/users/me`, {
        params: {
          'user.fields': 'id,name,username,profile_image_url,public_metrics',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Twitter user info error:', error.response?.data || error.message);
      throw new Error('Failed to get Twitter user info');
    }
  }

  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }
}
