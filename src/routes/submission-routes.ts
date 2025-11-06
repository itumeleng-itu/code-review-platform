import { Router, Request, Response } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth-middleware'; 
import { createSubmission, findSubmissionById, listSubmissionsByProjectId, updateSubmissionStatus, deleteSubmission } from '../repositories/submission-repository';
import { listProjectsByUserId } from '../repositories/project-repository'; // To check membership

const submissionRouter = Router();

submissionRouter.use(authenticateToken);

const isProjectMember = async (userId: number, projectId: number): Promise<boolean> => {
    const memberProjects = await listProjectsByUserId(userId);
    return memberProjects.some(p => p.id === projectId);
};

//Create a submission
submissionRouter.post('/', async (req: Request, res: Response) => {
    const { title, code_content, project_id } = req.body;
    const submitterId = (req as any).user.id; 
    const projectId = parseInt(project_id);

    if (!title || !code_content || !project_id || isNaN(projectId)) {
        return res.status(400).json({ message: 'Missing required fields: title, code_content, project_id.' });
    }
    
    // Must be a member of the project to submit code to it
    if (!(await isProjectMember(submitterId, projectId))) {
        return res.status(403).json({ message: 'Forbidden. You are not a member of this project.' });
    }

    try {
        const newSubmission = await createSubmission(title, code_content, projectId, submitterId);
        res.status(201).json({ message: 'Submission created successfully.', submission: newSubmission });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to create submission.', error: error.message });
    }
});


//list submissions
submissionRouter.get('/project/:projectId', async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    const userId = (req as any).user.id;

    if (isNaN(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID.' });
    }

    //Must be a member of the project to view its submissions
    if (!(await isProjectMember(userId, projectId))) {
        return res.status(403).json({ message: 'Forbidden. You are not a member of this project.' });
    }

    try {
        const submissions = await listSubmissionsByProjectId(projectId);
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve submissions.' });
    }
});

//update a submission

