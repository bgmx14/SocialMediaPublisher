import { Request, Response } from 'express';
import { PublicationHistoryModel } from '../models/MediaModel';
import { APIResponse } from '../types';

export class HistoryController {
  static async getAll(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const history = PublicationHistoryModel.getAll(limit);

      const response: APIResponse = {
        success: true,
        data: history,
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

  static async getByPostId(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.postId);
      const history = PublicationHistoryModel.getByPostId(postId);

      const response: APIResponse = {
        success: true,
        data: history,
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
