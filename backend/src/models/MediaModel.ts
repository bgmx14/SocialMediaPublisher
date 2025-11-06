import db from '../config/database';
import { Media, MediaType } from '../types';

export class MediaModel {
  static getAll(): Media[] {
    const stmt = db.prepare('SELECT * FROM media ORDER BY created_at DESC');
    return stmt.all() as Media[];
  }

  static getById(id: number): Media | undefined {
    const stmt = db.prepare('SELECT * FROM media WHERE id = ?');
    return stmt.get(id) as Media | undefined;
  }

  static getByType(type: MediaType): Media[] {
    const stmt = db.prepare('SELECT * FROM media WHERE type = ? ORDER BY created_at DESC');
    return stmt.all(type) as Media[];
  }

  static create(media: Omit<Media, 'id' | 'created_at'>): Media {
    const stmt = db.prepare(`
      INSERT INTO media (
        filename, original_name, mime_type, size, path, type
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      media.filename,
      media.original_name,
      media.mime_type,
      media.size,
      media.path,
      media.type
    );

    return this.getById(result.lastInsertRowid as number)!;
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM media WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export class PublicationHistoryModel {
  static create(data: {
    post_id: number;
    account_id: number;
    platform: string;
    status: string;
    platform_post_id?: string;
    platform_url?: string;
    error_message?: string;
  }) {
    const stmt = db.prepare(`
      INSERT INTO publication_history (
        post_id, account_id, platform, status,
        platform_post_id, platform_url, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      data.post_id,
      data.account_id,
      data.platform,
      data.status,
      data.platform_post_id || null,
      data.platform_url || null,
      data.error_message || null
    );
  }

  static getByPostId(postId: number) {
    const stmt = db.prepare(`
      SELECT ph.*, sa.account_name
      FROM publication_history ph
      JOIN social_accounts sa ON ph.account_id = sa.id
      WHERE ph.post_id = ?
      ORDER BY ph.published_at DESC
    `);
    return stmt.all(postId);
  }

  static getAll(limit = 100) {
    const stmt = db.prepare(`
      SELECT ph.*, p.title as post_title, sa.account_name
      FROM publication_history ph
      JOIN posts p ON ph.post_id = p.id
      JOIN social_accounts sa ON ph.account_id = sa.id
      ORDER BY ph.published_at DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }
}
