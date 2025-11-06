import { InstagramService } from './InstagramService';
import { FacebookService } from './FacebookService';
import { TwitterService } from './TwitterService';
import { LinkedInService } from './LinkedInService';
import { TikTokService } from './TikTokService';
import { AccountModel } from '../models/AccountModel';
import { PostModel } from '../models/PostModel';
import { PublicationHistoryModel } from '../models/MediaModel';
import { SocialPlatform } from '../types';

export class PublisherService {
  static async publishToAllPlatforms(postId: number): Promise<{
    success: boolean;
    results: Array<{ platform: string; success: boolean; error?: string }>;
  }> {
    const post = PostModel.getById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const platforms = post.platforms ? JSON.parse(post.platforms) : [];
    const accountIds = post.account_ids ? JSON.parse(post.account_ids) : [];

    if (platforms.length === 0 || accountIds.length === 0) {
      throw new Error('No platforms or accounts specified');
    }

    const results: Array<{ platform: string; success: boolean; error?: string }> = [];
    let allSuccess = true;

    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i] as SocialPlatform;
      const accountId = accountIds[i];

      try {
        const account = AccountModel.getById(accountId);
        if (!account) {
          throw new Error('Account not found');
        }

        const mediaUrls = post.media_urls ? JSON.parse(post.media_urls) : undefined;

        let result;
        switch (platform) {
          case 'instagram':
            result = await InstagramService.publishPost(
              account.access_token,
              account.account_id,
              post.content,
              mediaUrls
            );
            break;

          case 'facebook':
            result = await FacebookService.publishPost(
              account.access_token,
              account.account_id,
              post.content,
              mediaUrls
            );
            break;

          case 'twitter':
            result = await TwitterService.publishPost(
              account.access_token,
              post.content,
              mediaUrls
            );
            break;

          case 'linkedin':
            result = await LinkedInService.publishPost(
              account.access_token,
              account.account_id,
              post.content,
              mediaUrls
            );
            break;

          case 'tiktok':
            // TikTok requires video file, not URL
            // For now, skip if no video or use first media URL
            if (!mediaUrls || mediaUrls.length === 0) {
              throw new Error('TikTok requires a video file');
            }
            result = await TikTokService.publishFromUrl(
              account.access_token,
              post.content,
              mediaUrls[0] // Assuming local file path
            );
            break;

          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }

        // Log success in publication history
        PublicationHistoryModel.create({
          post_id: postId,
          account_id: accountId,
          platform,
          status: 'published',
          platform_post_id: result.id,
          platform_url: result.url,
        });

        results.push({ platform, success: true });
      } catch (error: any) {
        console.error(`Failed to publish to ${platform}:`, error.message);

        // Log failure in publication history
        PublicationHistoryModel.create({
          post_id: postId,
          account_id: accountId,
          platform,
          status: 'failed',
          error_message: error.message,
        });

        results.push({ platform, success: false, error: error.message });
        allSuccess = false;
      }
    }

    // Update post status
    if (allSuccess) {
      PostModel.updateStatus(postId, 'published');
    } else {
      const hasAnySuccess = results.some((r) => r.success);
      PostModel.updateStatus(
        postId,
        hasAnySuccess ? 'published' : 'failed',
        allSuccess ? undefined : 'Some platforms failed'
      );
    }

    return {
      success: allSuccess,
      results,
    };
  }

  static async publishSinglePlatform(
    postId: number,
    platform: SocialPlatform,
    accountId: number
  ): Promise<{ success: boolean; error?: string; url?: string }> {
    const post = PostModel.getById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const account = AccountModel.getById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const mediaUrls = post.media_urls ? JSON.parse(post.media_urls) : undefined;

    try {
      let result;
      switch (platform) {
        case 'instagram':
          result = await InstagramService.publishPost(
            account.access_token,
            account.account_id,
            post.content,
            mediaUrls
          );
          break;

        case 'facebook':
          result = await FacebookService.publishPost(
            account.access_token,
            account.account_id,
            post.content,
            mediaUrls
          );
          break;

        case 'twitter':
          result = await TwitterService.publishPost(account.access_token, post.content, mediaUrls);
          break;

        case 'linkedin':
          result = await LinkedInService.publishPost(
            account.access_token,
            account.account_id,
            post.content,
            mediaUrls
          );
          break;

        case 'tiktok':
          if (!mediaUrls || mediaUrls.length === 0) {
            throw new Error('TikTok requires a video file');
          }
          result = await TikTokService.publishFromUrl(
            account.access_token,
            post.content,
            mediaUrls[0]
          );
          break;

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      // Log success
      PublicationHistoryModel.create({
        post_id: postId,
        account_id: accountId,
        platform,
        status: 'published',
        platform_post_id: result.id,
        platform_url: result.url,
      });

      return { success: true, url: result.url };
    } catch (error: any) {
      console.error(`Failed to publish to ${platform}:`, error.message);

      // Log failure
      PublicationHistoryModel.create({
        post_id: postId,
        account_id: accountId,
        platform,
        status: 'failed',
        error_message: error.message,
      });

      return { success: false, error: error.message };
    }
  }
}
