import { Request, Response } from 'express';
import crypto from 'crypto';
import { FacebookOAuthService } from '../services/oauth/FacebookOAuthService';
import { TwitterOAuthService } from '../services/oauth/TwitterOAuthService';
import { LinkedInOAuthService } from '../services/oauth/LinkedInOAuthService';
import { AccountModel } from '../models/AccountModel';
import { APIResponse } from '../types';

// Store PKCE verifiers and states temporarily (in production, use Redis)
const oauthStates = new Map<string, { platform: string; codeVerifier?: string; timestamp: number }>();

// Clean up old states every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of oauthStates.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) {
      oauthStates.delete(key);
    }
  }
}, 10 * 60 * 1000);

export class OAuthController {
  /**
   * Initialize OAuth flow - redirect to platform
   */
  static async initiateOAuth(req: Request, res: Response) {
    try {
      const { platform } = req.params;
      const state = crypto.randomBytes(16).toString('hex');
      const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/${platform}/callback`;

      let authUrl: string;
      let codeVerifier: string | undefined;

      switch (platform) {
        case 'facebook':
        case 'instagram':
          authUrl = FacebookOAuthService.getAuthUrl(redirectUri, state);
          oauthStates.set(state, { platform, timestamp: Date.now() });
          break;

        case 'twitter':
          const pkce = TwitterOAuthService.generatePKCE();
          codeVerifier = pkce.codeVerifier;
          authUrl = TwitterOAuthService.getAuthUrl(redirectUri, state, pkce.codeChallenge);
          oauthStates.set(state, { platform, codeVerifier, timestamp: Date.now() });
          break;

        case 'linkedin':
          authUrl = LinkedInOAuthService.getAuthUrl(redirectUri, state);
          oauthStates.set(state, { platform, timestamp: Date.now() });
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Unsupported platform',
          } as APIResponse);
      }

      res.redirect(authUrl);
    } catch (error: any) {
      console.error('OAuth initiation error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      } as APIResponse);
    }
  }

  /**
   * Handle OAuth callback from Facebook/Instagram
   */
  static async handleFacebookCallback(req: Request, res: Response) {
    try {
      const { code, state, error, error_description } = req.query;

      if (error) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/accounts?error=${error_description || error}`);
      }

      if (!code || !state) {
        throw new Error('Missing code or state parameter');
      }

      const storedState = oauthStates.get(state as string);
      if (!storedState) {
        throw new Error('Invalid state parameter');
      }

      oauthStates.delete(state as string);

      const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/facebook/callback`;

      // Exchange code for token
      const tokenData = await FacebookOAuthService.getAccessToken(code as string, redirectUri);

      // Get long-lived token
      const longLivedToken = await FacebookOAuthService.getLongLivedToken(tokenData.access_token);

      // Get user data
      const userData = await FacebookOAuthService.getUserData(longLivedToken.access_token);

      // Get user's pages
      const pages = await FacebookOAuthService.getUserPages(longLivedToken.access_token);

      // Store all pages and their Instagram accounts
      const accounts = [];

      for (const page of pages) {
        // Store Facebook Page
        const fbAccount = AccountModel.create({
          platform: 'facebook',
          account_name: page.name,
          account_id: page.id,
          access_token: page.access_token,
          is_active: true,
        });
        accounts.push(fbAccount);

        // Check for Instagram Business account
        const igAccounts = await FacebookOAuthService.getInstagramAccounts(
          page.id,
          page.access_token
        );

        for (const igAccount of igAccounts) {
          const igAccountModel = AccountModel.create({
            platform: 'instagram',
            account_name: igAccount.username,
            account_id: igAccount.id,
            access_token: page.access_token, // Instagram uses page token
            is_active: true,
          });
          accounts.push(igAccountModel);
        }
      }

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/accounts?success=true&count=${accounts.length}`);
    } catch (error: any) {
      console.error('Facebook callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/accounts?error=${encodeURIComponent(error.message)}`);
    }
  }

  /**
   * Handle OAuth callback from Twitter
   */
  static async handleTwitterCallback(req: Request, res: Response) {
    try {
      const { code, state, error, error_description } = req.query;

      if (error) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/accounts?error=${error_description || error}`);
      }

      if (!code || !state) {
        throw new Error('Missing code or state parameter');
      }

      const storedState = oauthStates.get(state as string);
      if (!storedState || !storedState.codeVerifier) {
        throw new Error('Invalid state parameter or missing code verifier');
      }

      oauthStates.delete(state as string);

      const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/twitter/callback`;

      // Exchange code for token
      const tokenData = await TwitterOAuthService.getAccessToken(
        code as string,
        redirectUri,
        storedState.codeVerifier
      );

      // Get user data
      const userData = await TwitterOAuthService.getUserData(tokenData.access_token);

      // Calculate token expiration
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      // Store account
      const account = AccountModel.create({
        platform: 'twitter',
        account_name: `@${userData.username}`,
        account_id: userData.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: expiresAt,
        is_active: true,
      });

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/accounts?success=true`);
    } catch (error: any) {
      console.error('Twitter callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/accounts?error=${encodeURIComponent(error.message)}`);
    }
  }

  /**
   * Handle OAuth callback from LinkedIn
   */
  static async handleLinkedInCallback(req: Request, res: Response) {
    try {
      const { code, state, error, error_description } = req.query;

      if (error) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/accounts?error=${error_description || error}`);
      }

      if (!code || !state) {
        throw new Error('Missing code or state parameter');
      }

      const storedState = oauthStates.get(state as string);
      if (!storedState) {
        throw new Error('Invalid state parameter');
      }

      oauthStates.delete(state as string);

      const redirectUri = `${req.protocol}://${req.get('host')}/api/oauth/linkedin/callback`;

      // Exchange code for token
      const tokenData = await LinkedInOAuthService.getAccessToken(code as string, redirectUri);

      // Get user data
      const userData = await LinkedInOAuthService.getUserData(tokenData.access_token);

      // Get user URN
      const userUrn = await LinkedInOAuthService.getUserUrn(tokenData.access_token);

      // Calculate token expiration
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      // Store account
      const account = AccountModel.create({
        platform: 'linkedin',
        account_name: userData.name,
        account_id: userUrn,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: expiresAt,
        is_active: true,
      });

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/accounts?success=true`);
    } catch (error: any) {
      console.error('LinkedIn callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/accounts?error=${encodeURIComponent(error.message)}`);
    }
  }

  /**
   * Refresh expired token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const account = AccountModel.getById(parseInt(accountId));

      if (!account) {
        return res.status(404).json({
          success: false,
          error: 'Account not found',
        } as APIResponse);
      }

      if (!account.refresh_token) {
        return res.status(400).json({
          success: false,
          error: 'No refresh token available',
        } as APIResponse);
      }

      let newTokenData;
      let expiresAt: string | undefined;

      switch (account.platform) {
        case 'twitter':
          newTokenData = await TwitterOAuthService.refreshToken(account.refresh_token);
          expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000).toISOString();
          break;

        case 'linkedin':
          newTokenData = await LinkedInOAuthService.refreshToken(account.refresh_token);
          expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000).toISOString();
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Token refresh not supported for this platform',
          } as APIResponse);
      }

      // Update account with new tokens
      const updatedAccount = AccountModel.update(parseInt(accountId), {
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token,
        token_expires_at: expiresAt,
      });

      res.json({
        success: true,
        data: updatedAccount,
        message: 'Token refreshed successfully',
      } as APIResponse);
    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      } as APIResponse);
    }
  }
}
