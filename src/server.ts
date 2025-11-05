import express from "express";
import dotenv from "dotenv";
import { dbConnection } from "../src/database/db";
import authRouter from './routes/auth-routes';
import userRouter from './routes/user-routes';


dotenv.config()

const app = express();
const PORT = process.env.DB_PORT || 5000;

const startServer = async () => {
    await dbConnection();
    app.use(express.json());

    app.use('/api/auth', authRouter);
    app.use('/api/users', userRouter);

    app.listen(PORT, () => {
        console.log(`🚀 Server listening on port ${PORT}`);
    });
}

startServer()