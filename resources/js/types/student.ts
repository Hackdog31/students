export interface Student {
    id: number;
    First_name?: string;
    Last_name?: string;
    first_name: string;
    last_name: string;
    email: string;
    program: string;
    gender: string;
    birthday: string;
    year_level: number | string;
    age?: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface StudentFormData {
    first_name: string;
    last_name: string;
    email: string;
    program: string;
    gender: string;
    birthday: string;
    year_level: number | string;
}

