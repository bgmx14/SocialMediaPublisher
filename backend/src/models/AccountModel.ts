import db from '../config/database';
import { SocialAccount, SocialPlatform } from '../types';

export class AccountModel {
  static getAll(): SocialAccount[] {
    const stmt = db.prepare('SELECT * FROM social_accounts ORDER BY created_at DESC');
    return stmt.all() as SocialAccount[];
  }

  static getById(id: number): SocialAccount | undefined {
    const stmt = db.prepare('SELECT * FROM social_accounts WHERE id = ?');
    return stmt.get(id) as SocialAccount | undefined;
  }

  static getByPlatform(platform: SocialPlatform): SocialAccount[] {
    const stmt = db.prepare('SELECT * FROM social_accounts WHERE platform = ? AND is_active = 1');
    return stmt.all(platform) as SocialAccount[];
  }

  static create(account: Omit<SocialAccount, 'id' | 'created_at' | 'updated_at'>): SocialAccount {
    const stmt = db.prepare(`
      INSERT INTO social_accounts (
        platform, account_name, account_id, access_token,
        refresh_token, token_expires_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      account.platform,
      account.account_name,
      account.account_id,
      account.access_token,
      account.refresh_token || null,
      account.token_expires_at || null,
      account.is_active ? 1 : 0
    );

    return this.getById(result.lastInsertRowid as number)!;
  }

  static update(id: number, updates: Partial<SocialAccount>): SocialAccount | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.getById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE social_accounts
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.getById(id);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM social_accounts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static deactivate(id: number): boolean {
    const stmt = db.prepare('UPDATE social_accounts SET is_active = 0 WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
