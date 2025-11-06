import express from "express";
import dotenv from "dotenv";
import { dbConnection } from "../src/database/db";
import authRouter from './routes/auth-routes';
import userRouter from './routes/user-routes';
import projectRouter from './routes/project-routes';
import submissionRouter from './routes/submission-routes';
import commentRouter from "./routes/comment-routes";
import reviewRouter from "./routes/review-routes";


dotenv.config()

const app = express();
const PORT = process.env.DB_PORT || 5000;

const startServer = async () => {
    await dbConnection();
    app.use(express.json());

    app.use('/api/auth', authRouter);
    app.use('/api/users', userRouter);
    app.use('/api/projects', projectRouter);
    app.use('/api/submissions',submissionRouter)
    app.use('/api/comments', commentRouter);
    app.use('/api/submissions', reviewRouter);

    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

startServer()