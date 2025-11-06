// src/repositories/project-repository.ts
import { query } from '../database/db';
import { QueryResult } from 'pg';

export interface DbProject {
    id: number;
    name: string;
    description: string;
    owner_id: number;
    created_at: Date;
}

/**
 * Creates a new project.
 */
export const createProject = async (name: string, description: string, ownerId: number): Promise<DbProject> => {
    const text = `
        INSERT INTO projects (name, description, owner_id)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, owner_id, created_at;
    `;
    const params = [name, description, ownerId];

    try {
        const result: QueryResult<DbProject> = await query(text, params);
        // Also automatically add the owner as a project member (as a Reviewer by default)
        await addMemberToProject(result.rows[0].id, ownerId, 'Reviewer'); 
        
        return result.rows[0];
    } catch (error: any) {
        console.error('Repo Error: createProject', error);
        if (error.code === '23505') {
            throw new Error('Project name already exists.');
        }
        throw new Error('Database creation failed.');
    }
};

/**
 * Retrieves all projects a user is a member of.
 */
export const listProjectsByUserId = async (userId: number): Promise<DbProject[]> => {
    const text = `
        SELECT p.id, p.name, p.description, p.owner_id, p.created_at
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = $1
        ORDER BY p.name;
    `;
    
    try {
        const result: QueryResult<DbProject> = await query(text, [userId]);
        return result.rows;
    } catch (error) {
        console.error('Repo Error: listProjectsByUserId', error);
        throw new Error('Database query failed.');
    }
};

/**
 * Assigns a user (Reviewer) to a project.
 */
export const addMemberToProject = async (projectId: number, userId: number, role: 'Submitter' | 'Reviewer'): Promise<void> => {
    // Only Reviewer role is needed here for assignment, as submitters are implied by the Submissions.
    // However, we'll keep the project_role column for flexibility.
    const text = `
        INSERT INTO project_members (project_id, user_id, project_role)
        VALUES ($1, $2, $3)
        ON CONFLICT (project_id, user_id) DO NOTHING; -- Prevents duplicate membership
    `;
    const params = [projectId, userId, role];

    try {
        await query(text, params);
    } catch (error) {
        console.error('Repo Error: addMemberToProject', error);
        throw new Error('Failed to add member to project.');
    }
};

/**
 * Removes a user from a project's members list.
 */
export const removeMemberFromProject = async (projectId: number, userId: number): Promise<boolean> => {
    const text = 'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING user_id;';
    const params = [projectId, userId];
    
    try {
        const result = await query(text, params);
        // Returns true if a row was deleted, false otherwise
        return result.rowCount! > 0;
    } catch (error) {
        console.error('Repo Error: removeMemberFromProject', error);
        throw new Error('Failed to remove member from project.');
    }
};