import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from "../types/types";

const JWT_SECRET= process.env.JWT_SECRET || process.env.JWT_FALLBACK;

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization; //getting the token from the header

    // the token header has a prefix of "Bearer"

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            message: 'Access Denied, no token provided'
        })
    }
    const token = authHeader.split(' ')[1];
    // split my token header and disregard the prefix "Bearer"

    try{
        const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;

        //Attach the decoded user data to the request object
        (req as any).user = decoded
        //Continue to the next middleware or route handler
        next()
    }
    catch(error){

        //error message for when token is wrong
        console.error("JWT verification failed", error);
        return res.status(403).json({message: 'Invalid or expired token'});
        
    }
}

export const authorizeRole = (requiredRoles: Array<'Submitter' | 'Reviewer'>) =>{
    return (req: Request, res: Response, next: NextFunction)=>{
        const userRole = (req as any).user?.role;

        if(!userRole) {
            return res.status(500).json({message:"User role not found on request"});
        }
        if(requiredRoles.includes(userRole)){
            next();
        }
        else{
            return res.status(403).json({ message: 'Forbidden. You do not have the required permissions.' });
        }
    }
}
