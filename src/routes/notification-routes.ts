// src/routes/notification-routes.ts
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth-middleware'; 
import { getUserNotifications } from '../repositories/notification-repository';

const notificationRouter = Router();

notificationRouter.get('/:userId/notifications', authenticateToken, async (req: Request, res: Response) => {
    const targetUserId = parseInt(req.params.userId);
    const authenticatedUserId = (req as any).user.id;

    if (targetUserId !== authenticatedUserId) {
        return res.status(403).json({ message: 'Forbidden. You can only view your own notifications.' });
    }

    try {
        const notifications = await getUserNotifications(targetUserId);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve notifications.' });
    }
});

export default notificationRouter;