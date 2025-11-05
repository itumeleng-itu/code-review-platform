export interface DbUser {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    role: 'Submitter' | 'Reviewer';
    full_name?: string;
}

export interface JwtPayload {
    id: number;
    email: string;
    role: 'Submitter' | 'Reviewer';
}