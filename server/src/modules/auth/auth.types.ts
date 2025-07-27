export interface RegisterInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin';
