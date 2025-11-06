import axios from 'axios';

export class LinkedInService {
  private static readonly BASE_URL = 'https://api.linkedin.com/v2';

  static async publishPost(
    accessToken: string,
    personUrn: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<{ id: string; url: string }> {
    try {
      const shareData: any = {
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: mediaUrls && mediaUrls.length > 0 ? 'IMAGE' : 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      // Add media if provided
      if (mediaUrls && mediaUrls.length > 0) {
        shareData.specificContent['com.linkedin.ugc.ShareContent'].media = mediaUrls.map(
          (url) => ({
            status: 'READY',
            description: {
              text: 'Image',
            },
            media: url,
            title: {
              text: 'Shared Image',
            },
          })
        );
      }

      const response = await axios.post(`${this.BASE_URL}/ugcPosts`, shareData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      const postId = response.data.id;
      return {
        id: postId,
        url: `https://www.linkedin.com/feed/update/${postId}/`,
      };
    } catch (error: any) {
      console.error('LinkedIn publish error:', error.response?.data || error.message);
      throw new Error(
        `Failed to publish to LinkedIn: ${error.response?.data?.message || error.message}`
      );
    }
  }

  static async getUserInfo(accessToken: string) {
    try {
      const response = await axios.get(`${this.BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('LinkedIn user info error:', error.response?.data || error.message);
      throw new Error('Failed to get LinkedIn user info');
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
