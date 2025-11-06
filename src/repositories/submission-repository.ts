import { query } from '../database/db';
import { QueryResult } from 'pg';
import { SubmissionStatus } from '../types/types';
import { DbSubmission } from '../types/types';



//creating a submission
export const createSubmission = async (title: string, codeContent: string, projectId: number, submitterId: number): Promise<DbSubmission> =>{
    const text = `
        INSERT INTO submissions (title, code_content, project_id, submitter_id, status)
        VALUES ($1, $2, $3, $4, 'pending') 
        RETURNING *`;
    const params =[title,codeContent,projectId,submitterId];

    if(!params.every(param => param !== undefined && param !== null)) {
        throw new Error('missing parameters')
    }
    
    const result : QueryResult<DbSubmission> =await query(text, params);

    if(!result.rows[0]){
        throw new Error('Failed to create submission');
    }
    console.log('Submission Created');
    return result.rows[0];
}

//list submissions in a project
export const listSubmissionsByProjectId= async(projectId: number):Promise<DbSubmission[]>=>{
    const text = `
        SELECT id, title, project_id, submitter_id, status, created_at
        FROM submissions 
        WHERE project_id = $1
        ORDER BY created_at DESC;
    `;
    const params =[projectId]

    try{
        const result : QueryResult<DbSubmission> =await query(text, params);
        return result.rows;
    }catch(error){
        console.error('Repo Error: operation failed', error);
        throw new Error(`Failed to fetch submissions for project id: ${projectId}`);
    }
}

//finding a submission by id
export const findSubmissionById = async (submissionId:number): Promise<DbSubmission> =>{
    const text = `
        SELECT id, title, code_content, project_id, submitter_id, status, created_at, updated_at
        FROM submissions 
        WHERE id = $1;
    `;
    const params = [submissionId]

    try{
        const result: QueryResult<DbSubmission> = await query(text, params);
        return result.rows[0] || null
    }
    catch(error){
        console.error('Repo Error: operation failed', error);
        throw new Error(`Failed to fetch submissions id: ${submissionId}`);
    }
}

//updating the status of a submission
export const updateSubmissionStatus = async (submissionId:number) : Promise<DbSubmission> =>{
    const text = ``;
}