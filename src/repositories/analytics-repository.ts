import { query } from '../database/db';
import { QueryResult } from 'pg';
import { ProjectStats } from '../types/types';



export const getProjectAnalytics = async (projectId: number): Promise<ProjectStats | null> => {
    const text = `
    WITH SubmissionStats AS (
        SELECT
            COUNT(id) AS total_submissions,
            COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approved_count
        FROM submissions
        WHERE project_id = $1
    ),
    
    ReviewTime AS (
        SELECT
            AVG(EXTRACT(EPOCH FROM r.created_at - s.created_at)) AS avg_time_seconds -- Time from submission to first approval/change request
        FROM submissions s
        JOIN reviews r ON s.id = r.submission_id
        WHERE s.project_id = $1 AND r.action IN ('approved', 'changes_requested')
    ),

    ActiveReviewers AS (
        SELECT COUNT(DISTINCT reviewer_id) AS active_reviewers
        FROM reviews
        WHERE submission_id IN (SELECT id FROM submissions WHERE project_id = $1)
    ),

    MostCommented AS (
        SELECT submission_id
        FROM comments
        WHERE submission_id IN (SELECT id FROM submissions WHERE project_id = $1)
        GROUP BY submission_id
        ORDER BY COUNT(id) DESC
        LIMIT 1
    )

    SELECT 
        ss.total_submissions,
        -- Percentage calculation
        CASE WHEN ss.total_submissions > 0 
             THEN ROUND((ss.approved_count * 100.0) / ss.total_submissions, 2)::text
             ELSE '0.00' END AS approved_percent,
        -- Format average time from seconds to a readable interval
        CASE WHEN rt.avg_time_seconds IS NOT NULL 
             THEN TO_CHAR(INTERVAL '1 second' * rt.avg_time_seconds, 'DD "days" HH24:MI:SS')
             ELSE 'N/A' END AS avg_review_time,
        ar.active_reviewers,
        mc.submission_id AS most_commented_submission_id
    FROM SubmissionStats ss, ReviewTime rt, ActiveReviewers ar
    LEFT JOIN MostCommented mc ON true;
    `;
    
    try {
        const result: QueryResult<ProjectStats> = await query(text, [projectId]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Repo Error: getProjectAnalytics', error);
        throw new Error('Database query failed.');
    }
};