import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { config } from '../config';

export class InstagramService {
  private static readonly API_VERSION = 'v18.0';
  private static readonly BASE_URL = `https://graph.facebook.com/${this.API_VERSION}`;

  static async publishPost(
    accessToken: string,
    accountId: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<{ id: string; url: string }> {
    try {
      // Instagram Graph API requires media to be uploaded first
      let mediaId: string | undefined;

      if (mediaUrls && mediaUrls.length > 0) {
        // Upload media and get container ID
        const containerResponse = await axios.post(
          `${this.BASE_URL}/${accountId}/media`,
          {
            image_url: mediaUrls[0], // Instagram Business API works with URLs
            caption: content,
            access_token: accessToken,
          }
        );

        mediaId = containerResponse.data.id;

        // Publish the container
        const publishResponse = await axios.post(
          `${this.BASE_URL}/${accountId}/media_publish`,
          {
            creation_id: mediaId,
            access_token: accessToken,
          }
        );

        const postId = publishResponse.data.id;
        return {
          id: postId,
          url: `https://www.instagram.com/p/${postId}/`,
        };
      } else {
        // Text-only posts are not supported on Instagram
        throw new Error('Instagram requires at least one image or video');
      }
    } catch (error: any) {
      console.error('Instagram publish error:', error.response?.data || error.message);
      throw new Error(
        `Failed to publish to Instagram: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  static async getAccountInfo(accessToken: string, accountId: string) {
    try {
      const response = await axios.get(`${this.BASE_URL}/${accountId}`, {
        params: {
          fields: 'id,username,name,profile_picture_url,followers_count,media_count',
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Instagram account info error:', error.response?.data || error.message);
      throw new Error('Failed to get Instagram account info');
    }
  }

  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      await axios.get(`${this.BASE_URL}/me`, {
        params: {
          access_token: accessToken,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
