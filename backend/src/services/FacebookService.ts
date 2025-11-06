import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export class FacebookService {
  private static readonly API_VERSION = 'v18.0';
  private static readonly BASE_URL = `https://graph.facebook.com/${this.API_VERSION}`;

  static async publishPost(
    accessToken: string,
    pageId: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<{ id: string; url: string }> {
    try {
      const postData: any = {
        message: content,
        access_token: accessToken,
      };

      // Add media if provided
      if (mediaUrls && mediaUrls.length > 0) {
        if (mediaUrls.length === 1) {
          // Single image/video
          const mediaUrl = mediaUrls[0];
          if (mediaUrl.match(/\.(mp4|mov|avi)$/i)) {
            postData.file_url = mediaUrl;
            // Use video endpoint
            const response = await axios.post(`${this.BASE_URL}/${pageId}/videos`, postData);
            return {
              id: response.data.id,
              url: `https://facebook.com/${response.data.id}`,
            };
          } else {
            postData.url = mediaUrl;
            const response = await axios.post(`${this.BASE_URL}/${pageId}/photos`, postData);
            return {
              id: response.data.id,
              url: `https://facebook.com/${response.data.id}`,
            };
          }
        } else {
          // Multiple images - not directly supported in simple mode
          // For simplicity, post first image only
          postData.url = mediaUrls[0];
          const response = await axios.post(`${this.BASE_URL}/${pageId}/photos`, postData);
          return {
            id: response.data.id,
            url: `https://facebook.com/${response.data.id}`,
          };
        }
      } else {
        // Text-only post
        const response = await axios.post(`${this.BASE_URL}/${pageId}/feed`, postData);
        return {
          id: response.data.id,
          url: `https://facebook.com/${response.data.id}`,
        };
      }
    } catch (error: any) {
      console.error('Facebook publish error:', error.response?.data || error.message);
      throw new Error(
        `Failed to publish to Facebook: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  static async getPageInfo(accessToken: string, pageId: string) {
    try {
      const response = await axios.get(`${this.BASE_URL}/${pageId}`, {
        params: {
          fields: 'id,name,username,picture,fan_count,category',
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Facebook page info error:', error.response?.data || error.message);
      throw new Error('Failed to get Facebook page info');
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
