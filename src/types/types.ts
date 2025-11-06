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

export type SubmissionStatus = 'pending' | 'in_review' | 'approved' | 'changes_requested';
export interface DbSubmission {
    id: number;
    title: string;
    code_content: string;
    project_id: number;
    submitter_id: number;
    status: SubmissionStatus;
    created_at: Date;
    updated_at: Date;
}
export interface DbComment {
    id: number;
    submission_id: number;
    author_id: number;
    comment_text: string;
    line_number: number | null;
    is_inline: boolean;
    created_at: Date;
    updated_at: Date;
}

export type ReviewAction = 'approved' | 'changes_requested';
export interface DbReview {
    id: number;
    submission_id: number;
    reviewer_id: number;
    action: ReviewAction;
    notes: string | null;
    created_at: Date;
}