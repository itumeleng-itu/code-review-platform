// src/services/auth-service.ts
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
// Import the repository functions to access the database
import { createUser, findUserByEmail } from '../repositories/user-repository';


const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_fallback_key';
const SALT_ROUNDS = 10; // Standard number of salt rounds for bcrypt

/**
 * Registers a new user, hashes the password, and generates a JWT.
 */
export const registerUser = async (username: string, email: string, password: string) => {
     const existingUser = await findUserByEmail(email);
     if (existingUser) {
         throw new Error('User already exists with that email.');
     }
    // Hash Password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    //  Create User in DB
    // This will throw if the email/username is a duplicate (handled by repository)
    const userId = await createUser(username, email, hashedPassword);
    
    //Generate JWT Token
    const token = jwt.sign({ id: userId, email: email, role: 'Submitter' }, JWT_SECRET, {
        expiresIn: '7d' // Token expires in 7 days
    });

    return { userId, token };
};

export const loginUser = async (email: string, password: string) => {
    // 1. Find User by Email
    const user = await findUserByEmail(email);
    if (!user) {
        // Use a generic error message to prevent revealing which piece of info was wrong
        throw new Error('Invalid credentials'); 
    }

    // 2. Compare Passwords
    // Compare the plain text password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials'); 
    }

    // 3. Generate JWT Token
    // Sign the token using the user's actual role from the database
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '7d'
    });

    return { userId: user.id, token };
};