import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export class TikTokService {
  private static readonly API_URL = 'https://open.tiktokapis.com';

  /**
   * Initialize video upload
   */
  static async initializeUpload(
    accessToken: string,
    videoSize: number
  ): Promise<{ upload_url: string; publish_id: string }> {
    try {
      const response = await axios.post(
        `${this.API_URL}/v2/post/publish/inbox/video/init/`,
        {
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: videoSize,
            chunk_size: 10485760, // 10MB chunks
            total_chunk_count: Math.ceil(videoSize / 10485760),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message || 'Failed to initialize upload');
      }

      return {
        upload_url: response.data.data.upload_url,
        publish_id: response.data.data.publish_id,
      };
    } catch (error: any) {
      console.error('TikTok upload init error:', error.response?.data || error.message);
      throw new Error(`Failed to initialize upload: ${error.message}`);
    }
  }

  /**
   * Upload video file
   */
  static async uploadVideo(uploadUrl: string, videoPath: string): Promise<void> {
    try {
      const videoBuffer = fs.readFileSync(videoPath);
      const videoSize = videoBuffer.length;
      const chunkSize = 10485760; // 10MB
      const totalChunks = Math.ceil(videoSize / chunkSize);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, videoSize);
        const chunk = videoBuffer.slice(start, end);

        await axios.put(uploadUrl, chunk, {
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Range': `bytes ${start}-${end - 1}/${videoSize}`,
            'Content-Length': chunk.length,
          },
        });
      }
    } catch (error: any) {
      console.error('TikTok video upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }

  /**
   * Publish video post
   */
  static async publishPost(
    accessToken: string,
    publishId: string,
    content: string,
    options?: {
      privacy_level?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
      disable_comment?: boolean;
      disable_duet?: boolean;
      disable_stitch?: boolean;
      video_cover_timestamp_ms?: number;
    }
  ): Promise<{ id: string; url: string }> {
    try {
      const response = await axios.post(
        `${this.API_URL}/v2/post/publish/video/init/`,
        {
          post_info: {
            title: content.substring(0, 150), // TikTok caption limit
            privacy_level: options?.privacy_level || 'PUBLIC_TO_EVERYONE',
            disable_comment: options?.disable_comment || false,
            disable_duet: options?.disable_duet || false,
            disable_stitch: options?.disable_stitch || false,
            video_cover_timestamp_ms: options?.video_cover_timestamp_ms || 1000,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            publish_id: publishId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message || 'Failed to publish');
      }

      const publishResult = response.data.data;

      // Check publish status
      const status = await this.checkPublishStatus(accessToken, publishResult.publish_id);

      return {
        id: publishResult.publish_id,
        url: status.share_url || `https://www.tiktok.com/@user/video/${publishResult.publish_id}`,
      };
    } catch (error: any) {
      console.error('TikTok publish error:', error.response?.data || error.message);
      throw new Error(
        `Failed to publish to TikTok: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Check publish status
   */
  static async checkPublishStatus(
    accessToken: string,
    publishId: string
  ): Promise<{
    status: string;
    fail_reason?: string;
    publicaly_available_post_id?: string[];
    uploaded_bytes?: number;
    share_url?: string;
  }> {
    try {
      const response = await axios.post(
        `${this.API_URL}/v2/post/publish/status/fetch/`,
        {
          publish_id: publishId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message || 'Failed to check status');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('TikTok status check error:', error.response?.data || error.message);
      throw new Error('Failed to check publish status');
    }
  }

  /**
   * Get user's videos
   */
  static async getUserVideos(
    accessToken: string,
    maxCount: number = 20
  ): Promise<any[]> {
    try {
      const response = await axios.post(
        `${this.API_URL}/v2/video/list/`,
        {
          max_count: maxCount,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message || 'Failed to get videos');
      }

      return response.data.data.videos || [];
    } catch (error: any) {
      console.error('TikTok videos error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Simple publish method for video URL
   * Note: TikTok requires video file upload, not URL
   */
  static async publishFromUrl(
    accessToken: string,
    content: string,
    videoPath: string
  ): Promise<{ id: string; url: string }> {
    try {
      // Get video file size
      const stats = fs.statSync(videoPath);
      const videoSize = stats.size;

      // Initialize upload
      const { upload_url, publish_id } = await this.initializeUpload(accessToken, videoSize);

      // Upload video
      await this.uploadVideo(upload_url, videoPath);

      // Publish post
      const result = await this.publishPost(accessToken, publish_id, content);

      return result;
    } catch (error: any) {
      console.error('TikTok publish from URL error:', error);
      throw error;
    }
  }
}
