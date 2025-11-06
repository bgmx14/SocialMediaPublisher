import db from '../config/database';
import { Post, PostStatus } from '../types';

export class PostModel {
  static getAll(status?: PostStatus): Post[] {
    let query = 'SELECT * FROM posts';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params) as Post[];
  }

  static getById(id: number): Post | undefined {
    const stmt = db.prepare('SELECT * FROM posts WHERE id = ?');
    return stmt.get(id) as Post | undefined;
  }

  static getScheduled(): Post[] {
    const stmt = db.prepare(`
      SELECT * FROM posts
      WHERE status = 'scheduled'
      AND scheduled_at <= datetime('now')
      ORDER BY scheduled_at ASC
    `);
    return stmt.all() as Post[];
  }

  static getByDateRange(startDate: string, endDate: string): Post[] {
    const stmt = db.prepare(`
      SELECT * FROM posts
      WHERE (scheduled_at BETWEEN ? AND ?)
      OR (published_at BETWEEN ? AND ?)
      ORDER BY COALESCE(scheduled_at, published_at) ASC
    `);
    return stmt.all(startDate, endDate, startDate, endDate) as Post[];
  }

  static create(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Post {
    const stmt = db.prepare(`
      INSERT INTO posts (
        title, content, media_urls, media_type, scheduled_at,
        published_at, status, platforms, account_ids, ai_generated, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      post.title,
      post.content,
      post.media_urls || null,
      post.media_type || null,
      post.scheduled_at || null,
      post.published_at || null,
      post.status,
      post.platforms,
      post.account_ids,
      post.ai_generated ? 1 : 0,
      post.error_message || null
    );

    return this.getById(result.lastInsertRowid as number)!;
  }

  static update(id: number, updates: Partial<Post>): Post | undefined {
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
      UPDATE posts
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.getById(id);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static updateStatus(id: number, status: PostStatus, errorMessage?: string): Post | undefined {
    const updates: Partial<Post> = { status };

    if (status === 'published') {
      updates.published_at = new Date().toISOString();
    }

    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    return this.update(id, updates);
  }

  static getStats() {
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM posts
    `);
    return stmt.get();
  }
}
