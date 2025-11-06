import { Request, Response, NextFunction } from 'express';

export class CustomError extends Error {
    statusCode: number;
    
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`ERROR CATCHED: ${req.method} ${req.originalUrl}`);
    console.error(err.stack || err.message);

    const statusCode = err instanceof CustomError ? err.statusCode : 
                       err.code === '23505' ? 409 : // PostgreSQL unique violation
                       res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message || 'An unexpected error occurred.',
        status: statusCode,
        timestamp: new Date().toISOString()
    });
};