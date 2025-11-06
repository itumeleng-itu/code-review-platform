// src/routes/review-routes.ts
import { Router, Request, Response } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth-middleware'; 
import { updateSubmissionStatus, findSubmissionById  } from '../../src/repositories/submission-repository'
import { recordReviewAction, getReviewHistory } from '../repositories/review-repository';
import {ReviewAction}  from '../types/types'


const reviewRouter = Router();

// Apply authentication and restrict all review actions to Reviewers
reviewRouter.use(authenticateToken, authorizeRole(['Reviewer'])); 

// Helper function to handle the core review logic
const handleReviewAction = async (req: Request, res: Response, action: ReviewAction) => {
    const submissionId = parseInt(req.params.submissionId);
    const reviewerId = (req as any).user.id;
    const { notes } = req.body;
    
    // 1. Get current submission status
    const submission = await findSubmissionById(submissionId);
    if (!submission) {
        return res.status(404).json({ message: 'Submission not found.' });
    }

    try {
        // 2. Determine the new submission status based on the action
        const newStatus = action === 'approved' ? 'approved' : 'changes_requested';

        // 3. Update the submission status
        await updateSubmissionStatus(submissionId, newStatus);

        // 4. Record the review action history
        const reviewRecord = await recordReviewAction(submissionId, reviewerId, action, notes || null);
        
        res.status(200).json({ 
            message: `Submission marked as ${newStatus}.`,
            review_id: reviewRecord.id,
            new_status: newStatus
        });
    } catch (error: any) {
        res.status(500).json({ message: `Failed to process review action: ${action}.`, error: error.message });
    }
};

// POST /api/submissions/:id/approve - Approve submission
reviewRouter.post('/:submissionId/approve', async (req: Request, res: Response) => {
    await handleReviewAction(req, res, 'approved');
});

reviewRouter.post('/:submissionId/request-changes', async (req: Request, res: Response) => {
    await handleReviewAction(req, res, 'changes_requested');
});

reviewRouter.get('/:submissionId/reviews', async (req: Request, res: Response) => {
    const submissionId = parseInt(req.params.submissionId);

    try {
        const history = await getReviewHistory(submissionId);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve review history.' });
    }
});


export default reviewRouter;