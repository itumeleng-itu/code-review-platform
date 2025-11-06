// src/routes/comment-routes.ts
import { Router, Request, Response } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth-middleware'; 
import { addCommentToSubmission, listCommentsForSubmission, updateComment, deleteComment, findCommentById } from '../repositories/comment-repository';

const commentRouter = Router();

// Apply authentication to all comment routes
commentRouter.use(authenticateToken); 

// Add comment to submission
commentRouter.post('/:submissionId/comments', authorizeRole(['Reviewer']), async (req: Request, res: Response) => {
    const submissionId = parseInt(req.params.submissionId);
    const authorId = (req as any).user.id;
    const { comment_text, line_number } = req.body;

    if (!comment_text) {
        return res.status(400).json({ message: 'Comment text is required.' });
    }

    try {
        const newComment = await addCommentToSubmission(submissionId, authorId, comment_text, line_number);
        res.status(201).json({ message: 'Comment added successfully.', comment: newComment });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to add comment.', error: error.message });
    }
});

// List comments for submission
commentRouter.get('/:submissionId/comments', async (req: Request, res: Response) => {
    const submissionId = parseInt(req.params.submissionId);

    try {
        const comments = await listCommentsForSubmission(submissionId);
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve comments.' });
    }
});

// Update comment
commentRouter.put('/:id', authorizeRole(['Reviewer']), async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.id);
    const authorId = (req as any).user.id;
    const { comment_text } = req.body;

    if (!comment_text) {
        return res.status(400).json({ message: 'Comment text is required for update.' });
    }

    try {
        const existingComment = await findCommentById(commentId);
        if (!existingComment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        
        if (existingComment.author_id !== authorId) {
            return res.status(403).json({ message: 'Forbidden. You can only update your own comments.' });
        }

        const updatedComment = await updateComment(commentId, comment_text);
        res.status(200).json({ message: 'Comment updated successfully.', comment: updatedComment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update comment.' });
    }
});

//Delete comment
commentRouter.delete('/:id', authorizeRole(['Reviewer']), async (req: Request, res: Response) => {
    const commentId = parseInt(req.params.id);
    const userId = (req as any).user.id;

    try {
        const existingComment = await findCommentById(commentId);
        if (!existingComment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        if (existingComment.author_id !== userId) {
            return res.status(403).json({ message: 'Forbidden. You can only delete your own comments.' });
        }

        const success = await deleteComment(commentId);
        if (success) {
            res.status(200).json({ message: 'Comment deleted successfully.' });
        } else {
            res.status(500).json({ message: 'Deletion failed unexpectedly.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete comment.' });
    }
});

export default commentRouter;