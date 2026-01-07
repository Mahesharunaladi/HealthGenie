export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'patient' | 'doctor' | 'admin';
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface RegisterData {
    email: string;
    password: string;
    full_name: string;
    role: 'patient' | 'doctor';
}
