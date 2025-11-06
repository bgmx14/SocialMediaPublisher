import { Request, Response } from 'express';
import { AccountModel } from '../models/AccountModel';
import { APIResponse } from '../types';

export class AccountController {
  static async getAll(req: Request, res: Response) {
    try {
      const accounts = AccountModel.getAll();
      const response: APIResponse = {
        success: true,
        data: accounts,
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
      const account = AccountModel.getById(id);

      if (!account) {
        const response: APIResponse = {
          success: false,
          error: 'Account not found',
        };
        return res.status(404).json(response);
      }

      const response: APIResponse = {
        success: true,
        data: account,
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
      const { platform, account_name, account_id, access_token, refresh_token, token_expires_at } =
        req.body;

      if (!platform || !account_name || !account_id || !access_token) {
        const response: APIResponse = {
          success: false,
          error: 'Missing required fields',
        };
        return res.status(400).json(response);
      }

      const account = AccountModel.create({
        platform,
        account_name,
        account_id,
        access_token,
        refresh_token,
        token_expires_at,
        is_active: true,
      });

      const response: APIResponse = {
        success: true,
        data: account,
        message: 'Account connected successfully',
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
      const updates = req.body;

      const account = AccountModel.update(id, updates);

      if (!account) {
        const response: APIResponse = {
          success: false,
          error: 'Account not found',
        };
        return res.status(404).json(response);
      }

      const response: APIResponse = {
        success: true,
        data: account,
        message: 'Account updated successfully',
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
      const deleted = AccountModel.delete(id);

      if (!deleted) {
        const response: APIResponse = {
          success: false,
          error: 'Account not found',
        };
        return res.status(404).json(response);
      }

      const response: APIResponse = {
        success: true,
        message: 'Account deleted successfully',
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

  static async getByPlatform(req: Request, res: Response) {
    try {
      const platform = req.params.platform as any;
      const accounts = AccountModel.getByPlatform(platform);

      const response: APIResponse = {
        success: true,
        data: accounts,
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
