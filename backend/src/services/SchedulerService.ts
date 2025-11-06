import cron from 'node-cron';
import { PostModel } from '../models/PostModel';
import { PublisherService } from './PublisherService';
import { config } from '../config';

export class SchedulerService {
  private static task: cron.ScheduledTask | null = null;

  static start() {
    if (this.task) {
      console.log('⚠️  Scheduler already running');
      return;
    }

    // Run every minute to check for scheduled posts
    this.task = cron.schedule(config.scheduler.checkInterval, async () => {
      await this.checkAndPublishScheduledPosts();
    });

    console.log('✅ Scheduler started - checking every minute for scheduled posts');
  }

  static stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('⏹️  Scheduler stopped');
    }
  }

  static async checkAndPublishScheduledPosts() {
    try {
      const scheduledPosts = PostModel.getScheduled();

      if (scheduledPosts.length === 0) {
        return;
      }

      console.log(`📅 Found ${scheduledPosts.length} post(s) ready to publish`);

      for (const post of scheduledPosts) {
        console.log(`📤 Publishing post ${post.id}: "${post.title}"`);

        try {
          // Update status to prevent duplicate publishing
          PostModel.updateStatus(post.id, 'published');

          // Publish to all platforms
          const result = await PublisherService.publishToAllPlatforms(post.id);

          if (result.success) {
            console.log(`✅ Successfully published post ${post.id} to all platforms`);
          } else {
            console.log(
              `⚠️  Post ${post.id} published with some failures:`,
              result.results.filter((r) => !r.success)
            );
          }
        } catch (error: any) {
          console.error(`❌ Failed to publish post ${post.id}:`, error.message);
          PostModel.updateStatus(post.id, 'failed', error.message);
        }
      }
    } catch (error: any) {
      console.error('Scheduler error:', error.message);
    }
  }

  static async manualTrigger() {
    console.log('🔧 Manual scheduler trigger');
    await this.checkAndPublishScheduledPosts();
  }
}
