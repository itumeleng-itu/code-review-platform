import { query } from '../database/db';
import { QueryResult } from 'pg';
import { DbComment } from '../types/types';


//add a commemt
export const addCommentToSubmission = async (submissionId: number,authorId: number, commentText: string, lineNumber?: number): Promise<DbComment> => {
    const isInline = lineNumber !== undefined;
    const text = `
        INSERT INTO comments (submission_id, author_id, comment_text, line_number, is_inline)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const params = [submissionId, authorId, commentText, lineNumber || null, isInline];

    try {
        const result: QueryResult<DbComment> = await query(text, params);
        return result.rows[0];
    } catch (error) {
        console.error('Repo Error: addCommentToSubmission', error);
        throw new Error('Database creation failed.');
    }
};

//list comment up for subnission
export const listCommentsForSubmission = async (submissionId: number): Promise<DbComment[]> =>{
    const text = 'SELECT * FROM comments WHERE submission_id = $1 ORDER BY created_at ASC;';
    const params=[submissionId]
    try{
        const result:QueryResult<DbComment> = await query(text, params);
        return result.rows;
    }
    catch (error) {
        console.error('Repo Error: listCommentsForSubmission', error);
        throw new Error('Database query failed.');
    }
}

//update the comment
export const updateComment = async (commentId:number, commentText: string): Promise<DbComment | null> =>{
    const text = `UPDATE comments 
        SET comment_text = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *;
    `;
    const params =[commentId, commentText]

    try{
        const result: QueryResult<DbComment> = await query ( text, params)
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    catch (error) {
        console.error('Repo Error: updateComment', error);
        throw new Error('Database update failed.');
    }
}

//delete comment
export const deleteComment = async( commentId : number) : Promise<boolean> =>{
    const text = 'DELETE FROM comments WHERE id = $1 RETURNING id;';
    const params= [commentId]
    try{
        const result = await query(text, params)
        return result.rowCount!>0
    }
    catch(error){
        console.error('Repo Error: deleteComment', error);
        throw new Error('Database deletion failed.');
    }
}

//find comment by userId
export const findCommentById= async(commentId:number): Promise<DbComment> =>{
    const text = 'SELECT * FROM comments WHERE id = $1;';
    const params = [commentId]

    try{
        const result :QueryResult<DbComment> = await query( text, params)
        return result.rows[0];
    }
    catch (error) {
        console.error('Repo Error: findCommentById', error);
        throw new Error('Database query failed.');
    }
}