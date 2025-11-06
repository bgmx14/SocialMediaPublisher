import { Request, Response } from 'express';
import { OpenAIService } from '../services/OpenAIService';
import { APIResponse } from '../types';

export class AIController {
  static async generateCaption(req: Request, res: Response) {
    try {
      const { prompt, context, platform, tone, max_length } = req.body;

      const caption = await OpenAIService.generateCaption({
        prompt,
        context,
        platform,
        tone,
        max_length,
      });

      const response: APIResponse = {
        success: true,
        data: { caption },
        message: 'Caption generated successfully',
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

  static async enhanceContent(req: Request, res: Response) {
    try {
      const { content, platform } = req.body;

      if (!content) {
        const response: APIResponse = {
          success: false,
          error: 'Content is required',
        };
        return res.status(400).json(response);
      }

      const enhancedContent = await OpenAIService.enhanceContent(content, platform);

      const response: APIResponse = {
        success: true,
        data: { content: enhancedContent },
        message: 'Content enhanced successfully',
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

  static async generateHashtags(req: Request, res: Response) {
    try {
      const { content, count = 5 } = req.body;

      if (!content) {
        const response: APIResponse = {
          success: false,
          error: 'Content is required',
        };
        return res.status(400).json(response);
      }

      const hashtags = await OpenAIService.generateHashtags(content, count);

      const response: APIResponse = {
        success: true,
        data: { hashtags },
        message: 'Hashtags generated successfully',
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
