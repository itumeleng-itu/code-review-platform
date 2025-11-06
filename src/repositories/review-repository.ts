import { query } from '../database/db';
import { QueryResult } from 'pg';
import { SubmissionStatus,DbReview,ReviewAction } from '../types/types'; // Reuse submission status type


export const recordReviewAction = async (submissionId: number, reviewerId: number, action: ReviewAction, notes: string | null): Promise<DbReview> => {
    const text = `
        INSERT INTO reviews (submission_id, reviewer_id, action, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const params = [submissionId, reviewerId, action, notes];

    try {
        const result: QueryResult<DbReview> = await query(text, params);
        return result.rows[0];
    } catch (error) {
        console.error('Repo Error: recordReviewAction', error);
        throw new Error('Database creation failed.');
    }
};

export const getReviewHistory = async (submissionId: number): Promise<DbReview[]> => {
    const text = 'SELECT * FROM reviews WHERE submission_id = $1 ORDER BY created_at DESC;';
    
    try {
        const result: QueryResult<DbReview> = await query(text, [submissionId]);
        return result.rows;
    } catch (error) {
        console.error('Repo Error: getReviewHistory', error);
        throw new Error('Database query failed.');
    }
};