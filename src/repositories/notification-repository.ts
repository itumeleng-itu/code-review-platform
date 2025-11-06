import { query } from '../database/db';
import { QueryResult } from 'pg'
import { DbNotification } from '../types/types';


export const getUserNotifications = async (userId: number): Promise<DbNotification[]> => {
    const text = `
        SELECT id, message, link_to, is_read, created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50;
    `;
    try {
        const result: QueryResult<DbNotification> = await query(text, [userId]);
        return result.rows;
    } catch (error) {
        console.error('Repo Error: getUserNotifications', error);
        throw new Error('Database query failed.');
    }
};