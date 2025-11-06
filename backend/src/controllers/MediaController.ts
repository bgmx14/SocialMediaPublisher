import { Request, Response } from 'express';
import { MediaModel } from '../models/MediaModel';
import { APIResponse, MediaType } from '../types';
import fs from 'fs';
import path from 'path';

export class MediaController {
  static async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        const response: APIResponse = {
          success: false,
          error: 'No file uploaded',
        };
        return res.status(400).json(response);
      }

      const file = req.file;

      // Determine media type
      let mediaType: MediaType = 'image';
      if (file.mimetype.startsWith('video/')) {
        mediaType = 'video';
      }

      // Save to database
      const media = MediaModel.create({
        filename: file.filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
        type: mediaType,
      });

      const response: APIResponse = {
        success: true,
        data: media,
        message: 'File uploaded successfully',
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

  static async getAll(req: Request, res: Response) {
    try {
      const media = MediaModel.getAll();

      const response: APIResponse = {
        success: true,
        data: media,
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
      const media = MediaModel.getById(id);

      if (!media) {
        const response: APIResponse = {
          success: false,
          error: 'Media not found',
        };
        return res.status(404).json(response);
      }

      // Delete file from disk
      const filePath = path.join(process.cwd(), 'uploads', media.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      MediaModel.delete(id);

      const response: APIResponse = {
        success: true,
        message: 'Media deleted successfully',
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
