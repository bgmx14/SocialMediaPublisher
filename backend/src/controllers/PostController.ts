import { Request, Response } from 'express';
import { PostModel } from '../models/PostModel';
import { PublisherService } from '../services/PublisherService';
import { PublicationHistoryModel } from '../models/MediaModel';
import { APIResponse } from '../types';

export class PostController {
  static async getAll(req: Request, res: Response) {
    try {
      const status = req.query.status as any;
      const posts = PostModel.getAll(status);

      const response: APIResponse = {
        success: true,
        data: posts,
      };
      res.json(response);
    } catch (error: any) {
      const response: APIResponse = {
        success: false,
        error: error.message,
      };
      res.status(500).json(response);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const post = PostModel.getById(id);

      if (!post) {
        const response: APIResponse = {
          success: false,
          error: 'Post not found',
        };
        return res.status(404).json(response);
      }

      // Get publication history
      const history = PublicationHistoryModel.getByPostId(id);

      const response: APIResponse = {
        success: true,
        data: {
          ...post,
          publication_history: history,
        },
      };
      res.json(response);
    } catch (error: any) {
      const response: APIResponse = {
        success: false,
        error: error.message,
      };
      res.status(500).json(response);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const {
        title,
        content,
        media_urls,
        media_type,
        scheduled_at,
        status,
        platforms,
        account_ids,
        ai_generated,
      } = req.body;

      if (!title || !content) {
        const response: APIResponse = {
          success: false,
          error: 'Title and content are required',
        };
        return res.status(400).json(response);
      }

      const post = PostModel.create({
        title,
        content,
        media_urls: media_urls ? JSON.stringify(media_urls) : undefined,
        media_type,
        scheduled_at,
        published_at: undefined,
        status: status || 'draft',
        platforms: platforms ? JSON.stringify(platforms) : '[]',
        account_ids: account_ids ? JSON.stringify(account_ids) : '[]',
        ai_generated: ai_generated || false,
        error_message: undefined,
      });

      const response: APIResponse = {
        success: true,
        data: post,
        message: 'Post created successfully',
      };
      res.status(201).json(response);
    } catch (error: any) {
      const response: APIResponse = {
        success: false,
        error: error.message,
      };
      res.status(500).json(response);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const updates = { ...req.body };

      // Convert arrays to JSON strings
      if (updates.media_urls) {
        updates.media_urls = JSON.stringify(updates.media_urls);
      }
      if (updates.platforms) {
        updates.platforms = JSON.stringify(updates.platforms);
      }
      if (updates.account_ids) {
        updates.account_ids = JSON.stringify(updates.account_ids);
      }

      const post = PostModel.update(id, updates);

      if (!post) {
        const response: APIResponse = {
          success: false,
          error: 'Post not found',
        };
        return res.status(404).json(response);
      }

      const response: APIResponse = {
        success: true,
        data: post,
        message: 'Post updated successfully',
      };
      res.json(response);
    } catch (error: any) {
      const response: APIResponse = {
        success: false,
        error: error.message,
      };
      res.status(500).json(response);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const deleted = PostModel.delete(id);

      if (!deleted) {
        const response: APIResponse = {
          success: false,
          error: 'Post not found',
        };
        return res.status(404).json(response);
      }

      const response: APIResponse = {
        success: true,
        message: 'Post deleted successfully',
      };
      res.json(response);
    } catch (error: any) {
      const response: APIResponse = {
        success: false,
        error: error.message,
      };
      res.status(500).json(response);
    }
  }

  static async publish(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const post = PostModel.getById(id);

      if (!post) {
        const response: APIResponse = {
          success: false,
          error: 'Post not found',
        };
        return res.status(404).json(response);
      }

      const result = await PublisherService.publishToAllPlatforms(id);

      const response: APIResponse = {
        success: result.success,
        data: result.results,
        message: result.success
          ? 'Published successfully to all platforms'
          : 'Published with some failures',
      };

      res.json(response);
    } catch (error: any) {
      const response: APIResponse = {
        success: false,
        error: error.message,
      };
      res.status(500).json(response);
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const stats = PostModel.getStats();

      const response: APIResponse = {
        success: true,
        data: stats,
      };
      res.json(response);
    } catch (error: any) {
      const response: APIResponse = {
        success: false,
        error: error.message,
      };
      res.status(500).json(response);
    }
  }

  static async getByDateRange(req: Request, res: Response) {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        const response: APIResponse = {
          success: false,
          error: 'Start and end dates are required',
        };
        return res.status(400).json(response);
      }

      const posts = PostModel.getByDateRange(start as string, end as string);

      const response: APIResponse = {
        success: true,
        data: posts,
      };
      res.json(response);
    } catch (error: any) {
      const response: APIResponse = {
        success: false,
        error: error.message,
      };
      res.status(500).json(response);
    }
  }
}
