// src/routes/project-routes.ts
import { Router, Request, Response } from 'express';
// Import security middleware
import { authenticateToken, authorizeRole } from '../middleware/auth-middleware'; 
// Import project repository functions
import { 
    createProject, 
    listProjectsByUserId, 
    addMemberToProject, 
    removeMemberFromProject 
} from '../repositories/project-repository';

const projectRouter = Router();

// Middleware to ensure the user is authenticated for all project routes
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

// POST /api/projects/:id/members - Assign users (Reviewers) to a project
// Only Reviewers (or the owner) should be able to do this, using the authorizeRole middleware
projectRouter.post('/:projectId/members', authorizeRole(['Reviewer']), async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    const { userId } = req.body; // ID of the user to be added

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required to add a member.' });
    }

    try {
        // In a real app, you would check if the authenticated user is the project owner before allowing this.
        await addMemberToProject(projectId, userId, 'Reviewer');
        res.status(200).json({ message: `User ${userId} added as Reviewer to project ${projectId}.` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add member to project.' });
    }
});

// DELETE /api/projects/:id/members/:userId - Remove a user from a project
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

export default projectRouter;