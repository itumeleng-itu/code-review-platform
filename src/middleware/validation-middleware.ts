import { Request, Response, NextFunction } from 'express';
import { CustomError } from './error-handler';

export const validateBody = (requiredFields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const missingFields: string[] = [];
        
        for (const field of requiredFields) {
            if (!req.body[field] && req.body[field] !== 0 && req.body[field] !== false) {
                 missingFields.push(field);
            }
        }
        
        if (missingFields.length > 0) {
            const message = `Missing required fields: ${missingFields.join(', ')}`;
            return next(new CustomError(message, 400)); // 400 Bad Request
        }
        next();
    };
};