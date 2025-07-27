export type UserRoles = 'patient' | 'doctor' | 'nurse' | 'admin';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRoles;
}
