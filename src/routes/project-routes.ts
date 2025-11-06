import { Router, Request, Response } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth-middleware'; 
import { getProjectAnalytics } from '../repositories/analytics-repository';
import { createProject, listProjectsByUserId, addMemberToProject, removeMemberFromProject } from '../repositories/project-repository';

const projectRouter = Router();

projectRouter.use(authenticateToken); 

// POST /api/projects - Create a project
projectRouter.post('/', async (req: Request, res: Response) => {
    const { name, description } = req.body;
    // The authenticated user is automatically the owner
    const ownerId = (req as any).user.id; 

    if (!name || !description) {
        return res.status(400).json({ message: 'Project name and description are required.' });
    }

    try {
        const newProject = await createProject(name, description, ownerId);
        res.status(201).json({ 
            message: 'Project created successfully. Owner added as Reviewer.', 
            project: newProject 
        });
    } catch (error: any) {
        const statusCode = error.message.includes('exists') ? 409 : 500;
        res.status(statusCode).json({ message: error.message });
    }
});

// GET /api/projects - List projects (only those the user is a member of)
projectRouter.get('/', async (req: Request, res: Response) => {
    const userId = (req as any).user.id; 

    try {
        const projects = await listProjectsByUserId(userId);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve projects.' });
    }
});

// Assign users (Reviewers) to a project
projectRouter.post('/:projectId/members', authorizeRole(['Reviewer']), async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    const { userId } = req.body; // ID of the user to be added

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required to add a member.' });
    }

    try {
        await addMemberToProject(projectId, userId, 'Reviewer');
        res.status(200).json({ message: `User ${userId} added as Reviewer to project ${projectId}.` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add member to project.' });
    }
});

//Remove a user from a project
projectRouter.delete('/:projectId/members/:userId', authorizeRole(['Reviewer']), async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    const userId = parseInt(req.params.userId);

    try {
        const success = await removeMemberFromProject(projectId, userId);
        if (success) {
            res.status(200).json({ message: `Member ${userId} removed from project ${projectId}.` });
        } else {
            res.status(404).json({ message: 'Membership not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove member.' });
    }
});


projectRouter.get('/:projectId/stats', authorizeRole(['Reviewer']), async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);


    try {
        const stats = await getProjectAnalytics(projectId);
        if (!stats) {
             return res.status(404).json({ message: 'Project not found or no data available.' });
        }
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve project analytics.' });
    }
});

export default projectRouter;